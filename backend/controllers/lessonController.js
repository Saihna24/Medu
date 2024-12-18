const pool = require('../config/db'); // PostgreSQL pool үүсгэх


const getLessons = async (req, res) => {
    const { courseId } = req.params;
  
    try {
      const result = await pool.query('SELECT * FROM lessons WHERE course_id = $1', [courseId]);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json('Server error');
    }
  };
// Function to get a specific lesson by ID
const getLesson = async (req, res) => {
    const { id } = req.params;
  
    try {
      const lessonResult = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);
      const lesson = lessonResult.rows[0];
      
      if (lesson) {
        // Get exercises for the lesson
        const exercisesResult = await pool.query('SELECT * FROM exercises WHERE lesson_id = $1', [id]);
        lesson.exercises = exercisesResult.rows;
        res.json(lesson);
      } else {
        res.status(404).json('Lesson not found');
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json('Server error');
    }
  };
  
  const createLesson = async (req, res) => {
    const { courseId } = req.params;
    const { lesson_number, title, exercises, video_duration } = req.body; // video_duration нэмэх
    const videoUrl = req.file ? req.file.path : null;

    console.log('Received data:', { courseId, lesson_number, title, exercises, videoUrl, video_duration });

    try {
        // Parse exercises if it's a string
        let parsedExercises = [];
        if (typeof exercises === 'string') {
            parsedExercises = JSON.parse(exercises);
        } else {
            parsedExercises = exercises;
        }

        // Validate exercises
        if (parsedExercises.length > 0) {
            for (const ex of parsedExercises) {
                if (!ex.question || ex.question.trim() === '') {
                    return res.status(400).json({ error: 'Question cannot be empty' });
                }

                const answers = [ex.answer1, ex.answer2, ex.answer3, ex.answer4];
                if (answers.some(answer => !answer || answer.trim() === '')) {
                    return res.status(400).json({ error: 'All answers must be provided' });
                }

                if (ex.correct_answer < 0 || ex.correct_answer > 3) {
                    return res.status(400).json({ error: 'Invalid correct answer index' });
                }
            }
        }

        // Insert lesson into database
        const newLesson = await pool.query(
            'INSERT INTO lessons (course_id, lesson_number, title, video_url, video_duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [courseId, lesson_number, title, videoUrl, video_duration] // video_duration нэмэх
        );
        const lessonId = newLesson.rows[0].id;

        // Insert exercises into database
        if (parsedExercises.length > 0) {
            for (const ex of parsedExercises) {
                await pool.query(
                    'INSERT INTO exercises (lesson_id, question, answer1, answer2, answer3, answer4, correct_answer, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [lessonId, ex.question, ex.answer1, ex.answer2, ex.answer3, ex.answer4, ex.correct_answer, ex.explanation]
                );
            }
        }

        res.json(newLesson.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server error');
    }
};

  
  const deleteLesson = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Хичээлүүдийн мэдээллийг устгах
      const result = await pool.query('DELETE FROM lessons WHERE id = $1 RETURNING *', [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json('Lesson not found');
      }
      
      res.status(200).json('Lesson deleted successfully');
    } catch (err) {
      console.error(err.message);
      res.status(500).json('Server error');
    }
  };

module.exports = { createLesson, getLessons, getLesson, deleteLesson };
