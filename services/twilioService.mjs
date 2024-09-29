import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSMS = (to, message) => {
  return client.messages.create({
    body: message,
    to: to,
    from: 918247696604,
  });
};

export default sendSMS;
