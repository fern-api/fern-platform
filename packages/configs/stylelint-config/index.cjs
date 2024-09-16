/** @type {import('stylelint').Config} */
module.exports = {
    plugins: ["stylelint-scss"],
    extends: ["stylelint-config-recommended", "stylelint-config-standard-scss", "stylelint-config-tailwindcss"],
    rules: {
        "at-rule-no-unknown": null,
        "selector-pseudo-class-no-unknown": [
            true,
            {
                ignorePseudoClasses: ["global", "export"],
            },
        ],
        "property-no-unknown": [
            true,
            {
                ignoreSelectors: [":export"],
            },
        ],
        "font-family-no-missing-generic-family-keyword": null,
        "color-function-notation": null,
        "selector-class-pattern": null,
        "no-descending-specificity": null,
        "scss/at-rule-no-unknown": [
            true,
            {
                ignoreAtRules: ["tailwind"],
            },
        ],
    },
};
