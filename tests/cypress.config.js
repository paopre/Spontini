const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: false,
  e2e: {
    supportFile: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
