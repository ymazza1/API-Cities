"use strict";

const url = "mongodb://localhost:27017";
const mongoose = require("mongoose");
mongoose
  .connect(url + "/cities_app")
  .then(() => {
    console.log("Connecté à MongoDB");
  })
  .catch((error) => {
    console.log("Pas connecté :", error);
  });

const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express();
const port = 3000;

const City = mongoose.model("City", {
  name: String,
  uuid: String,
});

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(
    "method: ",
    req.method,
    " url:",
    req.url,
    " user-agent:",
    req.get("User-Agent"),
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/cities", (req, res) => {
  City.find().then((cities) => {
    console.log("cities", cities);

    res.json(cities);
  });
});

app.post(
  "/cities",
  body("city")
    .isLength({ min: 3 })
    .withMessage("La ville doit avoir au moins 3 caractères"),
  async (req, res) => {
    const errors = validationResult(req);
    const cities = await City.find();
    if (!errors.isEmpty()) {
      return res.status(422).render("cities/index.ejs", {
        errors: errors.array(),
        cities: cities,
        city: req.body.city,
      });
    }
    await City.create({
      name: req.body.city,
      uuid: crypto.randomUUID(),
    });
    res.redirect("/cities");
  },
);

app.get("/cities/:uuid", (req, res) => {
  City.findOne({ uuid: req.params.uuid }).then((city) => {
    if (city) {
      res.send(city.name);
    } else {
      res.status(404).send("Ville non trouvée");
    }
  });
});

app.get("/cities/:uuid/delete", async (req, res) => {
  await City.findOneAndDelete({ uuid: req.params.uuid });
  res.redirect("/cities");
});

app.post("/cities/update", async (req, res) => {
  await City.findOneAndUpdate(
    { uuid: req.body.uuid },
    { name: req.body.city_name },
  );
  res.redirect("/cities");
});

app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});

app.listen(port, () => {
  console.log("L'API ecoute sur le port", port);
});
