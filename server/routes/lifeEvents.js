const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listLifeEvents, createLifeEvent, updateLifeEvent, deleteLifeEvent } = require('../controllers/lifeEventController');

router.get('/',        auth, listLifeEvents);
router.post('/',       auth, createLifeEvent);
router.patch('/:id',   auth, updateLifeEvent);
router.delete('/:id',  auth, deleteLifeEvent);

module.exports = router;
