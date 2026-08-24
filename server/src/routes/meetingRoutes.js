const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  createMeeting,
  getMeetings,
  getMeetingById,
  deleteMeeting,
} = require('../controllers/meetingController');

const router = express.Router();

router.use(requireAuth);

router.post('/', upload.single('audio'), createMeeting);
router.get('/', getMeetings);
router.get('/:id', getMeetingById);
router.delete('/:id', deleteMeeting);

module.exports = router;
