const express = require("express");
const router = express.Router();
const userModel = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const Auth = require("../Middleware/verify");
// const validateSignup= require("./validator")

//JOI VALIDATION OF USER INPUTS PREREQUISITES
const signupSchema = Joi.object({
  userName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(16).required(),
  //confirm password must be same as password
  confirmPassword: Joi.ref("password"),
});

const generateAccessToken = (username) => {
  const token = jwt.sign(username, process.env.SECRET_TOKEN, {
    expiresIn: "24h",
  });
  return token;
};

router.post("/signup", async (req, res) => {
  try {
    const { userName, email, password, confirmPassword } = req.body;

    //checking if user userName already exists
    const userNameExist = await userModel.findOne({ userName: userName });
    //If userName already Exists then return
    if (userNameExist) {
      res.status(400).send("userName already exists");
      return;
    }

    //checking if user email already exists
    const emailExist = await userModel.findOne({ email: email });
    //If Email Exists then return
    if (emailExist) {
      res.status(400).send("Email already exists");
      return;
    }

    const { error } = await signupSchema.validateAsync(
      { userName, email, password, confirmPassword },
      { abortEarly: false }
    );
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = generateAccessToken({ user: userName });

    const user = new userModel({
      userName: userName,
      email: email,
      password: hashedPassword,
      dashboard: {
        usagechart: true,
        usagePie: true,
        topUsage: true,
      },
    });
    user.tokens.push({ token });
    const nwuser = await user.save();
    res
      .status(200)
      .header("auth-token", token)
      .send({ auth_token: token, nwuser });
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
    //creating fiter
    const filter = {
      $or: [{ email: req.body.uniqueId }, { userName: req.body.uniqueId }],
    };
    //CECKING IF  EMAIL OR USERNAME EXIST
    const user = await userModel.findOne(filter);
    if (!user) return res.status(400).send("Incorrect Email or username");

    //CHECKING IF USER PASSWORD MATCHES
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return res.status(400).send("Incorrect Password");
    // console.log(user);
    //VALIDATION OF USER INPUTS
    const { error } = await loginSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      //SENDING BACK THE TOKEN
      const token = generateAccessToken({ user: user.userName });
      const newTokens = { tokens: [{ token: token }] };
      //updating tokens

      let doc = await userModel.findOneAndUpdate(filter, newTokens, {
        new: true,
      });

      res.header("auth-token", token).send({ auth_token: token, doc });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//JWT token authentication api
router.get("/userOrders", Auth, async (req, res) => {
  try {
    const results = await userModel.find().exec();
    res.send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/dashboardData", Auth, async (req, res) => {
  try {
    const results = await userModel.find().exec();
    res.send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
