/*
 * Manual-first data boundary. Future Meta, Google, Shopify, or warehouse
 * adapters can register here without changing feature calculations or views.
 */
var TWC = window.TWC || {};
TWC.dataSource = (() => {
  var adapters = {
    manual: {
      captureFields: (ids) => {
        var fields = {};
        ids.forEach((id) => {
          var el = $(id);
          if (el) fields[id] = el.value;
        });
        return fields;
      },
      applyFields: (ids, fields) => {
        ids.forEach((id) => {
          var el = $(id);
          if (el && fields[id] !== undefined) el.value = fields[id];
        });
      },
    },
  };
  var active = 'manual';

  return {
    current: () => active,
    register: (name, adapter) => {
      if (
        !name ||
        !adapter ||
        typeof adapter.captureFields !== 'function' ||
        typeof adapter.applyFields !== 'function'
      ) {
        throw new Error('A data adapter must implement captureFields and applyFields.');
      }
      adapters[name] = adapter;
    },
    use: (name) => {
      if (!adapters[name]) throw new Error('Unknown data adapter: ' + name);
      active = name;
    },
    captureFields: (ids) => adapters[active].captureFields(ids),
    applyFields: (ids, fields) => adapters[active].applyFields(ids, fields || {}),
  };
})();
window.TWC = TWC;
