const express = require('express');
const router = express.Router();
const { searchSong } = require('../utils/search');

let currentSong = null;

router.post('/', (req, res) => {
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

router.get('/', (req, res) => {
  res.json(currentSong);
});

module.exports = router;
