"use strict";

const mongoose = require("mongoose");
const app = require("./app");
const { url, port } = require("./config");
const swaggerAutogen = require("swagger-autogen");
const outputFile = "./swagger_output.json";
swaggerAutogen(outputFile, ["./app.js"]);

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
