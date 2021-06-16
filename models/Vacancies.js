const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortid = require('shortid');

const vacanciesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
    },
    salary: {
        type: String,
        trim: true,
        default: 0
    },
    contract: {
        type: String
    },
    description: {
        type: String,
        trim: true
    },
    url:{
        type: String,
        lowercase: true
    },
    skills: [String],
    candidates: [{
        name: String,
        email: String,
        cv: String
    }],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: 'El Usuario es obligatorio'
    }
});
vacanciesSchema.pre('save', function(next) {
    const url = slug(this.title);
    this.url = `${url}-${shortid.generate()}`;
    next();
})

vacanciesSchema.index({title: 'text', company: 'text'});

module.exports = mongoose.model('Vacancy', vacanciesSchema);