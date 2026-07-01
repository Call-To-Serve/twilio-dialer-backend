const twilio = require('twilio');

module.exports = async (req, res) => {
  // Enable CORS so your mobile web browser can read this token
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // These variables will be securely linked inside Vercel later
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  // Generate an access token valid for 1 hour for your mobile dialer
  const token = new AccessToken(accountSid, apiKey, apiSecret, { identity: 'mobile_dialer_user', ttl: 3600 });

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    incomingAllow: false
  });
  
  token.addGrant(voiceGrant);

  return res.status(200).json({ token: token.toJwt() });
};

