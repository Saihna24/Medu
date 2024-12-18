const express = require('express');
const router = express.Router();
const { addComment, getCommentsByCourseId, deleteComment, getAllComments } = require('../controllers/commentController');

// Сэтгэгдлүүдийг авах
router.get('/:courseId/comments', getCommentsByCourseId);
router.get('/allComments', getAllComments);


// Сэтгэгдэл нэмэх
router.post('/:courseId/comments', addComment);

// Сэтгэгдэл устгах (заавал биш)
router.delete('/comments/:commentId', deleteComment);

module.exports = router;
