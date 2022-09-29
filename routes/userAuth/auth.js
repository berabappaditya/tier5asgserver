const express = require("express");
const router = express.Router();
const userModel = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
// const validateSignup= require("./validator")

//JOI VALIDATION OF USER INPUTS PREREQUISITES
const signupSchema = Joi.object({
  userName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(16).required(),
  //confirm password must be same as password
  confirmPassword: Joi.ref("password"),
});

router.post("/signup", async (req, res) => {
  try {
    const { userName, email, password, confirmPassword } = req.body;

    const { error } = await signupSchema.validateAsync(
      { userName, email, password, confirmPassword },
      { abortEarly: false }
    );
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new userModel({
      userName: userName,
      email: email,
      password: hashedPassword,
    });
    const nwuser = await user.save();
    res.status(201).send(nwuser);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//joi login user input validation schema
const loginSchema = Joi.object({
  uniqueId: Joi.string().min(6).required(),
  password: Joi.string().min(6).required(),
});
//LOGIN USER
router.post("/login", async (req, res) => {
  try {
    //CHECKING IF USER EMAIL EXISTS
    //CECKING IF UNIQUEID EXIST IN EMAIL OR USERNAME
    const user = await userModel.findOne({
      $or: [{ email: req.body.uniqueId }, { userName: req.body.uniqueId }],
    });
    if (!user) return res.status(400).send("Incorrect Email- ID or username");

    //CHECKING IF USER PASSWORD MATCHES
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return res.status(400).send("Incorrect Password");

    //VALIDATION OF USER INPUTS
    const { error } = await loginSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      //SENDING BACK THE TOKEN
      const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN);
      res.header("auth-token", token).send({ auth_token: token, user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
