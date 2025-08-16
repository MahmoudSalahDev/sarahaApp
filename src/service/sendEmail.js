import nodemailer from "nodemailer";


export const sendEmail = async ({ to, subject, html ,attachments }) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
    });


    const info = await transporter.sendMail({
        from: `"Mahmoud" <${process.env.EMAIL}>`,
        to: to || "msm25112000@gmail.com",
        subject: subject || "Hello ✔",
        html: html || "<b>Hello world?</b>", // HTML body
        attachments: attachments || []
    });

    if (info.accepted.length >0) {
        return true
    }else{
        return false

    }

}