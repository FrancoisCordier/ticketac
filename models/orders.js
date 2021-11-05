const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  journey: [{ type: mongoose.Schema.Types.ObjectId, ref: "journeys" }],
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

const orderModel = mongoose.model("orders", orderSchema);

module.exports = orderModel;
