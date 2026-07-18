const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '../..');
const config = getDefaultConfig(__dirname);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.join(__dirname, 'node_modules'),
  path.join(workspaceRoot, 'node_modules'),
];

module.exports = config;
