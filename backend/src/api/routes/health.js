'use strict';
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'jumc-ai-backend', timestamp: new Date().toISOString() });
});

module.exports = router;
