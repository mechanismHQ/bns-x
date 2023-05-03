// const { pathsToModuleNameMapper } = require('ts-jest');
// const { compilerOptions } = require('./tsconfig');

module.exports = {
  clearMocks: true,
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  // setupFilesAfterEnv: ["<rootDir>/tests/singleton.ts"],
};
