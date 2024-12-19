module.exports = {
    // This is duplicated, make sure to keep it in sync with others
    plugins: {
        "postcss-import": {},
        "tailwindcss/nesting": {},
        tailwindcss: {},
        autoprefixer: {},
        ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
    },
};
