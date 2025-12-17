import twilio from "twilio";

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export default async function send2FACodeSMS(phoneNumber, code) {
    if (!client || !process.env.TWILIO_FROM_NUMBER) {
        console.log("Twilio not configured. 2FA Code log:", code);
        return false;
    }

    try {
        await client.messages.create({
            body: `Je 2FA code is: ${code}`,
            from: process.env.TWILIO_FROM_NUMBER,
            to: phoneNumber
        });

        console.log(`2FA SMS sent to ${phoneNumber}`);
        return true;
    } catch (err) {
        console.error("Twilio SMS error:", err);
        return false;
    }
}
