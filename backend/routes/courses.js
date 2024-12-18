const express = require('express');
const router = express.Router();
const pool = require('../config/db')
const { createLesson, getLessonsByCourseId, likeCourse, unlikeCourse } = require('../controllers/userController');
const multer = require('multer');
const authenticateToken = require('../middlewares/authMiddleware')
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'coursesImg/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Файлын нэрийг өөрчилж байна
  }
});

const upload = multer({ storage });

// Хичээл үүсгэх маршрут
router.post('/create', upload.single('image'), async (req, res) => {
  const { name, description, teacherId, category, price } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const newCourse = await pool.query(
      'INSERT INTO courses (name, description, image, teacher_id, category, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, image, teacherId, category, price]
    );
    res.json(newCourse.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Server error');
  }
});

// Хичээлүүдийг жагсаах
router.get('/', async (req, res) => {
  try {
    const courses = await pool.query('SELECT * FROM courses');
    res.json(courses.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Server error');
  }
});

// Хичээлийн мэдээлэл авах
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const course = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);

    if (course.rows.length === 0) {
      return res.status(404).json('Course not found');
    }

    res.json(course.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Server error');
  }
});

// Хичээл устгах
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleteCourse = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);

    if (deleteCourse.rows.length === 0) {
      return res.status(404).json('Course not found');
    }

    res.json('Course deleted');
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Server error');
  }
});

router.get('/teacher/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const courses = await pool.query('SELECT * FROM courses WHERE teacher_id = $1', [teacherId]);

    if (courses.rows.length === 0) {
      return res.status(404).json('No courses found for this teacher');
    }

    res.json(courses.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Server error');
  }
});
router.post('/like', authenticateToken, likeCourse);
router.post('/unlike', authenticateToken, unlikeCourse);

// Хичээлүүдийг жагсаах
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    let query = 'SELECT * FROM courses WHERE category IS NOT NULL';
    let params = [];

    if (category && category !== '') {
      query += ' AND category = $1';
      params.push(category);
    } else {
      // If category is not specified, return an empty array or an appropriate message
      return res.json([]); // Return an empty array if no category is provided
    }

    const courses = await pool.query(query, params);

    if (courses.rows.length === 0) {
      return res.status(404).json({ message: 'No courses found for this category' });
    }

    res.json(courses.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
