const Twilio = require('twilio');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/xml');

    const toNumber = req.body.To || req.query.To;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    const response = new Twilio.twiml.VoiceResponse();

    if (toNumber) {
        const dial = response.dial({ callerId: fromNumber });
        dial.number(toNumber);
    } else {
        response.say("Error: Destination number missing.");
    }

    return res.status(200).send(response.toString());
};

