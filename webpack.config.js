const path = require("path");

module.exports = {
  entry: "./src/main.js", // Path to your main file with CKEditor configuration
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
      },
      {
        test: /\.css$/, // Regex to match .css files
        use: [
          "style-loader", // Injects styles into the DOM
          "css-loader", // Translates CSS into CommonJS
        ],
      },
    ],
  },
};
