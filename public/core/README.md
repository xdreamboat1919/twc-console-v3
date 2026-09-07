# Legacy application

The previous buildless application, preserved verbatim so migration can be
verified against real behaviour.

**Do not edit these files.** Follow `docs/MIGRATION.md`: reformat a module,
extract its pure logic to `src/domain`, rewrite the feature, then delete the
legacy file in the same commit that removes its script tag.

Serve with `python3 -m http.server 8000` from this directory to compare
behaviour side by side during a migration.
