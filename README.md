# ScratchMobile

A mobile-first rework of the Scratch editor: full .sb3 compatibility, tabbed Code/Stage views instead of the cramped desktop layout, and touch-friendly block dragging.

## How it works
We don't fork `scratch-gui`'s internals. We clone it fresh as source (`vendor/scratch-gui`, gitignored, fetched at setup/CI time) and wrap its exported `GUI` React component in our own tab UI (`src/app.jsx`). The Code/Stage split is done by locating scratch-gui's rendered stage canvas at runtime and toggling visibility of its structural sibling panes -- see the comment block at the top of `src/app.jsx` for the reasoning and the known fragility of that approach.

## Local setup
```
git clone https://github.com/scratchfoundation/scratch-gui.git vendor/scratch-gui
cd vendor/scratch-gui && npm ci
cd ../..
npm install   # postinstall links missing peer loader deps in from vendor/scratch-gui/node_modules
npm run build # or npm start for a dev server
```

Note: `vendor/scratch-gui`'s own `prepublish` postinstall step tries to download micro:bit firmware from `downloads.scratch.mit.edu` and will fail if that's unreachable -- harmless, but if the build then complains about a missing `src/generated/microbit-hex-url.cjs`, stub it:
```
mkdir -p vendor/scratch-gui/src/generated
echo "module.exports = '';" > vendor/scratch-gui/src/generated/microbit-hex-url.cjs
```

## Status
- [x] scratch-gui builds successfully as a base (CI: `.github/workflows/build-check.yml`)
- [x] Our own wrapper app builds and bundles scratch-gui + tab UI into a single deployable `build/`
- [ ] Verify the tab switching + stage/code split actually renders correctly in a real browser (not yet visually tested)
- [ ] Touch-friendly Blockly config (bigger snap zones, drag thresholds)
- [ ] PWA manifest + service worker (installable, offline-capable)
- [ ] Capacitor wrapper for Android
- [ ] GitHub Actions workflow to build signed/debug APK

## Known risks
- The tab-split in `app.jsx` relies on scratch-gui's DOM structure (stage canvas's ancestor having exactly 2 sibling panes), not a public API. It could break silently on a scratch-gui update. A more robust but higher-maintenance alternative would fork `gui.jsx` to accept a layout-mode prop directly.
