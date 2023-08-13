const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

// Save Match History
router.post('/match', matchController.saveMatch);

// Get Match History
router.get('/match', matchController.getMatchHistory);

// Replay Match
router.get('/match/:matchId', matchController.replayMatch);

module.exports = router;
