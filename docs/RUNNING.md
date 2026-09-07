# Running a release build

This is a static application. It needs to be served over HTTP, not opened from
the file system, because browsers block IndexedDB on `file://` origins.

```bash
tar -xzf console-vX.Y.Z.tar.gz -C console
cd console
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/`.

## Browser storage is per origin

A new Codespace URL is a new origin with empty storage. **Export a session before
recreating a Codespace, changing machines or clearing browser data**, and import
it on the other side.

## Privacy

Keep the repository and the forwarded port private. Do not enable GitHub Pages.
Never place platform access tokens, customer lists or health information in
browser JavaScript or in git history.
