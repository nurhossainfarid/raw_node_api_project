// Dependencies
const data = require('../../lib/data');
const { hash, randomString, parseJSON } = require('../../helper/utilities');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

// crud properties
handler._token = {};

handler._token.post = (requestProperties, callback) => {
    // valid phone number and password
    const phoneNumber = typeof requestProperties.body.phoneNumber === 'string' && requestProperties.body.phoneNumber.trim().length === 11 ? requestProperties.body.phoneNumber : false;

    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 6 ? requestProperties.body.password : false;

    if (phoneNumber && password) {
        data.read('users', phoneNumber, (err, userData) => {
            const hashPassword = hash(password);
            if (hashPassword === parseJSON(userData).password) {
                let tokenId = randomString(20);
                let expires = Date.now() + 60 * 60 * 1000;
                let tokenObject = {
                    phoneNumber,
                    id: tokenId,
                    expires,
                };

                // store to ds
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200, tokenObject);
                    } else {
                        callback(400, {
                            error: 'There was a problem in the server side',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Password is incorrect',
                });
            }

        });
    } else {
        callback(400, {
            error: 'You have a problem in request',
        });
    }
 };

handler._token.get = (requestProperties, callback) => { 
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;
    console.log(id);
    if (id) {
        // lookup token ds
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Request token was not found',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Request token was not found',
        });
    }
};

handler._token.put = (requestProperties, callback) => { 
    // check id and extend are valid
    const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;
    const extend = typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true ? true : false;

    if (id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            const token = parseJSON(tokenData);
            if (token.expires > Date.now()) {
                token.expires = Date.now() + 60 * 60 * 24 * 60 * 1000;

                // store to ds
                data.update('tokens', id, token, (err2) => {
                    if (!err2) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'There was a server side error',
                        });
                    }
                });
            }
        });
    } else {
        callback(404, {
            error: 'Request token was not found',
        });
    }
};

handler._token.delete = (requestProperties, callback) => { 
    // check id and extend are valid
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if (id) {
        data.delete('tokes', id, (err2) => {
            callback(200, {
                message: 'successfully delete token',
            });
        });
    } else {
        callback(404, {
            error: 'Request token was not found',
        });
    }
};

handler._token.verify = (id, phoneNumber, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phoneNumber === phoneNumber && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// exports
module.exports = handler;
