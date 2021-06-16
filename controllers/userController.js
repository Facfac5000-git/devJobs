const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const multer = require('multer');
const shortId = require('shortid');

exports.accountCreate = (request, response) => {
    response.render('account_new', {
        pageName: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta.'
    });
};

exports.uploadImage = (request, response, next) => {
    upload(request, response, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    request.flash('error', 'El archivo es demasiado grando. Max 100kb');
                }else{
                    request.flash('error', error.message);
                }
            } else {
                request.flash('error', error.message);
            }
            response.redirect('/admin');
            return;
        }else{
            return next();
        }
    });
}

const multerConfiguration = {
    limits: {fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (request, file, cb) =>{
            cb(null, __dirname+'../../public/uploads/profiles')
        },
        filename: (request, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortId.generate()}.${extension}`);
        }
    }),
    fileFilter(request, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null, true);
        }else{
            cb(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(multerConfiguration).single('image');

exports.accountValidate = (request, response, next) => {

    request.sanitizeBody('name').escape();
    request.sanitizeBody('email').escape();
    request.sanitizeBody('password').escape();
    request.sanitizeBody('password_confirm').escape();

    request.checkBody('name', 'El Nombre es Obligatorio').notEmpty();
    request.checkBody('email', 'El Email es Obligatorio y debe ser válido.').isEmail();
    request.checkBody('password', 'El Password es Obligatorio').notEmpty();
    request.checkBody('password_confirm', 'Debes repetir tu Password').notEmpty();
    request.checkBody('password_confirm', 'Los passwords no coinciden entre sí').equals(request.body.password);

    const errors = request.validationErrors();

    if(errors){
        request.flash('error', errors.map(error => error.msg));
        response.render('account_new', {
            pageName: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta.',
            flash_messages: request.flash()
        });
        return;
    }

    next();
};

exports.accountSave = async (request, response, next) => {
    const user = new Users(request.body);
    
    try{
        await user.save();
        response.redirect('/account-login')
    }catch (error) {
        request.flash('error', error);
        response.redirect('/account-create');
    }

};

exports.accountLogin = (request, response) => {
    response.render('account_login', {
        pageName: 'Inicia Sesión en devJobs'
    });
};

exports.accountForgotPassword = (request, response) => {
    response.render('account_forgot_password', {
        pageName: 'Reestablece tu Password',
        tagline: 'Si ya tienes una cuenta pero has olvidado tu password, ingresa tu email.',
    });
}

exports.accountEdit = (request, response) => {
    response.render('account_edit', {
        pageName: 'Edita tu perfil en DevJobs',
        user: request.user,
        logout: true,
        image: request.user.image,
        name: request.user.name,
    });
};

exports.accountUpdate = async (request, response) => {
    const user = await Users.findById(request.user._id);
    user.name = request.body.name;
    user.email = request.body.email;

    if(request.body.password){
        user.password = request.body.password;
    }

    if(request.file){
        user.image = request.file.filename;
    }

    await user.save();

    request.flash('correcto', 'Cambios guardados correctamente.');

    response.redirect('/admin');
}

exports.userValidate = (request, response, next) => {

    request.sanitizeBody('name').escape();
    request.sanitizeBody('email').escape();
    if(request.body.password){
        request.sanitizeBody('password').escape();
    }

    request.checkBody('name', 'El Nombre es Obligatorio').notEmpty();
    request.checkBody('email', 'El Email es Obligatorio y debe ser válido.').isEmail();

    const errors = request.validationErrors();

    if(errors){
        request.flash('error', errors.map(error => error.msg));
        response.render('account_edit', {
            pageName: 'Edita tu perfil en DevJobs',
            user: request.user,
            logout: true,
            name: request.user.name,
            image: request.user.image,
            flash_messages: request.flash()
        });
        return;
    }

    next();
};