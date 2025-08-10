const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure for GitHub Pages deployment
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

module.exports = config;