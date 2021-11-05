const express = require("express");
const router = express.Router();
const journeyModel = require("../models/journeys");
const userModel = require("../models/users");
const orderModel = require("../models/orders");
const { body, validationResult } = require("express-validator");
const { check } = require("express-validator");

router.get("/", function (req, res) {
  const errors = validationResult(req).errors;

  req.session.form = req.session.form
    ? req.session.form
    : { firstName: "", lastName: "", email: "" };

  if (req.session.userInfo) {
    console.log(req.session);
    res.redirect("/homepage");
  } else {
    res.render("index", {
      session: req.session.userInfo,
      errors,
      sessionForm: req.session.form,
    });
  }
  console.log(req.session);
});

router.get("/homepage", async function (req, res) {
  if (req.session.userInfo) {
    const citiesList = await journeyModel.distinct("departure");
    console.log(citiesList);
    res.render("homepage", { session: req.session.userInfo, citiesList });
  } else {
    res.redirect("/");
  }
});

router.post(
  "/sign-up",
  body("firstName")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("Please enter your first name"),
  body("lastName")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("Please enter your last name"),
  body("email").custom(async (email) => {
    return await userModel.findOne({ email: email }).then((user) => {
      if (user) {
        return Promise.reject("E-mail already in use");
      }
    });
  }),
  check("password", "The password must be 5+ chars long and contain a number")
    .not()
    .isIn(["123", "password", "god"])
    .withMessage("Do not use a common word as the password")
    .isLength({ min: 5 })
    .matches(/\d/),
  check("email").isEmail().withMessage("Please enter a valid email address"),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.form.firstName = req.body.firstName;
      req.session.form.lastName = req.body.lastName;
      req.session.form.email = req.body.email;
      console.log(req.session);
      console.log(errors);
      res.render("index", {
        session: req.session.userInfo,
        errors: errors.errors,
        sessionForm: req.session.form,
      });
    } else {
      const { firstName, lastName, email, password } = req.body;
      // const alreadyRegistered = await userModel.findOne({ email: email });

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
    }
  }
);

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

router.post("/search", async function (req, res) {
  const from = req.body.from;
  const to = req.body.to;
  const date = new Date(req.body.date);

  const results = await journeyModel.find({
    departure: from,
    arrival: to,
    date: date,
  });
  console.log(results);
  res.render("searchresult", { results, session: req.session.userInfo, date });
});

router.get("/add-to-cart", async function (req, res) {
  const journeyId = req.query.resultId;

  if (req.session.cart) {
    req.session.cart.push(await journeyModel.findOne({ _id: journeyId }));
  } else {
    req.session.cart = [];
    req.session.cart.push(await journeyModel.findOne({ _id: journeyId }));
  }
  console.log(req.session);

  res.redirect("/cart");
});

router.get("/cart", function (req, res) {
  const session = req.session;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  const myCart = req.session.cart;
  let totalCart = 0;

  for (let item of myCart) {
    totalCart += item.price;
  }

  console.log(session);

  res.render("cart", { session, myCart, totalCart });
});

router.get("/checkout", async function (req, res) {
  const myCart = req.session.cart;
  const user = req.session.userInfo;

  for (let item of myCart) {
    const newOrder = await orderModel({
      journey: item._id,
      user: user.id,
    });
    const orderSaved = await newOrder.save();
    req.session.cart = [];
  }
  res.redirect("/homepage");
});

router.get("/my-journeys", async function (req, res) {
  const myJourneys = await orderModel
    .find({ user: req.session.userInfo.id })
    .populate("journey");

  res.render("myjourneys", { myJourneys, session: req.session });
});

module.exports = router;
