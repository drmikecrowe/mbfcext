module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    // 'eslint:recommended',
    // // typescript
    // 'plugin:@typescript-eslint/eslint-recommended',
    // 'plugin:@typescript-eslint/recommended',
    // // vue
    // // "plugin:vue/vue3-recommended",
    // // "@vue/prettier",
    // // "@vue/prettier/@typescript-eslint",
    // // prettier
    // 'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    // 'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    // also

    "plugin:react/recommended",
    "airbnb",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  // parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    // project: 'tsconfig.json',
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint", "react", "local"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": "error",
    // '@typescript-eslint/adjacent-overload-signatures': 'error',
    // '@typescript-eslint/array-type': [
    //     'error',
    //     {
    //         default: 'array',
    //     },
    // ],
    // '@typescript-eslint/ban-types': [
    //     'error',
    //     {
    //         types: {
    //             Object: {
    //                 message: 'Avoid using the `Object` type. Did you mean `object`?',
    //             },
    //             Function: {
    //                 message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.',
    //             },
    //             Boolean: {
    //                 message: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
    //             },
    //             Number: {
    //                 message: 'Avoid using the `Number` type. Did you mean `number`?',
    //             },
    //             String: {
    //                 message: 'Avoid using the `String` type. Did you mean `string`?',
    //             },
    //             Symbol: {
    //                 message: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
    //             },
    //         },
    //     },
    // ],
    // '@typescript-eslint/class-name-casing': 'error',
    // '@typescript-eslint/consistent-type-assertions': 'error',
    // '@typescript-eslint/dot-notation': 'error',
    // '@typescript-eslint/indent': 'off',
    // '@typescript-eslint/member-delimiter-style': [
    //     'off',
    //     {
    //         multiline: {
    //             delimiter: 'none',
    //             requireLast: true,
    //         },
    //         singleline: {
    //             delimiter: 'semi',
    //             requireLast: false,
    //         },
    //     },
    // ],
    // '@typescript-eslint/no-empty-function': 'error',
    // '@typescript-eslint/no-empty-interface': 'off',
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    // '@typescript-eslint/no-misused-new': 'error',
    // '@typescript-eslint/no-namespace': 'error',
    // '@typescript-eslint/no-parameter-properties': 'off',
    // '@typescript-eslint/no-this-alias': 'error',
    // '@typescript-eslint/no-unused-expressions': 'error',
    // '@typescript-eslint/no-use-before-define': 'off',
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    // '@typescript-eslint/prefer-for-of': 'error',
    // '@typescript-eslint/prefer-function-type': 'error',
    // '@typescript-eslint/prefer-namespace-keyword': 'error',
    // '@typescript-eslint/quotes': 'off',
    // '@typescript-eslint/semi': ['off', null],
    // '@typescript-eslint/triple-slash-reference': [
    //     'error',
    //     {
    //         path: 'always',
    //         types: 'prefer-import',
    //         lib: 'always',
    //     },
    // ],
    // '@typescript-eslint/type-annotation-spacing': 'off',
    // '@typescript-eslint/unified-signatures': 'error',
    // 'arrow-parens': ['off', 'always'],
    // 'brace-style': ['off', 'off'],
    camelcase: "off",
    "consistent-return": "off",
    "no-plusplus": "off",
    // 'comma-dangle': 'off',
    // complexity: 'off',
    // 'constructor-super': 'error',
    // 'eol-last': 'off',
    // eqeqeq: ['error', 'smart'],
    // 'guard-for-in': 'error',
    // 'id-blacklist': [
    //     'error',
    //     'any',
    //     'Number',
    //     'number',
    //     'String',
    //     'string',
    //     'Boolean',
    //     'boolean',
    //     'Undefined',
    //     'undefined',
    // ],
    // 'id-match': 'error',
    // 'import/no-extraneous-dependencies': 'off',
    // 'import/no-internal-modules': 'off',
    // 'import/order': 'off',
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
    // 'jsdoc/check-alignment': 'error',
    // 'jsdoc/check-indentation': 'error',
    // 'jsdoc/newline-after-description': 'error',
    // 'linebreak-style': 'off',
    // 'max-classes-per-file': ['error', 1],
    // 'max-len': 'off',
    // 'new-parens': 'off',
    // 'newline-per-chained-call': 'off',
    // 'no-bitwise': 'error',
    // 'no-caller': 'error',
    // 'no-cond-assign': 'error',
    // 'no-console': 'error',
    // 'no-debugger': 'error',
    // 'no-duplicate-case': 'error',
    // 'no-duplicate-imports': 'error',
    "no-empty": "off",
    // "vue/component-tags-order": "off",
    "import/no-extraneous-dependencies": "off",
    "class-methods-use-this": "off",
    "lines-between-class-members": "off",

    // test

    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": "off",

    // final?
    "react/jsx-boolean-value": "error",
    "react/jsx-closing-bracket-location": "error",
    "react/jsx-closing-tag-location": "error",
    "react/jsx-curly-brace-presence": "error",
    "react/jsx-curly-newline": "error",
    "react/jsx-curly-spacing": "error",
    "react/jsx-equals-spacing": "error",
    "react/jsx-first-prop-new-line": "error",
    "react/jsx-fragments": "error",
    "react/jsx-max-props-per-line": "error",
    "react/jsx-no-useless-fragment": "error",
    "react/jsx-one-expression-per-line": "error",
    "react/jsx-props-no-multi-spaces": "error",
    "react/jsx-sort-props": "error",
    "react/jsx-tag-spacing": "error",
    "react/no-unknown-property": "off",
    "react/jsx-wrap-multilines": [
      "error",
      {
        declaration: "parens-new-line",
        assignment: "parens-new-line",
        return: "parens-new-line",
        arrow: "ignore",
        condition: "ignore",
        logical: "ignore",
        prop: "ignore",
      },
    ],

    // malevic
    "react/prop-types": "off",
    "react/jsx-indent-props": [2, 2],
    "react/jsx-indent": [2, 2],
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": [
      1,
      { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    ],
    "jsx-quotes": ["error", "prefer-double"],
  },

  // malevic
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        "local/jsx-uses-m-pragma": "error",
        "local/jsx-uses-vars": "error",
      },
    },
  ],

  settings: {
    react: {
      createClass: "createReactClass", // Regex for Component Factory to use,
      // default to "createReactClass"
      pragma: "React", // Pragma to use, default to "React"
      fragment: "Fragment", // Fragment to use (may be a property of <pragma>), default to "Fragment"
      version: "16.0", // React version. "detect" automatically picks the version you have installed.
      // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
      // default to latest and warns if missing
      // It will default to "detect" in the future
      flowVersion: "0.53", // Flow version
    },
    propWrapperFunctions: [
      // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
      "forbidExtraProps",
      { property: "freeze", object: "Object" },
      { property: "myFavoriteWrapper" },
    ],
    linkComponents: [
      // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
      "Hyperlink",
      { name: "Link", linkAttribute: "to" },
    ],
  },
};
