const defaults = require("../../../.prettierrc.json");
module.exports = {
  ...defaults,
  plugins: [...(defaults.plugins ?? []), "prettier-plugin-tailwindcss"],
};
