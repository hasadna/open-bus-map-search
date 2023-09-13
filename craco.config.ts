import path from 'path'

module.exports = {
  webpack: {
    alias: {
      '@bus-logos': path.resolve(__dirname, 'src/resources/bus-logos'),
      '@operators-logos': path.resolve(__dirname, 'src/resources/operators-logos'),
    },
  },
}
