import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "babel-jest",
    "^.+\\.svg$": "jest-svg-transformer",
  },
  testEnvironment: "jest-environment-jsdom",
};

export default config;
