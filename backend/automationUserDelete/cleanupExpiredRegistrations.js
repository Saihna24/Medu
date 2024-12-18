const pool = require('../config/db'); // Таны PostgreSQL холболтын тохиргоо

const cleanupExpiredRegistrations = async () => {
    try {
        const result = await pool.query('DELETE FROM users WHERE verification_code_expiry < NOW() AND is_verified = FALSE RETURNING *');
        console.log('Deleted users:', result.rows);
    } catch (error) {
        console.error('Expired registrations cleanup error:', error);
    }
};


module.exports = cleanupExpiredRegistrations;
