const express = require("express");
const router = express.Router();
const userModel = require("../../models/User");
const jwt = require("jsonwebtoken");

//middleware  function for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).send("Access Denied");

  jwt.verify(token, process.env.process.env.SECRET_TOKEN, (err, user) => {
    console.log(err);

    if (err) return res.status(403).send(err, "Invalid Token");

    req.user = user;

    next();
  });
};

router.get("/userOrders", authenticateToken, async (req, res) => {
  try {
    const results = await userModel.find().exec();
    res.send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
