const { sampleHandler } = require('./handlers/routesHandler/sampleHandler');
const { userHandler } = require('./handlers/routesHandler/userHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
};

module.exports = routes;
