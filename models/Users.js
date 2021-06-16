const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    name:{
        type: String,
        required: 'Agrega tu Nombre',
    },
    password:{
        type: String,
        required: true,
        trim: true,
    },
    token: String,
    expire_token: Date,
    image: String
});

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        return next();
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});
userSchema.post('save', function(error, doc, next){
    if(error.name === 'MongoError' && error.code === 11000){
        next('Este correo ya se encuentra registrado en devJobs.');
    }else{
        next(error);
    }
});

userSchema.methods = {
    passwordVerify: function(password){
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Users', userSchema);