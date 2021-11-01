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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// API endpoints

app.post("/api/users", function (req, res) {
  const newAthlete = new Athlete({
    username: req.body.username,
  });

  newAthlete.save((err, athlete) => {
    if (err) return console.error(err);
    res.json({
      username: athlete.username,
      _id: athlete.id,
    });
  });
});

app.post("/api/users/:_id/exercises", function (req, res) {
  const id = req.params._id;
  let ourDate = new Date(req.body.date + "T00:00").toDateString();
  if (ourDate == "Invalid Date") {
    ourDate = new Date().toDateString();
  }

  const exerciseToAdd = {
    description: req.body.description,
    duration: Number(req.body.duration),
    date: ourDate,
  };

  Athlete.findById(id, (err, athlete) => {
    if (err) return console.error(err);
    athlete.log.push(exerciseToAdd);
    athlete.count = athlete.log.length;

    athlete.save((err, athlete) => {
      if (err) return console.error(err);
      let exercise = athlete.log[athlete.count - 1];
      res.json({
        username: athlete.username,
        _id: athlete.id,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date,
      });
    });
  });
});

app.get("/api/users", function (req, res) {
  Athlete.find({}, (err, athletes) => {
    if (err) return console.error(err);
    let nameIdList = athletes.map((obj) => {
      return {
        username: obj.username,
        _id: obj.id,
      };
    });
    res.send(nameIdList);
  });
});

app.get("/api/users/:id/logs", function (req, res) {
  const id = req.params.id;
  let { from, to, limit } = req.query;

  from = new Date(from + "T00:00").getTime();
  to = new Date(to + "T00:00").getTime();
  limit = parseInt(limit);

  Athlete.findById(id, (err, athlete) => {
    if (err) return console.error(err);

    let filteredLog = athlete.log
      .filter((e) => {
        if (!to || !from) {
          return true;
        }
        d = new Date(e.date).getTime();
        return d >= from && d <= to;
      })
      .sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .map((e) => {
        return {
          description: e.description,
          duration: e.duration,
          date: e.date,
        };
      });

    if (limit >= 0) {
      filteredLog = filteredLog.slice(0, limit);
    }

    res.json({
      username: athlete.username,
      _id: athlete.id,
      count: athlete.count,
      log: filteredLog,
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
