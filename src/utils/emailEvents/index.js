import { EventEmitter } from "events";
import { sendEmail } from "../../service/sendEmail.js";
import userModel from "../../DB/Models/user.model.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("sendEmail", async (data) => {
    const { email } = data;
    const user = await userModel.findOne({ email });

    if (!user) throw new Error("User not found");

    // if user is banned, ignore sending
    if (user.verificationCodeBanUntil && user.verificationCodeBanUntil > new Date()) return;

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    user.verificationCodeAttempts = 0;
    user.verificationCodeBanUntil = null;

    await user.save();

    const html = `<p>Your verification code is: <strong>${code}</strong></p>`;

    const isSent = await sendEmail({
        to: email,
        subject: "Your Email Verification Code",
        html,
    });

    if (!isSent) {
        throw new Error("Failed to send verification code email");
    }
});


eventEmitter.on("forgetPassword", async (data) => {
    const { email , otp} = data;
//    send OTP

    const isSent = await sendEmail({
        to: email,
        subject: "Forget Password",
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    if (!isSent) {
        throw new Error("Failed to send Fotget Password OTP email");
    }
});
