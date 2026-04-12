const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listNotifications, markRead, markAllRead, createChecklistNotifications } = require('../controllers/notificationController');

router.get('/',                auth, listNotifications);
router.post('/checklist',      auth, createChecklistNotifications);
router.patch('/mark-all-read', auth, markAllRead);
router.patch('/:id',           auth, markRead);

module.exports = router;
