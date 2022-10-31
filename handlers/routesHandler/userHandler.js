// Dependencies
const data = require('../../lib/data');
const {hash} = require('../../helper/utilities');
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
};

handler._user.put = (requestProperties, callback) => {};

handler._user.delete = (requestProperties, callback) => {};

module.exports = handler;
