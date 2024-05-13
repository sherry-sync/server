module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
    project: ['./tsconfig.json']
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  plugins: [
    'import',
    '@typescript-eslint',
    'unicorn',
    'simple-import-sort'
  ],
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    'typescript-eslint/ban-types': 'off',
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "unicorn/prefer-module": "off",
    "unicorn/no-abusive-eslint-disable": "off"
  },
  overrides: [{
    files: ['**/*.ts'],
    rules: {
      'unicorn/explicit-length-check': 'off',
      'class-methods-use-this': 'off',
      'import/prefer-default-export': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ["^\\u0000"],
            ["^node:", "^node:.*\\u0000$"],
            ["(?<!\\u0000)$", "(?<=\\u0000)$"],
            ["^@shared"],
            ["^@modules"],
            ["^@common"],
            ["^\\.", "^\\..*\\u0000$"],
          ]
        }
      ]
    }
  }]
}
