const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const lessonRoutes = require('./routes/lessons'); // Шинэ маршрут
const commentRoutes = require('./routes/commentRoutes');
const path = require('path');
require('dotenv').config();
require('./automationUserDelete/cronJob');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Frontend-ийн хаяг
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', lessonRoutes); // Шинэ маршрут нэмэх
app.use('/api/courses', commentRoutes);
app.use('/api/comments', commentRoutes);

// Хадгалах замуудыг тодорхойлох

// Хуудас шууд хүргэх маршрутууд
app.use('/coursesImg', express.static(path.join(__dirname, 'coursesImg')));
app.get('/coursesImg/:image', (req, res) => {
  const image = req.params.image;
  const imagePath = path.join(__dirname, 'coursesImg', image);
  
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('File not found:', err);
      res.status(404).send('File not found');
    }
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/uploads/:image', (req, res) => {
  const image = req.params.image;
  const imagePath = path.join(__dirname, 'uploads', image);
  
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('File not found:', err);
      res.status(404).send('File not found');
    }
  });
});

app.use('/videos', express.static(path.join(__dirname, 'videos'))); // Шинэ зам
app.get('/videos/:video', (req, res) => { // Шинэ зам
  const video = req.params.video;
  const videoPath = path.join(__dirname, 'videos', video);
  
  res.sendFile(videoPath, (err) => {
      if (err) {
          console.error('File not found:', err);
          res.status(404).send('File not found');
      }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
