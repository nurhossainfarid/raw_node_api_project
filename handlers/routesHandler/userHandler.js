// Dependencies
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helper/utilities');
const tokenHandler = require('../../handlers/routesHandler/tokenHandler');
// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    // console.log(requestProperties);
    const acceptMethods = ['get', 'post', 'put', 'delete'];
    if (acceptMethods.indexOf(requestProperties.method) > -1) {
        handler._user[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._user = {};

handler._user.post = (requestProperties, callback) => {
    // console.log(requestProperties.body);
    const firstName = typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phoneNumber = typeof requestProperties.body.phoneNumber === 'string' && requestProperties.body.phoneNumber.trim().length === 11 ? requestProperties.body.phoneNumber : false;

    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 5 ? requestProperties.body.password : false;

    const tosAgreement = typeof requestProperties.body.tosAgreement === 'boolean' ? requestProperties.body.tosAgreement : false;
    console.log(firstName, lastName, phoneNumber, tosAgreement, password);

    if (firstName && lastName && phoneNumber && password && tosAgreement) {
        // make sure user not exist
        data.read('users', phoneNumber, (err) => {
            if (err) {
                const userObject = {
                    firstName,
                    lastName,
                    phoneNumber,
                    password: hash(password),
                    tosAgreement,
                };
                // save the user data to ds
                data.create('users', phoneNumber, userObject, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'User created successfully',
                        });
                    } else {
                        callback(500, {
                            error: 'Could not create user succfully',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'This user already here please save unique user',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._user.get = (requestProperties, callback) => {
    // check the phone number is valid
    const phoneNumber = typeof requestProperties.queryStringObject.phoneNumber === 'string' && requestProperties.queryStringObject.phoneNumber.trim().length === 11 ? requestProperties.queryStringObject.phoneNumber : false;
    if (phoneNumber) {
        // token
        const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
        // console.log(token);

        tokenHandler._token.verify(token, phoneNumber, (tokenId) => {
            if (tokenId) {
                console.log(tokenId);
                // lookup the user
                data.read('users', phoneNumber, (err, users) => {
                    const user = { ...parseJSON(users) };
                    if (!err && user) {
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, {
                            error: 'Requested user is not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authorized person for this',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Request user not found',
        });
    }
};

handler._user.put = (requestProperties, callback) => {
    // check phone number is valid
    const phoneNumber = typeof requestProperties.body.phoneNumber === 'string' && requestProperties.body.phoneNumber.trim().length === 11 ? requestProperties.body.phoneNumber : false;

    const firstName = typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;


    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 5 ? requestProperties.body.password : false;

    if (phoneNumber) {
        if (firstName || lastName || password) {
            // token
            const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
            // console.log(token);

            tokenHandler._token.verify(token, phoneNumber, (tokenId) => {
                if (tokenId) {
                    // lookup the user
                    data.read('users', phoneNumber, (err, uData) => {
                        const userData = { ...parseJSON(uData) };
                        if (!err && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }

                            // store updated data in ds
                            data.update('users', phoneNumber, userData, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        message: 'User update successfully',
                                    });
                                } else {
                                    callback(500, {
                                        error: 'User could update successfully',
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'You have a problem in request',
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: 'Authorized person for this',
                    });
                }
            });
        }
    } else {
        callback(400, {
            error: 'Invalid phone number',
        });
    }
 
};

handler._user.delete = (requestProperties, callback) => {
    // check the phone number is valid
    const phoneNumber = typeof requestProperties.queryStringObject.phoneNumber === 'string' && requestProperties.queryStringObject.phoneNumber.trim().length === 11 ? requestProperties.queryStringObject.phoneNumber : false;
    if (phoneNumber) {
        // token
        const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
        // console.log(token);

        tokenHandler._token.verify(token, phoneNumber, (tokenId) => {
            if (tokenId) {
        // lookup the user 
                data.read('users', phoneNumber, (err, userData) => {
                    if (!err && userData) {
                        // delete user from ds
                        data.delete('users', phoneNumber, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    message: 'User deleted successfully',
                                });
                            } else {
                                callback(400, {
                                    error: 'User could delete successfully',
                                });
                            }
                        });
                    } else {
                        callback(400, {
                            error: 'There waw a problem from your request',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authorized person for this',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Invalid phone number',
        });
    }
};

module.exports = handler;
