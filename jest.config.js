module.exports = {
  moduleNameMapper: {
    "^(background|assets)/(.*)$": "<rootDir>/src/$1/$2",
    "^(utils.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  setupFiles: ["jest-webextension-mock"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
