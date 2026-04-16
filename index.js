"use strict";

const mongoose = require("mongoose");
const app = require("./app");
const { url, port } = require("./config");

mongoose
  .connect(url + "/cities_app")
  .then(() => {
    console.log("Connecté à MongoDB");
  })
  .catch((error) => {
    console.log("Pas connecté :", error);
  });

app.listen(port, () => {
  console.log("L'API ecoute sur le port", port);
});
