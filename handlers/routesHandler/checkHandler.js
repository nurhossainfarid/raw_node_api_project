// Dependencies
const data = require('../../lib/data');
const { parseJSON, randomString } = require('../../helper/utilities');
const tokenHandler = require('../../handlers/routesHandler/tokenHandler');
// module scaffolding
const handler = {};

// check are method is exist or not
handler.checkHandler = (requestProperties, callback) => {
    const acceptMethods = ['get', 'post', 'put', 'delete'];
    if (acceptMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

// apply crud operation on check
handler._check.post = (requestProperties, callback) => { 
    // check validation properties
    const protocol = typeof requestProperties.body.protocol === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCodes = typeof requestProperties.body.successCodes === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <=10 ? requestProperties.body.timeoutSeconds : false;

    // check all are exist and send response
    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;

        // lookup the tokens ds
        data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                let userPhone = parseJSON(tokenData).phoneNumber;

                // lookup to user data
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                let userObject = parseJSON(userData);
                                let userChecks = typeof (userObject.checks) === 'object' instanceof Array ? userObject.checks: [];

                                if (userChecks.length < 5) {
                                    const checkId = randomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };

                                    // save the object in checks file
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // save the data in users files
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // update users file
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    callback(200, userObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem in the server side',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a problem in the server side',
                                            });
                                        }
                                    });
                                } else {
                                    callback(400, {
                                        error: 'Checks properties cross maximum limit',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication failed',
                                });
                            }
                        })
                    } else {
                        callback(400, {
                            error: 'User not found',
                        });
                    }
                })
            } else {
                callback(400, {
                    error: 'You have problem in a request',
                });
            }
        })
    } else {
        callback(400, {
            error: 'This is server side problem',
        });
    }
};
handler._check.get = (requestProperties, callback) => { 
    // check token is valid 
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if (id) {
        // lookup the checks
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (isTokenValid) => {
                    if (isTokenValid) {
                        callback(200, parseJSON(checkData))
                    } else {
                        callback(403, {
                            error: 'Authentication failed',
                        })
                    }
                });
            } else {
                callback(500, {
                    error: 'You have a problem in your request.',
                });
            }
        });
    } else {
        callback(500, {
            error: 'There was a problem in your request method.',
        });
    }
};
handler._check.put = (requestProperties, callback) => {
    // check id is valid 
    const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    // check validation properties
    const protocol = typeof requestProperties.body.protocol === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    const url = typeof requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCodes = typeof requestProperties.body.successCodes === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 10 ? requestProperties.body.timeoutSeconds : false;
    
    // check id is here
    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    const checkObject = parseJSON(checkData);
                    const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            // store the check object
                            data.update('checks', id, checkObject, (err2) => {
                                if (!err2) {
                                    callback(200, checkObject);
                                } else {
                                    callback(400, {
                                        error: 'User could not update successfully',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication failed',
                            });
                        }
                    });
                }
            });
        } else {
            callback(400, {
                error: 'Thing to update',
            });
        }
    } else {
        callback(500, {
            error: 'there was a request problem',
        });
    }
};
 
handler._check.delete = (requestProperties, callback) => {
    // check token is valid 
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;
    if (id) {
        // lookup the checks
        data.read('checks', id, (err, checkData) => {
            if (!err && parseJSON(checkData)) {
                const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (isTokenValid) => {
                    if (isTokenValid) {
                        // delete checks from files
                        data.delete('checks', id, (err2) => {
                            if (!err2) {
                                // lookup the users file
                                data.read('users', parseJSON(checkData).userPhone, (err3, userData) => {
                                    let userObject = JSON.parse(userData);
                                    if (!err3 && userObject) {
                                        let userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        // remove the delete check id from user's list of checks
                                        let checkPosition = userChecks.indexOf(id);
                                        console.log(checkPosition);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);

                                            // re-store the update user
                                            userObject.checks = userChecks;
                                            data.update('users', userObject.phoneNumber, userObject, (err4) => {
                                                if (!err4) {
                                                    callback(200, userObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a server side problem and could delete check id successfully',
                                                    })
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a server side problem and could delete check id successfully',
                                            });
                                        }
                                    } else {
                                        callback(500, {
                                            error: 'There was a problem in the server side',
                                        });
                                    }
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a problem in the server side',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'Authentication failed',
                        })
                    }
                });
            } else {
                callback(500, {
                    error: 'You have a problem in your request.',
                });
            }
        });
    } else {
        callback(500, {
            error: 'There was a problem in your request method.',
        });
    }
 };
// exports
module.exports = handler;