const Fuse = require('fuse.js');
const songs = require('../songs.json');

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

const applyFilters = (list, { levelMin, levelMax, course }) => {
  let filtered = list;
  if (levelMin !== undefined) {
    const min = parseFloat(levelMin);
    if (!isNaN(min)) filtered = filtered.filter(s => s.level >= min);
  }
  if (levelMax !== undefined) {
    const max = parseFloat(levelMax);
    if (!isNaN(max)) filtered = filtered.filter(s => s.level <= max);
  }
  if (course !== undefined) {
    filtered = filtered.filter(s => s.course === course.toLowerCase());
  }
  return filtered;
};

const buildFilters = ({ levelMin, levelMax, course }) => {
  const f = {};
  if (levelMin !== undefined) f.levelMin = parseFloat(levelMin);
  if (levelMax !== undefined) f.levelMax = parseFloat(levelMax);
  if (course !== undefined) f.course = course.toLowerCase();
  return Object.keys(f).length ? f : null;
};

module.exports = { songs, searchSong, applyFilters, buildFilters };
