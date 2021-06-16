const { response } = require('express');
const mongoose = require('mongoose');
const Vacancy = mongoose.model('Vacancy');
const Users = mongoose.model('Users');
const multer = require('multer');
const shortId = require('shortid');

exports.vacancyCreate = (request, response) => {
    response.render('vacancy_new', {
        pageName: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        logout: true,
        name: request.user.name,
    });
};

exports.vacancyStore = async (request, response) => {
    const vacancy = new Vacancy(request.body);
    
    vacancy.skills = request.body.skills.split(',');
    vacancy.author = request.user._id;    
    const new_vacancy = await vacancy.save();

    response.redirect(`/vacancies/${new_vacancy.url}`);
};

exports.vacancyShow = async (request, response) => {
    const vacancy = await Vacancy.findOne({ url: request.params.url }).populate('author');

    if(!vacancy) return next();

    response.render('vacancy', {
        pageName: vacancy.title,
        bar: true,
        vacancy
    });
};

exports.uploadCV = (request, response, next) => {
    upload(request, response, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    request.flash('error', 'El archivo es demasiado grando. Max 500kb');
                }else{
                    request.flash('error', error.message);
                }
            } else {
                request.flash('error', error.message);
            }
            response.redirect('back');
            return;
        }else{
            return next();
        }
    });
};

const multerConfiguration = {
    limits: {fileSize: 750000 },
    storage: fileStorage = multer.diskStorage({
        destination: (request, file, cb) =>{
            cb(null, __dirname+'../../public/uploads/cv')
        },
        filename: (request, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortId.generate()}.${extension}`);
        }
    }),
    fileFilter(request, file, cb) {
        if(file.mimetype === 'application/pdf'){
            cb(null, true);
        }else{
            cb(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(multerConfiguration).single('cv');

exports.vacancyApply = async (request, response, next) => {
    const { url } = request.params;

    const vacancy = await Vacancy.findOne({url: request.params.url});

    if(!vacancy) return next();

    const candidate = {
        name: request.body.name,
        email: request.body.email,
        cv: request.file.filename
    }

    vacancy.candidates.push(candidate);
    await vacancy.save();
    
    request.flash('correcto', 'Se ha enviado tu curriculum correctamente');
    response.redirect('/');
}

exports.vacancyCandidates = async (request, response, next) => {
    const vacancy = await Vacancy.findById(request.params.id);
    
    if(! vacancy.author == request.user._id.toString() ){
        return next();
    }
    if(!vacancy) return next();

    response.render('vacancy_candidates', {
        pageName: `Candidatos de Vacante - ${vacancy.title}`,
        logout: true,
        name: request.user.name,
        image: request.user.image,
        candidates: vacancy.candidates
    })
}

exports.vacancyEdit = async (request, response, next) => {
    const vacancy = await Vacancy.findOne({url: request.params.url });

    if(!vacancy) return next();
    
    response.render('vacancy_edit', {
        pageName: 'Editar Vacante',
        tagline: 'Modifica los datos que quieras editar',
        logout: true,
        name: request.user.name,
        image: request.user.image,
        vacancy
    });
};

exports.vacancyUpdate = async (request, response, next) => {
    const vacancy_data = request.body;
    vacancy_data.skills = request.body.skills.split(',');

    const vacancy = await Vacancy.findOneAndUpdate({url: request.params.url }, vacancy_data, {
        new: true, runValidators: true
    });
    
    response.redirect(`/vacancies/${vacancy.url}`);
};

exports.validateVacancy = (request, response, next) => {
    
    request.sanitizeBody('title').escape();
    request.sanitizeBody('company').escape();
    request.sanitizeBody('location').escape();
    request.sanitizeBody('salary').escape();
    request.sanitizeBody('contract').escape();
    request.sanitizeBody('skills').escape();

    request.checkBody('title', 'Agrega un título a la vacante').notEmpty();
    request.checkBody('company', 'Agrega una empresa').notEmpty();
    request.checkBody('location', 'Agrega una ubicación').notEmpty();
    request.checkBody('contract', 'Selecciona un tipo de contrato').notEmpty();
    request.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    const errors = request.validationErrors();

    if(errors){
        request.flash('error', errors.map(error => error.msg));

        response.render('vacancy_new', {
            pageName: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            logout: true,
            name: request.user.name,
            image: request.user.image,
            flash_messages: request.flash()
        })

        return;
    }

    next();
};

exports.vacancyDelete = async (request, response) => {
    const {id} = request.params;

    const vacancy = await Vacancy.findById(id);

    if(verifyAuthor(vacancy, request.user)){
        vacancy.remove();
        response.status(200).send('Vacante Eliminada Correctamente');
    }else{
        response.status(403).send('Error');
    }
}

const verifyAuthor = (vacancy = {}, user = {}) => {
    if(!vacancy.author.equals(user._id)){
        return false;
    }
    return true;
}

exports.vacancySearch = async (request, response) => {
    const { q } = request.body;

    const vacancies = await Vacancy.find({
        $text: {
            $search : q
        }
    });

    response.render('home', {
        pageName: `Resultados para la búsqueda: ${q}`,
        bar: true,
        vacancies
    })
}