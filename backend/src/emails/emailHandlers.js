import { transporter, sender } from "../lib/nodemailer.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
    await transporter.verify();
    console.log("Nodemailer transporter verified");
    try {
        const info = await transporter.sendMail({
        from: `${sender.name} <${sender.email}>`,
        to: email, 
        subject: "Welcome to SilentChat", 
        html: createWelcomeEmailTemplate(name, clientURL), 
        });

        console.log("Welcome email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error while sending mail", error);
    }
}