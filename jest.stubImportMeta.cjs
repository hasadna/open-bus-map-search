// Replaces `import.meta` with a stub object so ESM-only dependencies (react-router v8)
// can be transpiled to the CommonJS jest runs, where `import.meta` is a syntax error.
module.exports = function stubImportMeta() {
  return {
    name: 'stub-import-meta',
    visitor: {
      MetaProperty(path) {
        path.replaceWithSourceString(
          "({ url: 'file:///jest', env: { MODE: 'test', DEV: false, PROD: false, BASE_URL: '/' } })",
        )
      },
    },
  }
}
