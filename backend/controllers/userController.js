const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/mailer');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });
  
async function generateResetCode(email) {
    // Имэйл хаягийг жижиг үсгээр хөрвүүлэх
    email = email.toLowerCase();
    
    // Бүртгэлтэй хэрэглэгч байгаа эсэхийг шалгах
    const userQuery = await pool.query('SELECT email FROM users WHERE email = $1', [email]);

    if (userQuery.rows.length === 0) {
        throw new Error('Имэйл хаяг бүртгэлгүй байна');
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 цаг

    // Хэрэглэгчийн reset code болон expires_at-г шинэчлэх
    await pool.query(
        'UPDATE users SET reset_code = $1, expires_at = $2 WHERE email = $3',
        [resetCode, expiresAt, email]
    );

    // И-мэйл илгээх
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Нууц үг сэргээх код',
        text: `Таны нууц үг сэргээх код: ${resetCode}`
    };

    await transporter.sendMail(mailOptions);
}
async function verifyResetCode(email, code) {
    // Имэйл хаягийг жижиг үсгээр хөрвүүлэх
    email = email.toLowerCase();
    
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND reset_code = $2 AND expires_at > NOW()',
        [email, code]
    );

    return result.rowCount > 0;
}

// Шинэ нууц үг үүсгэх функц
async function resetPassword(email, newPassword) {
    // Имэйл хаягийг жижиг үсгээр хөрвүүлэх
    email = email.toLowerCase();
    
    // Нууц үгийг хэшлэх
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Нууц үгийг шинэчлэх
    await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashedPassword, email]
    );
}

  
// Хэрэглэгчийн профайлыг шинэчлэх функц
const updateUserProfile = async (req, res) => {
    const { firstname, lastname, email } = req.body;
    const userId = req.user.id; // Get user ID from token
  
    try {
      if (!firstname || !lastname || !email) {
        return res.status(400).json({ error: 'Бүх талбар мэдээлэлтэй байх шаардлагатай' });
      }
  
      // Validate email format
      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: 'Тохиромжтой имэйл хаяг оруулна уу' });
      }
  
      const normalizedEmail = email.toLowerCase();
  
      // Update user information
      const result = await pool.query(
        'UPDATE users SET firstname = $1, lastname = $2, email = $3 WHERE id = $4 RETURNING id, firstname, lastname, email',
        [firstname, lastname, normalizedEmail, userId]
      );
      const updatedUser = result.rows[0];
  
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Серверийн алдаа гарлаа' });
    }
  };
  


