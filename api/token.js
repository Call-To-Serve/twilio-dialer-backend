const Twilio = require('twilio');

module.exports = async (req, res) => {
    // Enable CORS for frontend requests
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKey = process.env.TWILIO_API_KEY;
        const apiSecret = process.env.TWILIO_API_SECRET;
        const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

        // Validation Check
        if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
            return res.status(500).json({ error: 'Missing core Twilio environment keys on backend.' });
        }

        const AccessToken = Twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;

        // Generate the strict security token
        const token = new AccessToken(accountSid, apiKey, apiSecret, {
            identity: 'call_to_serve_operator', // Alphanumeric & underscores only
            ttl: 3600
        });

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: twimlAppSid,
            incomingAllow: true
        });
        token.addGrant(voiceGrant);

        // Return the clean token string
        return res.status(200).json({ token: token.toJwt() });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
