export default {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    // process `*.tsx` files with `ts-jest`
  },
  moduleNameMapper: {
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/mocks/fileMock.js',
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/', // Ignoring this folder since playwright tests are here
  ],
  collectCoverageFrom: [
    '**/src/**/*.{js,jsx,ts,tsx}',
    '!**/src/svgLoader.d.ts',
    '!**/src/{test_pages,complaint}/**',
    '!**/src/pages/DataResearch/**',
    '!**/src/pages/homepage/**',
    '!**/src/**/{setupProxy,log}.{ts,tsx}',
    '!**/*.{test,spec,config,stories}.*'
  ],
  modulePaths: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
}
