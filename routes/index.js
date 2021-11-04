const express = require("express");
const router = express.Router();
const journeyModel = require("../models/journeys");

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
  res.render("index", { title: "Express" });
});

module.exports = router;
