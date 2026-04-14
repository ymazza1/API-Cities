"use strict";

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express();
const port = 3000;

const db = client.db("cities_app");

client
  .connect()
  .then(() => {
    console.log("Connexion réussie");
  })
  .catch((error) => {
    console.log("Connexion échouée:", error);
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
  db.collection("cities_collection")
    .find()
    .toArray()
    .then((cities) => {
      res.render("cities/index.ejs", { cities: cities });
    });
});

app.post(
  "/cities",
  body("city")
    .isLength({ min: 3 })
    .withMessage("La ville doit avoir au moins 3 caractères"),
  async (req, res) => {
    const errors = validationResult(req);
    const cities = await db.collection("cities_collection").find().toArray();
    if (!errors.isEmpty()) {
      return res.status(422).render("cities/index.ejs", {
        errors: errors.array(),
        cities: cities,
        city: req.body.city,
      });
    }
    await db.collection("cities_collection").insertOne({
      name: req.body.city,
      uuid: crypto.randomUUID(),
    });
    res.redirect("/cities");
  },
);

app.get("/cities/:uuid", (req, res) => {
  db.collection("cities_collection")
    .findOne({ uuid: req.params.uuid })
    .then((city) => {
      if (city) {
        res.send(city.name);
      } else {
        res.status(404).send("Ville non trouvée");
      }
    });
});

app.get("/cities/:uuid/delete", async (req, res) => {
  await db
    .collection("cities_collection")
    .deleteOne({ uuid: req.params.uuid })
    .then((response) => {
      console.log("res", response);

      if (response.deletedCount === 1) {
        res.redirect("/cities");
      } else {
        res.status(404).send("Ville non trouvée");
      }
    });
});

app.post("/cities/update", async (req, res) => {
  await db.collection("cities_collection").updateOne(
    { uuid: req.body.uuid },
    {
      $set: { name: req.body.city_name },
    },
  );
  res.redirect("/cities");
});

app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});

app.listen(port, () => {
  console.log("L'API ecoute sur le port", port);
});
