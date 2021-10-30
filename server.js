const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const athletes = new mongoose.Schema({
  username: String,
  _id: String,
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
});
const Athlete = mongoose.model("Athlete", athletes);

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// API endpoints

app.post("/api/users", function (req, res) {
  console.log(req.body);

  const newAthlete = new Athlete({
    username: req.body.username,
  });

  newAthlete.save((err, data) => {
    if (err) return console.error(err);
    res.json({
      username: data.username,
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
