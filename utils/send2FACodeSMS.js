
import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export default async function send2FACodeSMS(phoneNumber, code) {
    try {
        /*console.log("Twilio SID:", process.env.TWILIO_ACCOUNT_SID);
        console.log("Twilio Auth Token length:", process.env.TWILIO_AUTH_TOKEN.length);
        console.log("From number:", process.env.TWILIO_FROM_NUMBER);
        console.log("To number:", phoneNumber);*/
        await client.messages.create({
            body: `Je 2FA code is: ${code}`,
            from: process.env.TWILIO_FROM_NUMBER,
            to: phoneNumber
        });

        console.log(`2FA SMS sent to ${phoneNumber}`);
    } catch (err) {
        console.error("Twilio SMS error:", err);
        throw new Error("Kon SMS niet versturen");
    }
}
