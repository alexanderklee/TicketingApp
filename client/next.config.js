module.exports = {
    webpackDevMiddleware: config => {
        // force next to watch for file changes every 300ms
        config.watchOptions.poll = 300;
        return config;
    }
};