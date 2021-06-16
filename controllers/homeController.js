const mongoose = require('mongoose');
const Vacancy = mongoose.model('Vacancy');

exports.showJobs = async (request, response, next) => {
    const vacancies = await Vacancy.find();

    if(!vacancies) return next();

    response.render('home', {
        pageName: 'devJobs',
        tagline: 'Encuentra y publica trabajos para Desarrolladores Web',
        bar: true,
        button: true,
        vacancies
    })
};