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

router.post("/sign-up", async function(req, res){

  res.redirect("/homepage");
});

router.post("/sign-in", async function(req, res){
  
  res.redirect("/homepage");
});

router.get("/homepage", async function(req, res){
  res.render("homepage");
});

module.exports = router;
