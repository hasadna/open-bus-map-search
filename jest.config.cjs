module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    // react-router v7 ships ESM-only; transpile it (and any other allowlisted ESM dep)
    // to CJS for jest, stubbing import.meta which is invalid in CJS
    '^.+\\.m?jsx?$': [
      'babel-jest',
      {
        plugins: [
          require.resolve('./jest.stubImportMeta.cjs'),
          '@babel/plugin-transform-modules-commonjs',
        ],
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(react-router|cookie-es)/)'],
  moduleNameMapper: {
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/mocks/fileMock.js',
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['/node_modules/', '/tests/'],
  collectCoverageFrom: [
    '**/src/**/*.{js,jsx,ts,tsx}',
    '!**/src/svgLoader.d.ts',
    '!**/src/{test_pages,complaint}/**',
    '!**/src/pages/DataResearch/**',
    '!**/src/pages/homepage/**',
    '!**/*.{test,spec,config,stories}.*',
  ],
  modulePaths: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
}
