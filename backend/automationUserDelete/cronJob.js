const cron = require('node-cron');
const cleanupExpiredRegistrations = require('./cleanupExpiredRegistrations'); // Үүсгэсэн файл руу зам

// Хугацаа дууссан бүртгэлүүдийг өдөр бүр 00:00 цагт устгах
cron.schedule('*/10 * * * *', async () => {
    console.log('Running expired registrations cleanup');
    await cleanupExpiredRegistrations();
});
