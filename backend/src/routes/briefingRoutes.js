const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/briefingController');

// POST /api/v1/chat
router.post('/chat', handleChat);

module.exports = router;