// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure we get the resolver and transformer from the default config
const { resolver, transformer } = config;

// Configure asset handling
config.resolver = {
  ...resolver,
  assetExts: [
    ...resolver.assetExts,
    'db',
    'mp4',
    'ttf',
    'otf',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp'
  ],
  sourceExts: [...resolver.sourceExts, 'mjs'],
};

// Ensure proper asset transformation
config.transformer = {
  ...transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config; 