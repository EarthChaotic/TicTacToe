const express = require('express');
var app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors");
const config = require('./config/index');
app.use(bodyParser.json());
app.use(cors());


mongoose.connect(config.MONGODB_URI,{useNewUrlParser: true, useUnifiedTopology: true})

const matchRoutes = require('./routes/match');
app.use(matchRoutes);


module.exports = app;