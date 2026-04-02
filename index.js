const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

const setupSwagger = require('./docs/swagger');
setupSwagger(app);



// 미들웨어
app.use(cors());
app.use(express.json());

// route
app.get('/', (req, res) => {
  res.send('서버 작동 테스트');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// 노래 데이터
const songs = require('./songs.json');

app.get('/songs', (req, res) => {
  res.json(songs);
});

app.get('/song/:title', (req, res) => {
  const title = req.params.title;

  const song = songs.find(s =>
    s.title.toLowerCase() === title.toLowerCase()
  );

  if (!song) return res.status(404).json({ error: 'not found' });

  res.json(song);
});

// 현재 재생 중인 노래
let currentSong = null;

app.post('/current-song', (req, res) => {
  currentSong = req.body;
  res.json({ success: true });
});

app.get('/current-song', (req, res) => {
  res.json(currentSong);
});