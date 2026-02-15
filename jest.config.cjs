module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/server/tests/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/server/tests/jest.setup.js'],
    clearMocks: true,
  };
  