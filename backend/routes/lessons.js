const express = require('express');
const router = express.Router();
const { createLesson, getLessons, getLesson, deleteLesson } = require('../controllers/lessonController');
const multer = require('multer');
const upload = multer({ dest: 'videos/' }); // Видео хадгалах
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'videos/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
// Хичээл үүсгэх маршрут
router.post('/courses/:courseId/lessons', upload.single('video'), createLesson);
router.get('/courses/:courseId/lessons', getLessons);
router.get('/lessons/:id', getLesson);
router.delete('/lessons/:id', deleteLesson);

module.exports = router;
