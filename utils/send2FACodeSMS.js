
import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export default async function send2FACodeSMS(phoneNumber, code) {
    try {
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
