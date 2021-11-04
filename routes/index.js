const express = require("express");
const router = express.Router();
const journeyModel = require("../models/journeys");
const userModel = require("../models/users");
const orderModel = require("../models/orders");

router.get("/", function (req, res, next) {
  if (req.session.userInfo) {
    console.log(req.session);
    res.redirect("/homepage");
  } else {
    res.render("index", { session: req.session.userInfo });
  }
  console.log(req.session);
});

router.get("/homepage", async function (req, res) {
  if (req.session.userInfo) {
    console.log(req.session);
    res.render("homepage", { session: req.session.userInfo });
  } else {
    res.redirect("/");
  }
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

router.post("/search", async function (req, res) {
  const from = req.body.from;
  const to = req.body.to;
  const date = new Date(req.body.date);

  const results = await journeyModel.find({
    departure: from,
    arrival: to,
    date: date,
  });

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
  if(!req.session.cart){
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
    var newOrder = await orderModel({
      journey: item._id,
      user: user.id,
    });
    const orderSaved = await newOrder.save();
    req.session.cart=[];
  }
  res.redirect("/homepage");
});

router.get("/my-journeys", async function (req, res) {
  const myJourneys = await orderModel
    .find({ user: req.session.userInfo.id })
    .populate("journey");

  res.render("myjourneys", { myJourneys, session : req.session });
});

module.exports = router;
