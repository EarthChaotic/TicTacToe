const Match = require('../models/Matchs'); // Assuming this is the file where your Mongoose model is defined

exports.saveMatch = async (req, res) => {
  try {
    const matchData = req.body;
    const match = new Match(matchData);
    await match.save();
    res.status(201).json({ message: 'Match saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save match' });
  }
};

exports.getMatchHistory = async (req, res) => {
  try {
    const matches = await Match.find().sort({ timestamp: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
};

exports.replayMatch = async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const match = await Match.findById(matchId);
    if (match) {
      res.json(match);
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
};