const express = require("express");
const router = express.Router();
const userModel = require("../../models/User");
const Joi = require('joi');
// const validateSignup= require("./validator")

//VALIDATION OF USER INPUTS PREREQUISITES
    const signupSchema=
    Joi.object({
        userName: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(16).required(),
        //confirm password must be same as password
        confirmPassword: Joi.ref("password")
    });

router.post("/signup", async (req, res) => {
    try {
        const { userName, email, password, confirmPassword } = req.body;
    
        const { error } = await signupSchema.validateAsync({ userName, email, password, confirmPassword },{abortEarly: false});
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

          const user = new userModel({
                userName: userName,
                email: email,
                password: password,
            });
        const nwuser = await user.save();
        res.status(201).send(nwuser);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});



module.exports = router;