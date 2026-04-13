"use strict";

const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express();
const port = 3000;

const cities = ["Nantes", "Rennes", "Quimper"];

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
  res.render("cities/index.ejs", { cities: cities });
});

app.post(
  "/cities",
  body("city")
    .isLength({ min: 3 })
    .withMessage("La ville doit avoir au moins 3 caractères"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("cities/index.ejs", {
        errors: errors.array(),
        cities: cities,
        city: req.body.city,
      });
    }
    cities.push(req.body.city);
    res.redirect("/cities");
  },
);

app.get("/cities/:number", (req, res) => {
  if (req.params.number < 0 || req.params.number > cities.length - 1) {
    return res.status(404).send("Pas de ville à afficher");
  }
  res.send(cities[req.params.number]);
});

app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});

app.listen(port, () => {
  console.log("L'API ecoute sur le port", port);
});
