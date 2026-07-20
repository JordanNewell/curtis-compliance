/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    // CLI + GitHub IO glue: high mocking cost, low ROI for unit tests.
    // Covered by manual smoke tests (init → check → audit verify/export).
    '!src/cli.ts',
    '!src/github-integration.ts'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    // Engine modules carry the real risk — hold them to a high bar.
    // cli.ts and github-integration.ts are IO/glue; covered by manual smoke
    // tests, excluded from the threshold (see collectCoverageFrom).
    global: {
      statements: 80,
      branches: 70,
      functions: 85,
      lines: 80
    }
  },
  // Audit-trail tests chdir into temp dirs; isolate each test file's cwd
  // by setting process.cwd per-test rather than globally.
  verbose: false
};
