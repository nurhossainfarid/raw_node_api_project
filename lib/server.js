/**
 * title: Upcoming monitoring application
 * Description: A RESTful api to monitor up and down time of user defined link
 * Author: Nur Hossain Faird
 * Date: 27/10/22
 *  */

// dependencies
const http = require('http');
const { handleReqRes } = require('../helper/handleReqRes');
const environment = require('../helper/environment');

// app object - module scaffolding
const server = {};

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environment.port, () => {
        console.log(`listening to port ${environment.port}`);
    });
};

// handle Request Response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
    server.createServer();
};

// exports
module.exports = server;
