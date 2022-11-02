// dependencies
const crypto = require('crypto');

// module scaffolding
const utilities = {};

// parse json string to object
utilities.parseJSON = (jsonString) => {
    let output = {};
    try {
        output = JSON.parse(jsonString);
    } catch (error) {
        output = {};
    }
    return output;
};

// Hash string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto
            .createHmac('sha256', 'lfkh*-555/dfweifwpf5644g5e')
            .update(str)
            .digest('hex');
        return hash;
    }
};

// create random string
utilities.randomString = (strLength) => {
    let length = strLength;
    length = typeof strLength === 'number' ? strLength : false;

    if (length) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz*&#$0123456789';
        let output = '';
        for (let i = 1; i <= length; i++) {
            const randomCharacters = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            output += randomCharacters;
        }
        return output;
    }
    return false;
};
// exports utilities
module.exports = utilities;
