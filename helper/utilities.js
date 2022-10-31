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

// exports utilities
module.exports = utilities;
