const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const _handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const { response } = require('express');
const passport = require('./config/passport');
const { create } = require('./models/Vacancies');

require('dotenv').config({path: 'variables.env'});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(expressValidator());

app.engine('handlebars',
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars'),
        handlebars: allowInsecurePrototypeAccess(_handlebars)
    })
);
app.set('view engine', 'handlebars');

//static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    //store: MongoStore.create({mongoUrl: process.env.DATABASE})
    store: new MongoStore({
        mongoUrl: mongoose.connection._connectionString,
        mongoOptions: {useUnifiedTopology: true}
      })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((request, response, next) => {
    response.locals.flash_messages = request.flash();
    next();
});

app.use('/', router());

app.use((request, response, next) => {
    next(createError(404, 'No encontrado'));
});

app.use((error, request, response, next) => {
    response.locals.error_message = error.message;
    const status = error.status || 500;
    response.locals.status = status;
    response.status(status);
    response.render('error');
})

const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port, host, () => {
    console.log('El servidor está funcionando');
});