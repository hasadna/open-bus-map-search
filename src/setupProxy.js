const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://open-bus-stride-api.hasadna.org.il',
            changeOrigin: true,
            pathRewrite: {
                '^/api/': '/', // remove base path
            },
        })
    );
};
