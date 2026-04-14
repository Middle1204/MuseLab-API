const express = require('express');
const router = express.Router();
const { songs, searchSong, applyFilters, buildFilters } = require('../utils/search');

router.get('/', (req, res) => {
  const { levelMin, levelMax, course } = req.query;
  const hasFilter = levelMin !== undefined || levelMax !== undefined || course !== undefined;

  let results = hasFilter
    ? applyFilters(songs, { levelMin, levelMax, course }).sort((a, b) => a.level - b.level)
    : [...songs].sort((a, b) => a.level - b.level);

  if (!results.length) {
    return res.status(404).json({ error: 'No songs found' });
  }

  res.json({
    query: null,
    filters: buildFilters({ levelMin, levelMax, course }),
    results,
  });
});

router.get('/:title', (req, res) => {
  const query = req.params.title;
  const { levelMin, levelMax, course } = req.query;
  const hasFilter = levelMin !== undefined || levelMax !== undefined || course !== undefined;

  let results = searchSong(query);

  if (!results.length) {
    return res.status(404).json({ error: 'No songs found' });
  }

  if (hasFilter) {
    results = applyFilters(results, { levelMin, levelMax, course })
      .sort((a, b) => a.level - b.level);
  } else {
    results = results
      .filter(r => r.score > 0.7)
      .sort((a, b) => b.score - a.score || b.level - a.level)
      .slice(0, 50);
  }

  if (!results.length) {
    return res.status(404).json({ error: 'No songs found' });
  }

  res.json({
    query,
    filters: buildFilters({ levelMin, levelMax, course }),
    results,
  });
});

module.exports = router;
