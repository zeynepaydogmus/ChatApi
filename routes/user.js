const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//kişiyi kaydederiz
router.post("/register", (req, res, next) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    const user = new User({
      username,
      password: hash,
    });
    const promise = user.save();
    promise
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  });
});
//kişiye özel token'ı auth ile alırız
router.post("/auth", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({
        status: false,
        message: "User not found.",
      });
    } else {
      bcrypt.compare(password, user.password).then((result) => {
        if (!result) {
          res.json({ status: false, message: "Wrong password" });
        } else {
          const payload = {
            username,
          };
          const token = jwt.sign(payload, req.app.get("api_secret_key"), {
            expiresIn: 720, //12 saat
          });
          res.json({
            status: true,
            token,
          });
        }
      });
    }

    // Diğer işlemler buraya eklenebilir
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
