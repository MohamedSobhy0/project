const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true,
    },
    jop: {
        type: String,
        require: true,
    },
    phone: {
        type: Number,
        require: true,
        unique: true

    },
    address: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    consfirmpassword: {
        type: String,
        require: true,
    },
    // dateOfBirth: {
    //     type: Date
    // },
    image:{
        type: String,
        require: true,

    },
    token:{
        type:String,
        default:''
    }


});
module.exports = mongoose.model("User", UserSchema);

