const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
const matchHistory = [];

app.use(express.json());

//Save Match History
app.post("/api/match", (req, res) => {
  const matchData = req.body;
  matchHistory.push(matchData);
  res.status(201).json({ message: "Match saved successfully" });
});

//Get match history
app.get("/api/match", (req, res) => {
  res.json(matchHistory);
});

//Make Match Replay
app.get('/api/match/:matchId', (req, res) => {
    const matchId = req.params.matchId;
    const match = matchHistory[matchId];
    if (match) {
      res.json(match);
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
});