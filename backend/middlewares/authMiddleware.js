const jwt = require('jsonwebtoken');
const pool = require('../config/db')

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided or invalid format' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    // Токеныг баталгаажуулах
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        // Хэрэглэгчийн мэдээлэл авах
        const result = await pool.query('SELECT current_token FROM users WHERE id = $1', [user.id]);
        const currentToken = result.rows[0].current_token;

        // Токеныг баталгаажуулах
        if (token !== currentToken) {
            return res.status(403).json({ error: 'Token is no longer valid' });
        }

        // Токенд хадгалагдсан хэрэглэгчийн мэдээллийг req.user-д хадгална
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
