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

// 검색 알고리즘 ( Fuse.js )
const Fuse = require('fuse.js');
const songs = require('./songs.json');

// 문자열 정규화 (검색 정확도 상승)
const normalize = (str) =>
  str.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');

// 데이터 전처리
const normalizedSongs = songs.map(song => ({
  ...song,
  _searchTitle: normalize(song.title)
}));

// Fuse 인스턴스 생성
const fuse = new Fuse(normalizedSongs, {
  keys: ['_searchTitle'],
  threshold: 0.4,       // 검색 수치 설정 (낮을수록 정확)
  includeScore: true,
  ignoreLocation: true,
});

const isMeaningfulQuery = (q) => {
  const cleaned = q.replace(/\s/g, '');

  if (/^(.)\1+$/.test(cleaned)) return false;

  const uniqueChars = new Set(cleaned).size;

  return uniqueChars >= 2;
};

const searchSong = (query) => {
  const q = normalize(query);

  if (!isMeaningfulQuery(q)) return [];

  const direct = normalizedSongs.filter(song =>
    song._searchTitle.includes(q)
  );

  if (direct.length) {
    return direct
      .map(song => ({ ...song, score: 1 }))
      .sort((a, b) => b.level - a.level);
  }

  const results = fuse.search(q);

  return results
    .map(r => ({
      ...r.item,
      score: 1 - r.score
    }))
    .filter(r => r.score >= 0.5);
};



app.get('/songs', (req, res) => {
  res.json(songs);
});

app.get('/songs/:title', (req, res) => {
  const query = req.params.title;

  const results = searchSong(query);

  if (!results.length) {
    return res.status(404).json({ error: 'No songs found' });
  }

  const bestMatch = results
    .filter(r => r.score > 0.7)
    .sort((a, b) => b.score - a.score || b.level - a.level)
    .slice(0, 50);

  if (!bestMatch.length) {
    return res.status(404).json({ error: 'No songs found' });
  }

  res.json({
    query,
    bestMatch,
  });
});



// 현재 재생 중인 노래
let currentSong = null;

app.post('/current-song', (req, res) => {
  const { title, difficulty } = req.body;

  const results = searchSong(title);

  if (!results.length) {
    return res.status(404).json({ error: 'Song not found' });
  }

  const best = results[0];

  res.json({
    input: {
      title,
      difficulty
    },
    result: {
      title: best.title,
      composer: best.composer,
      level: best.level,
      notes: best.notes,
      bpm: best.bpm,
      difficulty: best.course, 
      score: best.score // 디버깅 (검색 정확도 수치)
    }
  });
});

app.get('/current-song', (req, res) => {
  res.json(currentSong);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});