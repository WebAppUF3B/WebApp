'use strict';

/**
 * Module dependencies.
 */
const app = require('./config/lib/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//overwrite mongoose deprecated promises with native ones.
mongoose.Promise = global.Promise;

const server = app.start();
