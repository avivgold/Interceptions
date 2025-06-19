export const GameScore = {
  async list(sortKey = '-score', limit = 10) {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    const key = sortKey.replace('-', '');
    scores.sort((a, b) => {
      const cmp = a[key] - b[key];
      return sortKey.startsWith('-') ? -cmp : cmp;
    });
    return scores.slice(0, limit);
  },
  async create(score) {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    score.id = Date.now();
    scores.push(score);
    localStorage.setItem('scores', JSON.stringify(scores));
    return score;
  }
};
