const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.post('/match', matchController.saveMatch);

router.get('/match', matchController.getMatchHistory);

router.get('/match/:matchId', matchController.replayMatch);

module.exports = router;
