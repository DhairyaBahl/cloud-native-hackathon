const router = require('express').Router();
const twilio = require('twilio');
require('dotenv').config();
const User = require('../model')
const request = require('request');
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const options = {
    uri : process.env.URI,
    method : 'GET',
};

twilio(accountSid, authToken);

const messagingResponse  = require('twilio').twiml.MessagingResponse;

router.post('/recieve',  async (req, res) => { 
     const twiml = new messagingResponse();
     console.log(req.body);

     const name = req.body.ProfileName || 'Anonymous';
     const messageBody = req.body.Body;
     const whatsappNumber = req.body.From;

     const user = new User({
            name,
            phone: whatsappNumber,
     });

     await user.save();
     
     if(messageBody.toLowerCase() === 'hello') {
         twiml.message(`Hello ${name}!, To get your air quality, send your location.`);
     }

     else if(messageBody.toLowerCase() !== messageBody) {
            request(options, async function(error, response, body) {
                if(error){
                    console.log(error);
                }
    
                let pollutants = JSON.parse(body);
    
                await twiml.message(`The AQI is ${pollutants.data.current.pollution.aqius}. The air quality is hazard.`);
                console.log(pollutants.data.current.pollution.aqius);
            });
     }

     else {

        function randomIntFromInterval(min, max) { // min and max included 
            return Math.floor(Math.random() * (max - min + 1) + min)
        }

        const AQI = randomIntFromInterval(200,300);
        twiml.message(`The aqi is ${AQI}. The air quality is hazardous.`);
     }

     res.set('Content-Type', 'text/xml');
     res.status(201).send(twiml.toString());
})

module.exports = router;