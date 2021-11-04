const express = require("express");
const router = express.Router();
const journeyModel = require("../models/journeys");
const userModel = require("../models/users");
const orderModel = require("../models/orders");

const city = [
  "Paris",
  "Marseille",
  "Nantes",
  "Lyon",
  "Rennes",
  "Melun",
  "Bordeaux",
  "Lille",
];
const date = [
  "2018-11-20",
  "2018-11-21",
  "2018-11-22",
  "2018-11-23",
  "2018-11-24",
];

router.get("/", function (req, res, next) {
  res.render("index");
});

router.post("/sign-up", async function (req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const alreadyRegistered = await userModel.findOne({ email: email });

  if (!alreadyRegistered) {
    const newUser = new userModel({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });

    const userSaved = await newUser.save();

    req.session.userId = userSaved._id;

    res.redirect("/homepage");
  } else {
    res.redirect("/");
  }
});

router.post("/sign-in", async function (req, res) {
  res.redirect("/homepage");
});

router.get("/homepage", async function (req, res) {
  if (req.session.userId) {
    console.log(req.session);
    res.render("homepage");
  } else {
    res.redirect("/");
  }
});

module.exports = router;
