// scratch-webpack-configuration declares its loader packages (babel presets, css-loader,
// terser-webpack-plugin, etc.) as peerDependencies, expecting the consuming app to supply
// them. scratch-gui's own package.json already pins working versions of all of these --
// rather than duplicate and maintain that whole list ourselves (and risk drifting out of
// sync with whatever scratch-gui actually needs as it's updated), we symlink the missing
// ones in from vendor/scratch-gui/node_modules after `npm install` runs.
//
// This only runs if vendor/scratch-gui has already been cloned and had its own
// `npm ci` run (see .github/workflows/build-check.yml or README setup steps).

const fs = require('fs');
const path = require('path');

const VENDOR_NODE_MODULES = path.resolve(__dirname, '../vendor/scratch-gui/node_modules');
const OUR_NODE_MODULES = path.resolve(__dirname, '../node_modules');

const PEER_PACKAGES = [
    '@babel/preset-env',
    '@babel/preset-react',
    'arraybuffer-loader',
    'autoprefixer',
    'babel-loader',
    'css-loader',
    'postcss-import',
    'postcss-loader',
    'postcss-simple-vars',
    'style-loader',
    'url-loader',
    'file-loader',
    'terser-webpack-plugin'
];

if (!fs.existsSync(VENDOR_NODE_MODULES)) {
    console.log(
        '[link-scratch-gui-deps] vendor/scratch-gui/node_modules not found yet, skipping ' +
        '(run npm ci in vendor/scratch-gui first, then re-run npm install here).'
    );
    process.exit(0);
}

let linked = 0;
for (const pkg of PEER_PACKAGES) {
    const target = path.join(VENDOR_NODE_MODULES, pkg);
    const linkPath = path.join(OUR_NODE_MODULES, pkg);

    if (fs.existsSync(linkPath)) continue; // already resolvable, don't touch it
    if (!fs.existsSync(target)) {
        console.log(`[link-scratch-gui-deps] ${pkg} not found in vendor/scratch-gui, skipping`);
        continue;
    }

    fs.mkdirSync(path.dirname(linkPath), {recursive: true});
    fs.symlinkSync(target, linkPath, 'dir');
    linked++;
}

console.log(`[link-scratch-gui-deps] linked ${linked} package(s) from vendor/scratch-gui/node_modules`);
