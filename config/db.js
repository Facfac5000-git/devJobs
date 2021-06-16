const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('error', (error) => {
    console.log('Hubo un error de conexión a la db: '+error);
});

//import models
require('../models/Vacancies');
require('../models/Users');