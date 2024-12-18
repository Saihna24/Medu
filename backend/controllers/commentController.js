const pool = require('../config/db');
const bannedWords = require('../config/bannedWords'); // Импортлох

// Хараалын үгсийг цэвэршүүлэх функц
const filterBannedWords = (text) => {
  let filteredText = text;
  bannedWords.forEach((word) => {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, "****"); // Хараалын үгийг солих
  });
  return filteredText;
};

// Сэтгэгдлүүдийг курсийн ID-аар авах
const getCommentsByCourseId = async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await pool.query(
      'SELECT comments.*, users.firstname, users.lastname FROM comments JOIN users ON comments.user_id = users.id WHERE course_id = $1 ORDER BY comments.created_at ASC',
      [courseId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Сэтгэгдлүүдийг авахад алдаа гарлаа' });
  }
};

// Шинэ сэтгэгдэл нэмэх
const addComment = async (req, res) => {
  const { courseId } = req.params;
  const { content, user_id } = req.body;

  try {
    const filteredContent = filterBannedWords(content); // Хараалын үгийг цэвэршүүлэх

    const result = await pool.query(
      'INSERT INTO comments (content, user_id, course_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [filteredContent, user_id, courseId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Сэтгэгдэл нэмэхэд алдаа гарлаа' });
  }
};

// Сэтгэгдэл устгах
const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING *', [commentId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Сэтгэгдэл олдсонгүй' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Сэтгэгдэл устгахад алдаа гарлаа' });
  }
};
const getAllComments = async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT comments.*, users.firstname, users.lastname FROM comments JOIN users ON comments.user_id = users.id ORDER BY comments.created_at ASC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Сэтгэгдлүүдийг авахад алдаа гарлаа' });
    }
  };
  
  
module.exports = {
  getCommentsByCourseId,
  addComment,
  deleteComment,
  getAllComments,
};
