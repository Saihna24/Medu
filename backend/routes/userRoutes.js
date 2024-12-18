const pool = require('../config/db')
const express = require('express');
const fs = require('fs');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {sendVerificationEmail, sendSuccessEmail, sendRejectionEmail} = require('../services/mailer');
const { register, login, verifyEmail, purchaseCourse, getCoursePurchaseCount, getCourseRatings, getMyCourses, getTopCourses, teacherAllCourse, getTeacher, deleteAllUsers, getAllStudents, updateCoursesTaken,updateTeacher, deleteTeacher, deleteStudent, updateStudent, getAllTeachers, updateUserProfile, generateResetCode, verifyResetCode, resetPassword, createRequest, getRequests } = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const coursesRouter = require('./courses');
router.use('/courses', coursesRouter);
router.post('/purchase', purchaseCourse);
router.get('/my-courses', authenticateToken, getMyCourses);

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.delete('/delete-all-users', deleteAllUsers);
router.get('/students', getAllStudents);
router.delete('/students/:id', deleteStudent);
router.put('/students/:id', updateStudent);
router.put('/students/courses/:id', updateCoursesTaken);
router.get('/teachers', getAllTeachers);
router.get('/teacherProfile/:id', getTeacher);
router.get('/teacherAllCourse/:id', teacherAllCourse)

router.put('/users/me', authenticateToken, updateUserProfile);

router.get('/users/me', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query('SELECT id, email, firstname, lastname, role, is_verified FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});
router.post('/request-reset', async (req, res) => {
    const { email } = req.body;
    await generateResetCode(email);
    res.status(200).send('Сэргээх код илгээсэн');
});

router.post('/verify-reset-code', async (req, res) => {
    const { email, code } = req.body;
    const valid = await verifyResetCode(email, code);
    res.status(valid ? 200 : 400).send(valid ? 'Код баталгаажсан' : 'Код буруу эсвэл хугацаа дууссан');
});

router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    await resetPassword(email, newPassword);
    res.status(200).send('Нууц үг амжилттай солигдсон');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Зураг хадгалах хавтас
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Зургийн нэрийг давхардалаас хамгаалахын тулд огноо, файлын нэрийг хослуулж ашиглах
  }
});

  
  const upload = multer({ storage });

router.post('/request-teacher', upload.single('image'), async (req, res) => {
  let { email, firstname, lastname, subject, experience, password } = req.body;
  const image = req.file ? req.file.path : null;

  // Convert email to lowercase
  email = email.toLowerCase();

  try {
    // Check if the email already exists
    const existingRequestResult = await pool.query('SELECT * FROM teacher_requests WHERE email = $1 AND status = $2', [email, 'pending']);
    
    if (existingRequestResult.rows.length > 0) {
      return res.status(400).json({ error: 'И-мэйл хаяг аль хэдийн бүртгэгдсэн байна' });
    }

    // Insert new request
    const result = await pool.query(
      'INSERT INTO teacher_requests (email, firstname, lastname, subject, experience, image, password, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [email, firstname, lastname, subject, experience, image, password, 'pending']
    );

    const newRequest = result.rows[0];

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});



  router.get('/teacher-requests', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM teacher_requests WHERE status = $1', ['pending']);
        res.status(200).json(result.rows);
      } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: 'Серверийн алдаа' });
      }
    });

    const deleteImage = (imagePath) => {
        if (imagePath) {
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error('Зураг устгахад алдаа гарлаа:', err.message);
            } else {
              console.log('Зураг амжилттай устгалаа');
            }
          });
        }
      };
      router.patch('/teacher-requests/:id', async (req, res) => {
        const { id } = req.params;
        const { action } = req.body;
      
        try {
          if (action === 'approve') {
            const requestResult = await pool.query('SELECT * FROM teacher_requests WHERE id = $1', [id]);
            const request = requestResult.rows[0];
      
            if (!request) {
              return res.status(404).json({ error: 'Хүсэлт олдсонгүй' });
            }
      
            // Hash the password before inserting into the users table
            const password = await bcrypt.hash(request.password, 10);
      
            const userResult = await pool.query(
              'INSERT INTO users (email, firstname, lastname, subject, experience, image, password, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
              [request.email, request.firstname, request.lastname, request.subject, request.experience, request.image, password, 'teacher']
            );
      
            const newTeacher = userResult.rows[0];
      
            // Update request status to approved
            await pool.query('UPDATE teacher_requests SET status = $1 WHERE id = $2', ['approved', id]);
      
            // Send approval email
            await sendSuccessEmail(
              request.email,
              'Багшаар бүртгэгдсэн тухай',
              `Таныг багшаар бүртгэлээ. Амжилт хүсье!`
            );
      
            res.status(200).json(newTeacher);
          } else if (action === 'reject') {
            // Get the request to find the image path
            const requestResult = await pool.query('SELECT image FROM teacher_requests WHERE id = $1', [id]);
            const request = requestResult.rows[0];
      
            if (request) {
              // Delete the image file if it exists
              if (request.image) {
                const imagePath = path.join(__dirname, '..', request.image);
                if (fs.existsSync(imagePath)) {
                  fs.unlinkSync(imagePath);
                }
              }
      
              // Update request status to rejected
              await pool.query('UPDATE teacher_requests SET status = $1 WHERE id = $2', ['rejected', id]);
      
              // Send rejection email
              await sendRejectionEmail(request.email);
      
              res.status(200).json({ message: 'Хүсэлтийг татгалзлаа' });
            } else {
              res.status(404).json({ error: 'Хүсэлт олдсонгүй' });
            }
          } else {
            res.status(400).json({ error: 'Буруу үйлдэл' });
          }
        } catch (error) {
          console.error('Server error:', error.message);
          res.status(500).json({ error: 'Серверийн алдаа' });
        }
      });
      router.patch('/requests/:id', async (req, res) => {
        const { id } = req.params;
        const { action } = req.body; // "approve" буюу "reject" гэж ирэх
    
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }
    
        try {
            const status = action === 'approve' ? 'approved' : 'rejected';
    
            // SQL хүсэлт
            const query = 'UPDATE course_requests SET status = $1 WHERE id = $2 RETURNING *';
            const values = [status, id];
    
            const result = await pool.query(query, values);
    
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Request not found' });
            }
        } catch (error) {
            console.error('Error updating request status:', error);
            res.status(500).json({ message: 'Server error' });
        }
        });
    router.delete('/requests/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM course_requests WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ error: 'Failed to delete request' });
    }
});
    

    router.put('/teachers/:id', updateTeacher);
    router.delete('/teachers/:id', deleteTeacher);
    router.post('/requests', createRequest, (req, res) => {
      try {
          const { title, description } = req.body;
          // Process request here
  
          // Example of potential issue:
          if (!title || !description) {
              throw new Error('Missing title or description');
          }
  
          // Respond with success
          res.status(201).json({ message: 'Request received' });
      } catch (error) {
          console.error('Error handling request:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  });
    router.get('/requests', getRequests);
    router.get('/top-courses', getTopCourses);
    router.get('/course/:id/purchase-count', getCoursePurchaseCount);
    router.get('/courses/:courseId/ratings', getCourseRatings);
 
    
module.exports = router;
