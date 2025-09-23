const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFiles: ["<rootDir>/jest.setup.js"],
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  setupFilesAfterEnv: [
    "@testing-library/jest-dom",
    "<rootDir>/__mocks__/mock-fetch.ts",
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^next/navigation$": "<rootDir>/__mocks__/next/navigation.js",
    "^@supabase/ssr$": "<rootDir>/__mocks__/@supabase/ssr.js",
  },
};
module.exports = createJestConfig(customJestConfig);
