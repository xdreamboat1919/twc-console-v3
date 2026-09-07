/* Durable, device-local workspace persistence for the private Codespaces console. */
var TWC = window.TWC || {};
TWC.store = (() => {
  var DB_NAME = 'twc-campaign-console';
  var STORE_NAME = 'snapshots';
  var DB_VERSION = 1;
  var RESCUE_KEY = 'twc-console-rescue-v8';
  var saveTimer = null;
  var saving = false;
  var queued = false;
  var hydrating = false;
  var lastSnapshot = '';

  function setStatus(state, label, time) {
    var el = document.getElementById('save-state'),
      stamp = document.getElementById('save-time');
    if (el) {
      el.className = 'save-state' + (state ? ' ' + state : '');
      el.textContent = label || 'Saved';
    }
    if (stamp) stamp.textContent = time || '';
  }
  function openDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      var request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        var db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME))
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error || new Error('Could not open workspace database'));
      };
    });
  }
  function transact(mode, work) {
    return openDb().then(
      (db) =>
        new Promise((resolve, reject) => {
          var tx = db.transaction(STORE_NAME, mode),
            store = tx.objectStore(STORE_NAME),
            result;
          try {
            result = work(store);
          } catch (error) {
            db.close();
            reject(error);
            return;
          }
          tx.oncomplete = () => {
            db.close();
            resolve(result && result.result !== undefined ? result.result : result);
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error || new Error('Workspace transaction failed'));
          };
          tx.onabort = () => {
            db.close();
            reject(tx.error || new Error('Workspace transaction aborted'));
          };
        }),
    );
  }
  function get(key) {
    return openDb().then(
      (db) =>
        new Promise((resolve, reject) => {
          var tx = db.transaction(STORE_NAME, 'readonly'),
            request = tx.objectStore(STORE_NAME).get(key);
          request.onsuccess = () => {
            db.close();
            resolve(request.result || null);
          };
          request.onerror = () => {
            db.close();
            reject(request.error);
          };
        }),
    );
  }
  function put(record) {
    return transact('readwrite', (store) => store.put(record));
  }
  function remove(key) {
    return transact('readwrite', (store) => store.delete(key));
  }
  function rescueWrite(state) {
    if (!state) return;
    try {
      var value = JSON.stringify(state);
      if (value.length < 4400000) localStorage.setItem(RESCUE_KEY, value);
    } catch (error) {}
  }
  function rescueRead() {
    try {
      var value = localStorage.getItem(RESCUE_KEY);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }
  function stampLabel(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  }
  function snapshot() {
    if (typeof captureSessionState !== 'function') return null;
    var state = captureSessionState();
    state.savedAt = new Date().toISOString();
    state.storage = 'indexeddb';
    return state;
  }
  function signature(state) {
    var copy = Object.assign({}, state);
    delete copy.savedAt;
    delete copy.storage;
    return JSON.stringify(copy);
  }
  function pruneBackups() {
    return openDb()
      .then(
        (db) =>
          new Promise((resolve) => {
            var tx = db.transaction(STORE_NAME, 'readwrite'),
              store = tx.objectStore(STORE_NAME),
              request = store.getAllKeys();
            request.onsuccess = () => {
              var keys = (request.result || [])
                .filter((key) => String(key).indexOf('backup:') === 0)
                .sort()
                .reverse();
              keys.slice(20).forEach((key) => {
                store.delete(key);
              });
            };
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => {
              db.close();
              resolve();
            };
          }),
      )
      .catch(() => {});
  }
  async function persist(reason, forceBackup) {
    if (hydrating) return false;
    if (saving) {
      queued = true;
      return false;
    }
    var state = snapshot();
    if (!state) return false;
    var serialized = '';
    try {
      serialized = signature(state);
    } catch (error) {
      setStatus('error', 'Save failed', '');
      return false;
    }
    if (serialized === lastSnapshot && !forceBackup) {
      setStatus('', 'Saved', stampLabel(state.savedAt));
      return true;
    }
    saving = true;
    setStatus('saving', 'Saving', '');
    try {
      await put({
        key: 'current',
        savedAt: state.savedAt,
        reason: reason || 'autosave',
        state: state,
      });
      var lastBackup = await get('backup:last');
      var due =
        forceBackup ||
        !lastBackup ||
        Date.now() - new Date(lastBackup.savedAt).getTime() > 15 * 60 * 1000;
      if (due) {
        var backupKey = 'backup:' + state.savedAt;
        await put({
          key: backupKey,
          savedAt: state.savedAt,
          reason: reason || 'autosave',
          state: state,
        });
        await put({ key: 'backup:last', savedAt: state.savedAt, backupKey: backupKey });
        pruneBackups();
      }
      rescueWrite(state);
      lastSnapshot = serialized;
      setStatus('', 'Saved', stampLabel(state.savedAt));
      return true;
    } catch (error) {
      rescueWrite(state);
      setStatus('error', 'Saved to rescue copy', stampLabel(state.savedAt));
      return false;
    } finally {
      saving = false;
      if (queued) {
        queued = false;
        setTimeout(() => {
          persist('queued change');
        }, 20);
      }
    }
  }
  function schedule(reason) {
    if (hydrating) return;
    clearTimeout(saveTimer);
    setStatus('saving', 'Changes pending', '');
    saveTimer = setTimeout(() => {
      persist(reason || 'workspace change');
    }, 650);
  }
  async function restore() {
    hydrating = true;
    setStatus('saving', 'Loading workspace', '');
    try {
      var record = await get('current'),
        state = record && record.state ? record.state : rescueRead();
      if (state && typeof applySessionState === 'function') {
        applySessionState(state);
        lastSnapshot = signature(state);
        setStatus('', 'Restored', stampLabel(state.savedAt || (record && record.savedAt)));
        return true;
      }
      setStatus('', 'New workspace', '');
      return false;
    } catch (error) {
      var rescue = rescueRead();
      if (rescue && typeof applySessionState === 'function') {
        applySessionState(rescue);
        lastSnapshot = signature(rescue);
        setStatus('', 'Rescue restored', stampLabel(rescue.savedAt));
        return true;
      }
      setStatus('error', 'Storage unavailable', '');
      return false;
    } finally {
      hydrating = false;
    }
  }
  async function backups() {
    try {
      return await openDb().then(
        (db) =>
          new Promise((resolve) => {
            var tx = db.transaction(STORE_NAME, 'readonly'),
              request = tx.objectStore(STORE_NAME).getAll();
            request.onsuccess = () => {
              db.close();
              resolve(
                (request.result || [])
                  .filter((item) => String(item.key).indexOf('backup:20') === 0)
                  .sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
              );
            };
            request.onerror = () => {
              db.close();
              resolve([]);
            };
          }),
      );
    } catch (error) {
      return [];
    }
  }
  async function restoreBackup(key) {
    var record = await get(key);
    if (!record || !record.state || typeof applySessionState !== 'function') return false;
    hydrating = true;
    applySessionState(record.state);
    hydrating = false;
    if (typeof renderAll === 'function') renderAll();
    if (typeof renderProductionAll === 'function') renderProductionAll();
    await persist('backup restored', true);
    return true;
  }
  function watch() {
    document.addEventListener(
      'input',
      (event) => {
        if (event.target && /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName))
          schedule('field change');
      },
      true,
    );
    document.addEventListener(
      'change',
      () => {
        schedule('field change');
      },
      true,
    );
    document.addEventListener(
      'click',
      (event) => {
        if (event.target && event.target.closest('button') && !event.target.closest('[data-v]'))
          setTimeout(() => {
            schedule('interaction');
          }, 0);
      },
      true,
    );
    window.addEventListener('beforeunload', () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
        rescueWrite(snapshot());
      }
    });
    setInterval(() => {
      persist('periodic checkpoint');
    }, 60000);
  }
  return {
    restore: restore,
    schedule: schedule,
    saveNow: (reason) => {
      clearTimeout(saveTimer);
      return persist(reason || 'manual save', true);
    },
    watch: watch,
    backups: backups,
    restoreBackup: restoreBackup,
    removeBackup: remove,
    isHydrating: () => hydrating,
  };
})();
window.TWC = TWC;
