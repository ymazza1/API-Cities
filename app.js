const City = require("./models/city");
const Country = require("./models/country");

const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function dbReset() {
  await City.deleteMany();
  await Country.deleteMany();

  const france = new Country({
    name: "France",
    code: "FR",
    uuid: crypto.randomUUID(),
    europeanUnion: true,
  });
  await france.save();

  const espagne = new Country({
    name: "Espagne",
    code: "SP",
    uuid: crypto.randomUUID(),
    europeanUnion: true,
  });
  await espagne.save();

  const royaumeUni = new Country({
    name: "Royaume-Uni",
    code: "UK",
    uuid: crypto.randomUUID(),
    europeanUnion: false,
  });
  await royaumeUni.save();

  const rennes = new City({
    name: "Rennes",
    uuid: crypto.randomUUID(),
    country: france._id,
    population: 200000,
  });
  await rennes.save();
  const londres = new City({
    name: "Londres",
    uuid: crypto.randomUUID(),
    country: royaumeUni._id,
    population: 9000000,
  });
  await londres.save();
  const barcelone = new City({
    name: "Barcelone",
    uuid: crypto.randomUUID(),
    country: espagne._id,
    population: 12000000,
  });
  await barcelone.save();
  const paris = new City({
    name: "Paris",
    uuid: crypto.randomUUID(),
    country: france._id,
    population: 11000000,
  });
  await paris.save();

  await City.aggregate([
    {
      $lookup: {
        from: "countries",
        localField: "country",
        foreignField: "_id",
        as: "country",
      },
    },
    { $unwind: "$country" },
    { $match: { "country.europeanUnion": true } },
    {
      $project: {
        _id: 0,
        country: "$country.name",
        name: 1,
      },
    },
    {
      $sort: {
        population: -1,
      },
    },
  ]).then((cities) => {
    console.log("Villes en union europeenne:", cities);
  });

  await City.aggregate([
    { $group: { _id: "$country", population: { $sum: "$population" } } },
    {
      $lookup: {
        from: "countries",
        localField: "_id",
        foreignField: "_id",
        as: "country",
      },
    },
    { $unwind: "$country" },
    { $project: { _id: 0, country: "$country.name", population: 1 } },
  ]).then((cities) => {
    console.log("Population par pays", cities);
  });
}

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
  body("name")
    .isLength({ min: 3 })
    .withMessage("La ville doit avoir au moins 3 caractères"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors);
    }
    await City.create({
      name: req.body.name,
      uuid: crypto.randomUUID(),
    });

    await City.find({ name: req.body.name }).then((city) => res.json(city));
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

app.get("/countries", async (req, res) => {
  const countries = await Country.find();
  res.json(countries);
});

app.post(
  "/countries",
  body("name")
    .isLength({ min: 3 })
    .withMessage("La ville doit avoir au moins 3 caractères"),
  body("code").notEmpty().withMessage("Le code pays est obligatoire"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors);
    }
    const generatedUuid = crypto.randomUUID();
    await Country.create({
      name: req.body.name,
      code: req.body.code,
      uuid: generatedUuid,
    }).then((country) => {
      res.status(201).json(country);
    });
  },
);

app.get("/countries/:code", async (req, res) => {
  await Country.findOne({ code: req.params.code }).then((country) => {
    res.status(200).json(country);
  });
});

app.put("/countries/updateByCode/:code", async (req, res) => {
  console.log("body", req.body);

  await Country.findOneAndUpdate(
    { code: req.params.code },
    { name: req.body.name },
  ).then((country) => res.status(200).json(country));
});

app.put("/countries/updateById/:uuid", async (req, res) => {
  await Country.findOneAndUpdate(
    { uuid: req.params.uuid },
    { name: req.body.name },
    {
      new: true,
    },
  ).then((country) => res.status(200).json(country));
});

app.delete("/countries/:code", async (req, res) => {
  await Country.findOneAndDelete({ code: req.params.code }).then((response) => {
    res.status(200).json(response);
  });
});

const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger_output.json");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});

module.exports = app;
