const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

const setupSwagger = require('./docs/swagger');
const songsRouter = require('./routes/songs');
const currentSongRouter = require('./routes/currentSong');

setupSwagger(app);

// 미들웨어
app.use(cors());
app.use(express.json());

// routes
app.get('/', (req, res) => {
  res.send('서버 작동 테스트');
});

app.use('/songs', songsRouter);
app.use('/current-song', currentSongRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});