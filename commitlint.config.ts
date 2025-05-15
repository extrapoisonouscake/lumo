module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-empty": [0, "never"],
    "scope-enum": [
      2,
      "always",
      ["myed", "extensions", "ui", "automations", "db", "auth", "config"],
    ],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "chore",
        "style",
        "refactor",
        "ci",
        "test",
        "revert",
        "perf",
      ],
    ],
  },
};
