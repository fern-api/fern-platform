module.exports = {
    plugins: {
        "postcss-hover-media-feature": {},
        "postcss-import": {},
        "tailwindcss/nesting": {},
        tailwindcss: {},
        autoprefixer: {},
        ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
    },
};
