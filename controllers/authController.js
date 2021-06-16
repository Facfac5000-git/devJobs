const passport = require('passport');
const mongoose = require('mongoose');
const Vacancy = mongoose.model('Vacancy');
const Users = mongoose.model('Users');
const crypto = require('crypto');
const sendEmail = require('../handlers/email');

exports.userAuthenticate = passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/account-login',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

exports.verifyUser = (request, response, next) => {
    if(request.isAuthenticated()){
        return next();
    }

    response.redirect('/account-login');
}

exports.showPanel = async (request, response) => {
    const vacancies = await Vacancy.find({author: request.user._id});

    response.render('admin', {
        pageName: 'Panel de Administración',
        tagline: 'Crea y Administra tus vacantes desde aquí',
        logout: true,
        name: request.user.name,
        image: request.user.image,
        vacancies
    })
}

exports.accountSendToken = async (request, response) => {
    const user = await Users.findOne({email: request.body.email});

    if(!user){
        request.flash('error', 'No existe la cuenta');
        return response.redirect('/account-login')
    }

    user.token = crypto.randomBytes(20).toString('hex');
    user.expire_token = Date.now() + 3600000;
    await user.save();
    
    const resetUrl = `http://${request.headers.host}/account-recover-password/${user.token}`;

    await sendEmail.send({
        user, subject: 'Reestablecer Password', resetUrl, file: 'reset'
    });
    request.flash('correcto', 'Revisa tu email para reestablecer tu password');
    response.redirect('/account-login')

}

exports.accountRecoverPassword = async (request, response) => {
    const user = await Users.findOne({
        token: request.params.token,
        expire_token: {$gt: Date.now()}
    });

    if(!user){
        request.flash('El formulario ya no es válido, intenta de nuevo');
        return response.redirect('/account-forgot-password');
    }

    response.render('account_new_password', {
        pageName: 'Nuevo Password'
    })
}

exports.accountUpdatePassword = async (request, response) => {
    const user = await Users.findOne({
        token: request.params.token,
        expire_token: {$gt: Date.now()}
    });

    if(!user){
        request.flash('El formulario ya no es válido, intenta de nuevo');
        return response.redirect('/account-forgot-password');
    }

    user.password = request.body.password;
    user.token = undefined;
    user.expire_token = undefined;
    await user.save()

    request.flash('correcto', 'Password reestablecido exitosamente.');

    response.redirect('/account-login');
}

exports.userLogout = (request, response) => {
    request.logout();
    request.flash('correcto', 'Cerraste Sesión Correctamente');
    return response.redirect('/account-login')
}