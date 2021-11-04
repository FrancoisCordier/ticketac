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
  if (req.session.userInfo) {
    console.log(req.session);
    res.redirect("/homepage");
  } else {
    res.render("index", { session: req.session.userInfo });
  }

  console.log(req.session);
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

    req.session.userInfo = {
      id: userSaved._id,
      firstName: userSaved.firstName,
      lastName: userSaved.lastName,
    };

    res.redirect("/homepage");
  } else {
    res.redirect("/");
  }
});

router.post("/sign-in", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const userExist = await userModel.findOne({
    email: email,
    password: password,
  });

  if (userExist) {
    req.session.userInfo = {
      id: userExist._id,
      firstName: userExist.firstName,
      lastName: userExist.lastName,
    };
    res.redirect("/homepage");
  } else {
    res.redirect("/");
  }
});

router.get("/sign-out", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

router.get("/homepage", async function (req, res) {
  if (req.session.userInfo) {
    console.log(req.session);
    res.render("homepage", { session: req.session.userInfo });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
