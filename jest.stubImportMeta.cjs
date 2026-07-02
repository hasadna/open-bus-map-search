// Replaces `import.meta` with a stub object so ESM-only dependencies (react-router v7)
// can be transpiled to the CommonJS jest runs, where `import.meta` is a syntax error.
module.exports = function stubImportMeta() {
  return {
    name: 'stub-import-meta',
    visitor: {
      MetaProperty(path) {
        // `import.meta` and `new.target` are both MetaProperty nodes — only rewrite the former.
        if (path.node.meta.name !== 'import' || path.node.property.name !== 'meta') return
        path.replaceWithSourceString(
          "({ url: 'file:///jest', env: { MODE: 'test', DEV: false, PROD: false, BASE_URL: '/' } })",
        )
      },
    },
  }
}
