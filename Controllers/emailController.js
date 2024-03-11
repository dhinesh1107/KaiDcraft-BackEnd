import nodemailer from "nodemailer";

export const sendEmail = async(data, req, res) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: '"HEY 👻" <foo@gmail.com>', // sender address
        to: data.to, // list of receivers
        subject: data.subject, // Subject line
        text: data.text, // plain text body
        html: data.htm, // html body
      });

      console.log("Message sent: %s", info.messageId);

      console.log("preview URL: %s", nodemailer.getTestMessageUrl(info));
};