export function createPageUrl(name) {
  switch (name) {
    case 'Home':
      return '/';
    case 'Game':
      return '/game';
    case 'Leaderboard':
      return '/leaderboard';
    default:
      return '/';
  }
}
