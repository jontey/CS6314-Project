var express = require('express');
var router = express.Router();
var auth = require('./auth');

router.post('', auth.login);

module.exports = router;