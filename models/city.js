const mongoose = require("mongoose");

const City = mongoose.model("City", {
  name: String,
  uuid: String,
});

module.exports = City;