// Бүртгүүлэх функц
const register = async (req, res) => {
    const { email, password, firstname, lastname } = req.body; // role-г хассан

    try {
        // Мэдээлэл шаардлагатай гэдгийг шалгах
        if (!email || !password || !firstname || !lastname) {
            return res.status(400).json({ error: 'Бүх талбар мэдээлэлтэй байх шаардлагатай' });
        }

        // И-мэйлын формат шалгах
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Буруу и-мэйл хаяг' });
        }

        const normalizedEmail = email.toLowerCase();

        // И-мэйл байгаа эсэхийг шалгах
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (result.rows.length > 0) {
            return res.status(400).json({ error: 'Энэхүү И-мэйл бүртгэгдсэн байна' });
        }

        // Нууц үгийн формат шалгах
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: 'Нууц үг нь хамгийн багадаа 8 тэмдэгт, нэг том үсэг, нэг жижиг үсэг, нэг тоо агуулсан байх ёстой.' });
        }

        // Нууц үгийг хэшлэх
        const hashedPassword = await bcrypt.hash(password, 10);

        // Баталгаажуулах код болон хугацаа үүсгэх
        const verificationCode = crypto.randomInt(100000, 1000000).toString();
        const currentTime = new Date();
        const expiryTime = new Date(currentTime.getTime() + 10 * 60000); // 10 минутын дараа дуусна

        // Хэрэглэгчийг `student` үүрэгтэйгээр бүртгэх
        await pool.query(
            'INSERT INTO users (email, password, firstname, lastname, role, verification_code, verification_code_expiry, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)',
            [normalizedEmail, hashedPassword, firstname, lastname, 'student', verificationCode, expiryTime]
        );

        // Баталгаажуулах и-мэйл илгээх
        await sendVerificationEmail(normalizedEmail, verificationCode);

        res.status(201).json({ message: 'Бүртгэл амжилттай. И-мэйлээ шалгаж баталгаажуулах кодоо авна уу.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};





// Нэвтрэх функц
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'И-мэйл болон нууц үг шаардлагатай' });
        }

        const normalizedEmail = email.toLowerCase();
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            // Давхар нэвтрэхийг хаах
            await pool.query('UPDATE users SET current_token = NULL WHERE email = $1', [normalizedEmail]);

            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            
            // Шинэ токеныг хадгалах
            await pool.query('UPDATE users SET current_token = $1 WHERE email = $2', [token, normalizedEmail]);

            res.json({ token });
        } else {
            res.status(401).json({ error: 'Буруу баталгаа' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};



// И-мэйл баталгаажуулах функц
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
        if (!email || !code) {
            return res.status(400).json({ error: 'И-мэйл болон баталгаажуулах код шаардлагатай' });
        }

        const normalizedEmail = email.toLowerCase();
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
        }

        const currentTime = new Date();
        if (user.verification_code === code) {
            if (user.verification_code_expiry < currentTime) {
                await pool.query('DELETE FROM users WHERE email = $1', [normalizedEmail]);
                return res.status(400).json({ error: 'Баталгаажуулах кодын хугацаа дууссан, бүртгэл устгасан байна.' });
            }

            await pool.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [normalizedEmail]);
            res.json({ message: 'И-мэйл амжилттай баталгаажууллаа', is_verified: true });
        } else {
            res.status(400).json({ error: 'Буруу баталгаажуулах код', is_verified: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};

// Бүх хэрэглэгчдийг устгах функц
const deleteAllUsers = async (req, res) => {
    try {
        await pool.query('DELETE FROM users');
        res.json({ message: 'Бүх хэрэглэгчид амжилттай устгагдлаа.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};

// Бүх хэрэглэгчдийг авах функц
const getAllStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id, 
                u.email, 
                u.firstname, 
                u.lastname, 
                u.role, 
                u.is_verified, 
                TO_CHAR(u.created_at, 'YYYY-MM-DD') as created_at, 
                COALESCE(COUNT(p.course_id), 0) as courses_taken
            FROM users u
            LEFT JOIN purchases p ON u.id = p.user_id
            WHERE u.role = $1
            GROUP BY u.id
        `, ['student']);
        const students = result.rows;

        if (students.length > 0) {
            res.json(students);
        } else {
            res.status(404).json({ error: 'Сурагчид олдсонгүй' });
        }
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};

// Устгах функц
const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 AND role = $2', [id, 'student']);
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Сурагчийг амжилттай устгалаа' });
        } else {
            res.status(404).json({ error: 'Сурагч олдсонгүй' });
        }
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};
// Засах функц
const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, courses_taken, role } = req.body;

    try {
        const result = await pool.query(
            'UPDATE users SET firstname = $1, lastname = $2, email = $3, courses_taken = $4, role = $5 WHERE id = $6 RETURNING *',
            [firstname, lastname, email, courses_taken, role, id]
        );
        const updatedStudent = result.rows[0];
        if (updatedStudent) {
            res.json(updatedStudent);
        } else {
            res.status(404).json({ error: 'Сурагч олдсонгүй' });
        }
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};

const updateTeacher = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, subject, experience } = req.body;

    try {
        const result = await pool.query(
            'UPDATE users SET firstname = $1, lastname = $2, email = $3, subject = $4, experience = $5 WHERE id = $6 RETURNING *',
            [firstname, lastname, email, subject, experience, id]
        );
        const updatedTeacher = result.rows[0];
        if (updatedTeacher) {
            res.json(updatedTeacher);
        } else {
            res.status(404).json({ error: 'Багш олдсонгүй' });
        }
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};


  
  // Багшийн мэдээллийг устгах
  const deleteTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 AND role = $2', [id, 'teacher']);
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Багшийг амжилттай устгалаа' });
        } else {
            res.status(404).json({ error: 'Багш олдсонгүй' });
        }
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};





const getAllTeachers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, firstname, lastname, subject, experience, image, TO_CHAR(created_at, \'YYYY-MM-DD\') as created_at FROM users WHERE role = $1', ['teacher']);
        const teachers = result.rows;

        if (teachers.length > 0) {
            res.json(teachers);
        } else {
            res.status(404).json({ error: 'Багш нар олдсонгүй' });
        }
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};

const getUserByEmail = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ error: 'И-мэйл шаардлагатай' });
        }

        const normalizedEmail = email.toLowerCase();
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        const user = result.rows[0];

        if (user) {
            res.json({
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                created_at: user.created_at,
                is_verified: user.is_verified,
            });
        } else {
            res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};


const updateCoursesTaken = async (req, res) => {
    const { id } = req.params;
    const { courses_taken } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET courses_taken = $1 WHERE id = $2 AND role = $3 RETURNING *',
            [courses_taken, id, 'student']
        );
        const updatedStudent = result.rows[0];
        if (updatedStudent) {
            res.json(updatedStudent);
        } else {
            res.status(404).json({ error: 'Сурагч олдсонгүй' });
        }
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: 'Серверийн алдаа' });
    }
};

const createRequest = async (req, res) => {
    const { title, description, teacher_email } = req.body;
    try {
        // Make sure teacher_email is present
        if (!title || !description || !teacher_email) {
            throw new Error('Missing title, description, or teacher email');
        }
        const result = await pool.query(
            'INSERT INTO course_requests (title, description, teacher_email) VALUES ($1, $2, $3) RETURNING *',
            [title, description, teacher_email]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).json({ message: error.message });
    }
};


const getRequests = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM course_requests');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTeacher = async (req, res) => {
    try {
      const teacherId = req.params.id;
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [teacherId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
const teacherAllCourse = async (req, res) =>{
    try{
        const TeacherCourses = req.params.id;
        const result = await pool.query('SELECT * FROM courses where teacher_id = $1',[TeacherCourses])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
          }
      
          res.json(result.rows);
        } catch (error) {
          console.error('Error fetching teacher data:', error);
          res.status(500).json({ message: 'Server error' });
        }
};
  
const purchaseCourse = async (req, res) => {
    const { userId, courseId } = req.body;
    try {
        const result = await pool.query('INSERT INTO purchases (user_id, course_id) VALUES ($1, $2) RETURNING *', [userId, courseId]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    
};


const getMyCourses = async (req, res) => {
    try {
        const userId = req.user.id; // `authenticateToken` миддлвэйр-ээс авсан хэрэглэгчийн id

        if (!userId) {
            return res.status(400).json({ error: 'User ID is missing' });
        }

        // `purchases` хүснэгтээс хэрэглэгчийн id-тай тэнцүү мэдээллийг авах SQL асуулга
        // DISTINCT ашиглаж, давхардсан курсийг арилгана
        const result = await pool.query('SELECT DISTINCT course_id FROM purchases WHERE user_id = $1', [userId]);

        // Хариуг буцаах
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const likeCourse = async (req, res) => {
  const { userId, courseId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Please log in to like a course' });
  }

  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  try {
    const userLikeResult = await pool.query('SELECT * FROM user_likes WHERE user_id = $1 AND course_id = $2', [userId, courseId]);

    if (userLikeResult.rows.length > 0) {
      return res.status(400).json({ error: 'User has already liked this course' });
    }

    await pool.query('UPDATE courses SET likes = likes + 1 WHERE id = $1', [courseId]);
    await pool.query('INSERT INTO user_likes (user_id, course_id) VALUES ($1, $2)', [userId, courseId]);

    const result = await pool.query('SELECT likes FROM courses WHERE id = $1', [courseId]);
    const likes = result.rows[0].likes;

    res.status(200).json({ message: 'Course liked successfully', likes });
  } catch (error) {
    console.error('Error liking course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const unlikeCourse = async (req, res) => {
  const { userId, courseId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Please log in to unlike a course' });
  }

  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  try {
    const userLikeResult = await pool.query('SELECT * FROM user_likes WHERE user_id = $1 AND course_id = $2', [userId, courseId]);

    if (userLikeResult.rows.length === 0) {
      return res.status(400).json({ error: 'User has not liked this course yet' });
    }

    await pool.query('UPDATE courses SET likes = likes - 1 WHERE id = $1', [courseId]);
    await pool.query('DELETE FROM user_likes WHERE user_id = $1 AND course_id = $2', [userId, courseId]);

    const result = await pool.query('SELECT likes FROM courses WHERE id = $1', [courseId]);
    const likes = result.rows[0].likes;

    res.status(200).json({ message: 'Course unliked successfully', likes });
  } catch (error) {
    console.error('Error unliking course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTopCourses = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM courses ORDER BY likes DESC LIMIT 5');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  const getCoursePurchaseCount = async (req, res) => {
    const courseId = req.params.id;
    try {
      const result = await pool.query(`
        SELECT COUNT(DISTINCT user_id) as student_count
        FROM purchases
        WHERE course_id = $1
      `, [courseId]);
  
      const studentCount = parseInt(result.rows[0].student_count, 10);
      res.json({ studentCount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Худалдан авалтуудыг авахад алдаа гарлаа' });
    }
  };
  
  const getCourseRatings = async (req, res) => {
    const { courseId } = req.params;
    try {
      // Курсийн бүх үнэлгээг авах
      const result = await pool.query('SELECT rating FROM ratings WHERE course_id = $1', [courseId]);
      const ratings = result.rows.map(row => row.rating);
  
      // Үнэлгээний статистик тооцох
      const totalRatings = ratings.length;
      const ratingCounts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };
  
      ratings.forEach(rating => {
        if (ratingCounts[rating] !== undefined) {
          ratingCounts[rating]++;
        }
      });
  
      // Үнэлгээний хувийг тооцох
      const ratingPercentages = {
        5: (ratingCounts[5] / totalRatings) * 100 || 0,
        4: (ratingCounts[4] / totalRatings) * 100 || 0,
        3: (ratingCounts[3] / totalRatings) * 100 || 0,
        2: (ratingCounts[2] / totalRatings) * 100 || 0,
        1: (ratingCounts[1] / totalRatings) * 100 || 0,
      };
  
      res.json(ratingPercentages);
    } catch (error) {
      console.error('Курсийн үнэлгээний тоо хэмжээг авахад алдаа гарлаа', error);
      res.status(500).json({ error: 'Курсийн үнэлгээний тоо хэмжээг авахад алдаа гарлаа' });
    }
  };
  
  
module.exports = { likeCourse, getTopCourses, getCourseRatings, getCoursePurchaseCount, unlikeCourse, register, login, purchaseCourse, getMyCourses, verifyEmail, deleteAllUsers, teacherAllCourse, getTeacher, getAllStudents, updateStudent, deleteStudent,  updateCoursesTaken, getAllTeachers, updateUserProfile, resetPassword, verifyResetCode, generateResetCode, getUserByEmail, updateTeacher,deleteTeacher, createRequest, getRequests  };
