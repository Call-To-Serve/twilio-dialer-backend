module.exports = async function handler(req, res) {
    // 1. CORS HEADERS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle pre-flight check
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. TOKEN GENERATION
    try {
        const twilio = require('twilio');
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;

        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            { identity: 'ansaar_agent' }
        );

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
            incomingAllow: true,
        });
        token.addGrant(voiceGrant);

        res.status(200).json({ token: token.toJwt() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
