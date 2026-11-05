// Pure URL cleaning. Published on a temporary global because content scripts
// are classic scripts; hook.js captures it and deletes the global.
(() => {
  const HOSTS = new Set([
    'x.com',
    'www.x.com',
    'mobile.x.com',
    'twitter.com',
    'www.twitter.com',
    'mobile.twitter.com',
  ]);

  // /<handle>/status/<id>, /i/status/<id>, /i/web/status/<id>,
  // optionally followed by /photo/N or /video/N.
  const POST_PATH = /^\/(?:i\/web|[^/]+)\/status\/\d+(?:\/(?:photo|video)\/\d+)?\/?$/;

  const PROFILE_PATH = /^\/([A-Za-z0-9_]+)\/?$/;

  // Single-segment X routes that look like a handle but are not profiles.
  // Their query strings can carry real content (e.g. /search?q=...).
  const RESERVED_ROUTES = new Set([
    'about',
    'account',
    'bookmarks',
    'communities',
    'compose',
    'connect_people',
    'download',
    'explore',
    'follower_requests',
    'followers',
    'following',
    'hashtag',
    'home',
    'i',
    'intent',
    'jobs',
    'lists',
    'login',
    'logout',
    'mentions',
    'messages',
    'moments',
    'notifications',
    'oauth',
    'personalization',
    'premium',
    'premium_sign_up',
    'privacy',
    'search',
    'sessions',
    'settings',
    'share',
    'signup',
    'topics',
    'tos',
    'trends',
    'tweet',
    'who_to_follow',
  ]);

  function isCleanablePath(pathname) {
    if (POST_PATH.test(pathname)) return true;
    const profile = PROFILE_PATH.exec(pathname);
    return profile !== null && !RESERVED_ROUTES.has(profile[1].toLowerCase());
  }

  // Returns the URL without its query and fragment when `text` is exactly one
  // X post or profile URL. Anything else is returned unchanged.
  function clean(text) {
    if (typeof text !== 'string') return text;

    const candidate = text.trim();
    if (!/^https:\/\/\S+$/i.test(candidate) || !/[?#]/.test(candidate)) return text;

    let url;
    try {
      url = new URL(candidate);
    } catch {
      return text;
    }

    if (url.username || url.password || url.port) return text;
    if (!HOSTS.has(url.hostname) || !isCleanablePath(url.pathname)) return text;

    return url.origin + url.pathname;
  }

  globalThis.__xClean = clean;
})();
