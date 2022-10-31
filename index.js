/**
 * title: Upcoming monitoring application
 * Description: A RESTful api to monitor up and down time of user defined link
 * Author: Nur Hossain Faird
 * Date: 27/10/22
 *  */

// dependencies
const http = require('http');
const { handleReqRes } = require('./helper/handleReqRes');
const environment = require('./helper/environment');
const data = require('./lib/data');

// testing for create the data
data.delete('test', 'new-file', (err) => {
    console.log(err);
});

// app object - module scaffolding
const app = {};

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`listening to port ${environment.port}`);
    });
};

// handle Request Response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();
