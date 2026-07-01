const twilio = require('twilio');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // PATH 1: Handle Twilio's Call Request (POST request from Twilio servers)
    if (req.method === 'POST') {
        const toNumber = req.body.To || req.query.To;
        
        const VoiceResponse = twilio.twiml.VoiceResponse;
        const response = new VoiceResponse();
        
        if (toNumber) {
            // Outbound Dialing instruction
            const dial = response.dial({ callerId: process.env.TWILIO_PHONE_NUMBER || req.body.From });
            dial.number(toNumber);
        } else {
            response.say("No phone number provided.");
        }

        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(response.toString());
    }

    // PATH 2: Handle Token Request (GET request from frontend dialer)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(accountSid, apiKey, apiSecret, { identity: 'mobile_dialer_user', ttl: 3600 });

    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: false
    });

    token.addGrant(voiceGrant);

    return res.status(200).json({ token: token.toJwt() });
};
