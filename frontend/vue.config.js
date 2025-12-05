const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Instituto Técnico Columbia";
      const faviconPath = path.resolve(__dirname, "public/logo.png");
      args[0].favicon = faviconPath;
      return args;
    });
  },
});
