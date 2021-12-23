console.log(process.env.BABEL_ENV);

module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  plugins: ["@babel/transform-runtime"],
};
