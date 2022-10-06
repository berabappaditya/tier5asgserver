const jwt = require("jsonwebtoken");

//middleware  function for JWT authentication
const Auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(" I am token", token);
  if (!token) return res.status(401).send("Access Denied");

  jwt.verify(token, process.env.process.env.SECRET_TOKEN, (err, user) => {
    console.log(err);

    if (err) return res.status(403).send(err, "Invalid Token");

    req.user = user;

    next();
  });
};

module.exports = Auth;
