const mongoose = require("mongoose");

const Country = mongoose.model("Country", {
  name: String,
  code: String,
  uuid: String,
});

module.exports = Country;
