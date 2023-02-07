const User = require('../models/User');
const bycrptjs = require('bcryptjs');
const config = require('../config/config');
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const randomstring = require("randomstring")



const create_token = async (id) => {
    try {
        const token = await jwt.sign({ _id: id }, config.secret_jwt);
        return token;
    } catch (err) {
        res.status(400).send(err.massage);
    }
}
const securePassword = async (password) => {
    try {
        const passwordhash = await bycrptjs.hash(password, 10);
        return passwordhash;
    } catch (err) {
        res.status(400).send({ success: false, });
    }
}

const register_user = async (req, res) => {

    try {
        const spassword = await securePassword(req.body.password);

        const user = new User({
            name: req.body.name,
            jop: req.body.jop,
            phone: req.body.phone,
            address: req.body.address,
            email: req.body.email,
            password: spassword,
            consfirmpassword: req.body.consfirmpassword,
            image: req.file.filename,
        });


        const userData = await User.findOne({ email: req.body.email });
        if (userData) {
            res.status(200).send({ success: false, msg: "This email is already exists" })


        } else {
            const user_data = await user.save()
            res.status(200).send({ success: true, data: user_data })
        }

    } catch (error) {
        console.log(error)
        res.status(400).send(error.massage);
    }
};


//login

const user_login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bycrptjs.compare(password, userData.password);
            if (passwordMatch) {
                const tokenData = await create_token(userData._id);
                const userResult = {
                    _id: userData._id,
                    name: userData.name,
                    jop: userData.jop,
                    phone: userData.phone,
                    address: userData.address,
                    email: userData.email,
                    password:userData.password,
                    image: userData.image,
                    token: tokenData
                }
                const response = {
                    success: true,
                    msg: "user details",
                    data: userResult
                }
                res.status(200).send(response);
                
            } else {
                res.status(200).send({ success: false, msg: "Login details are incorrect" })
            }
            
        } else {
            res.status(200).send({ success: false, msg: "Login details are incorrect" })
        }
        
        
    } catch (error) {
        console.log(error)
        res.status(400).send(error.massage);
    }
}
//updatepassword
const update_password = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const password = req.body.password;
        const data = await User.findOne({ _id: user_id });
        if (data) {
            const newPassword = await securePassword(password);
            const userData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: newPassword } });
            res.status(200).send({ success: true, msg: "your passwoed has been updated" });
        }
        else {
            res.status(200).send({ success: false, msg: "User Id not found!" });
            
        }
        
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
        
    }
    
}
const dolaa = async (req, res) => {
    try {
        res.status(200).send({ success: true, msg: "This Link has been expired." });
        // res.status(200).json({
        //     message:"Ahmed adel"
        // })
        
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
        
    }
    
}

// forget_password

const forget_password = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const randomString = randomstring.generate();
            const data = await User.updateOne({ email: email }, { $set: { token: randomString } });
            sendResetPasswordMail(userData.name, userData.email, randomString)
            res.status(200).send({ success: true, msg: "please cheak your inbox of mail and reset password" });
            
        }
        else {
            res.status(200).send({ success: true, msg: "this email dose not exists" });
        }
        
        
    } catch (err) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

//send reset password 

const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: '<p> appp ' + name + ', Please copy the link and <a href =" http://127.0.0.1:3000/reset-password?token=' + token + '">  reset your password</a>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Mail has been sent:- ", info.response);
            }
        })
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

//reset_password
const reset_password = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            const password = req.body.password;
            const newPassword = await securePassword(password);
            const userData = await User.findByIdAndUpdate({ _id: token._id }, { $set: { password: newPassword, token: '' } }, { new: true });
            res.status(200).send({ success: true, msg: "user password has been reset", data: userData });
        }
        else {
            res.status(200).send({ success: true, msg: "This Link has been expired." });

        }

    } catch (err) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

module.exports = { register_user, user_login, update_password, forget_password, reset_password, dolaa }