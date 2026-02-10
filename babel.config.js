module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: { node: 'current' },
            },
        ],
    ],
    plugins: [
        // ESSENCIAL para os Decorators do TypeORM
        ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
};
