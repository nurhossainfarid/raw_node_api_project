// Dependencies
const https = require('https');
const querystring = require('querystring');
// module scaffolding
const notification = {};

// send sms use twilio api
notification.sendTwilioSms = (phone, msg, callback) => {
    // valid fields
    const userPhone = typeof(phone) === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMsg =typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length < 1600
            ? msg.trim()
            : false;

    if (userPhone && userMsg) {
        const twilio = {
            fromPhone: '+14155552345',
            accountSid: 'ACef52efe24f87f2a3d7f75da9cb627d2e',
            authToken: '271c3075e7a9078fdc8a8b2efbe834f2',
        };
        // configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // send payload as a stringify
        const stringifyPayload = querystring.stringify(payload);

        // configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}: ${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        // instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // get the status from send the res
            const status = res.statusCode;

            // callback successfully if the request went through
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`status code is return ${status}`);
            }
        });

        // error Handling
        req.on('error', (err) => {
            callback(err);
        });

        req.write(stringifyPayload);
        req.end();
    } else {
        callback('Given parameters were missing or invalid');
    }
};

// exports
module.exports = notification;
