const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacanciesController = require('../controllers/vacanciesController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.showJobs);

    //Create vacancy
    router.get('/vacancies/new',
        authController.verifyUser, 
        vacanciesController.vacancyCreate
    );
    router.post('/vacancies/new', 
        authController.verifyUser, 
        vacanciesController.validateVacancy,
        vacanciesController.vacancyStore
    );

    router.get('/vacancies/:url', vacanciesController.vacancyShow);
    router.post('/vacancies/:url', 
        vacanciesController.uploadCV, 
        vacanciesController.vacancyApply
    );

    router.get('/candidates/:id', 
        authController.verifyUser, 
        vacanciesController.vacancyCandidates
    );

    router.get('/vacancies/edit/:url', 
        authController.verifyUser, 
        vacanciesController.vacancyEdit
    );
    router.post('/vacancies/edit/:url', 
        authController.verifyUser, 
        vacanciesController.validateVacancy,
        vacanciesController.vacancyUpdate
    );

    router.delete('/vacancies/delete/:id',
        vacanciesController.vacancyDelete);

    router.get('/account-create', userController.accountCreate);
    router.post('/account-create', 
        userController.accountValidate,
        userController.accountSave
    );

    router.get('/account-login', userController.accountLogin);
    router.post('/account-login', authController.userAuthenticate);
    
    router.get('/account-logout', 
        authController.verifyUser,
        authController.userLogout
    )

    router.get('/account-forgot-password', userController.accountForgotPassword);
    router.post('/account-forgot-password', authController.accountSendToken);

    router.get('/account-recover-password/:token', authController.accountRecoverPassword);
    router.post('/account-recover-password/:token', authController.accountUpdatePassword);

    router.get('/admin', 
        authController.verifyUser, 
        authController.showPanel
    );

    router.get('/account-edit',
        authController.verifyUser,
        userController.userValidate,
        userController.accountEdit
    );
    router.post('/account-edit',
        authController.verifyUser,
        userController.uploadImage,
        userController.accountUpdate
    )
    
    router.post('/search', vacanciesController.vacancySearch);

    return router;
}