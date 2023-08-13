const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  board: [[String]],
  winner: String,
  moves: [
    {
      player: String,
      row: Number,
      col: Number,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
},{ collection: 'matches' });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
