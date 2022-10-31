// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    console.log(requestProperties);

    callback(404, {
        message: 'This route is not found',
    });
};
module.exports = handler;
