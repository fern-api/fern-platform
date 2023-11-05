const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
    target: "web",
    mode: isDevelopment ? "development" : "production",
    entry: "./src/index.tsx",
    devtool: "inline-source-map",
    output: {
        path: path.join(__dirname, "/lib"),
        filename: "bundle.js",
    },
    devtool: "inline-source-map",
    devServer: {
        static: "./lib",
    },
    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        projectReferences: true,
                    },
                },
            },
            {
                test: /\.module\.s[ac]ss$/,
                use: [
                    isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            sourceMap: isDevelopment,
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: isDevelopment,
                            implementation: require("sass"),
                        },
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/,
                exclude: /\.module.scss$/,
                use: [
                    isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: isDevelopment,
                            implementation: require("sass"),
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".scss", ".css"],
        plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
        fallback: {
            os: false,
            zlib: false,
            stream: false,
            fs: false,
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
        }),
        new MiniCssExtractPlugin({
            filename: isDevelopment ? "[name].css" : "[name].[fullhash].css",
            chunkFilename: isDevelopment ? "[id].css" : "[id].[fullhash].css",
        }),
    ],
};
