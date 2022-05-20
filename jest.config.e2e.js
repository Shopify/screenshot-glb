/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "./dist"],
  testMatch: ["**/__tests__/**/*.e2e.[jt]s?(x)", "**/?(*.)+(spec|test).e2e.[jt]s?(x)"]
};
