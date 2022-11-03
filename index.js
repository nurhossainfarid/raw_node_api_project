/**
 * title: Upcoming monitoring application
 * Description: A RESTful api to monitor up and down time of user defined link
 * Author: Nur Hossain Faird
 * Date: 27/10/22
 *  */

// dependencies
const server = require('./lib/server');
const worker = require('./lib/workers');

// app object - module scaffolding
const app = {};

// create server
app.init = () => {
    // init the server
    server.init();

    // init the worker
    worker.init();
};

// start the server
app.init();

// exports
module.exports = app;
