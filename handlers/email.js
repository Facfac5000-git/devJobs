const emailConfig = require('../config/email');
const nodeMailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');
const path = require('path');
const email = require('../config/email');
const { response } = require('express');

let transport = nodeMailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

transport.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        partialsDir: path.resolve(__dirname, 'views/emails'),
        defaultLayout: false,
    },
    viewPath: __dirname+'/../views/emails',
    extName: '.handlebars'
}))

exports.send = async (options) => {
    const emailOptions = {
        from: 'devJobs <noreply@devjobs.com',
        to: options.user.email,
        subject: options.subject,
        template: options.file,
        context: {
            resetUrl: options.resetUrl,
        }
    };

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, emailOptions);
}