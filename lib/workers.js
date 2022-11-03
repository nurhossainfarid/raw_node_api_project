/**
 * title: Upcoming monitoring application
 * Description: A RESTful api to monitor up and down time of user defined link
 * Author: Nur Hossain Faird
 * Date: 27/10/22
 *  */

// dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const data = require('./data');
const { parseJSON } = require('../helper/utilities');
const sendTwilioSms = require('../helper/notification');

// app object - module scaffolding
const worker = {};

// gather all checks
worker.gatherAllChecks = () => {
    data.list('checks', (err, checksData) => {
        if (!err && checksData && checksData.length > 0) {
            checksData.forEach((check) => {
                // read the checksData
                data.read('checks', check, (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        // pass the data to check validator
                        worker.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log('Error: reading one of the check data');
                    }
                });
            });
        } else {
            console.log('Error: could not find any checks to process');
        }
    });
};

// validate individual check data
worker.validateCheckData = (originalCheckData) => {
    const originalData = originalCheckData;
    if (originalData && originalData.id) {
        originalData.state = typeof originalData.status === 
        'string' && [('up', 'down')].indexOf(originalData.status) > -1 ? originalData.status : 'down';

        originalData.lastChecked = typeof originalData.lastChecked === 'number' && originalData.lastChecked > 0
                ? originalData.lastChecked : false;

        // pass to the next process
        worker.performCheck(originalData);
    } else {
        console.log('Error: check was invalid or not properly formatted');
    }
};

// perform check
worker.performCheck = (originalCheckData) => {
    // prepare the initial check outcome 
    let checkOutCome = {
        'error': false,
        'responseCode': false,
    };
    // mark the outcome has not been sent yet
    let outComeSent = false;

    // parse the hostname and full url from original data
    const parsedUrl = url.parse(`${originalCheckData.protocol}://&{originalData.url}`, true);
    const hostName = parsedUrl.hostname;
    const { path } = parsedUrl;

    // construct the request 
    const requestDetails = {
        protocol: `${originalCheckData.protocol}:`,
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    };

    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

    const req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;

        // update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if (!outComeSent) {
            worker.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    });

    req.on('error', (err) => {
        checkOutCome = {
            error: true,
            value: err,
        };
        
        // update the check outcome and pass to the next process
        if (!outComeSent) {
            worker.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    });

    req.on('timeout', (err) => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        // update the check outcome and pass to the next process
        if (!outComeSent) {
            worker.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    });

    // req send 
    req.end();
};

// process check out come 
worker.processCheckOutCome = (originalCheckData, checkOutCome) => {
    // check if check outcome is up or down
    const state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    // decide whether we should alert the user or not 
    const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data 
    const newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check to disk
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (err) {
            if (alertWanted) {
                // send the check data to next process
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }
        } else {
            console.log('Error tying to save check data of one of the checks!');
        }
    });
};

// send notification sms to user if state change
worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via SMS ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user!');
        }
    });
};

// loop 
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 8000);
};

// start the server
worker.init = () => {
    // execute all the checks
    worker.gatherAllChecks();

    // timer to execute the worker process once per minute
    worker.loop();
};

// exports
module.exports = worker;
