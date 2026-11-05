import assert from 'node:assert/strict';
import { test } from 'node:test';

import '../src/clean.js';

const clean = globalThis.__xClean;

const CLEANED = [
  // Typical share link with tracking parameters.
  [
    'https://x.com/example_handle/status/1234567890123456789?a=AbCdEfGhIjKlMnOpQrS&s=20',
    'https://x.com/example_handle/status/1234567890123456789',
  ],
  // Posts: hosts and path forms.
  ['https://twitter.com/a/status/1?s=20', 'https://twitter.com/a/status/1'],
  ['https://www.x.com/a/status/1?s=20', 'https://www.x.com/a/status/1'],
  ['https://mobile.twitter.com/a/status/1?s=20', 'https://mobile.twitter.com/a/status/1'],
  ['https://x.com/i/status/1?s=20', 'https://x.com/i/status/1'],
  ['https://x.com/i/web/status/1?s=20', 'https://x.com/i/web/status/1'],
  ['https://x.com/a/status/1/photo/1?s=20', 'https://x.com/a/status/1/photo/1'],
  ['https://x.com/a/status/1/video/2?s=20', 'https://x.com/a/status/1/video/2'],
  ['https://x.com/a/status/1/?s=20', 'https://x.com/a/status/1/'],
  // Query and fragment variants.
  ['https://x.com/a/status/1?', 'https://x.com/a/status/1'],
  ['https://x.com/a/status/1#m', 'https://x.com/a/status/1'],
  ['https://x.com/a/status/1?new_param=abc&t=xyz#m', 'https://x.com/a/status/1'],
  // Whitespace around a single URL.
  ['  https://x.com/a/status/1?s=20\n', 'https://x.com/a/status/1'],
  // Profiles.
  ['https://x.com/example_handle?s=21&t=abc', 'https://x.com/example_handle'],
  ['https://x.com/example_handle/?s=21', 'https://x.com/example_handle/'],
  ['https://twitter.com/Some_User1?s=21', 'https://twitter.com/Some_User1'],
  // A handle that merely starts with a reserved word is still a profile.
  ['https://x.com/home_cook?s=21', 'https://x.com/home_cook'],
];

const UNCHANGED = [
  // Already clean.
  'https://x.com/a/status/1',
  'https://x.com/example_handle',
  // Not a single URL.
  'hello',
  '',
  'see https://x.com/a/status/1?s=20 now',
  'https://x.com/a/status/1?s=20 https://x.com/a/status/2?s=20',
  // Other sites and look-alike hosts.
  'https://t.co/abc?s=20',
  'https://example.com/a/status/1?s=20',
  'https://x.com.evil.com/a/status/1?s=20',
  'https://x.com@evil.com/a/status/1?s=20',
  'https://evil.com/x.com/a/status/1?s=20',
  'https://notx.com/a/status/1?s=20',
  'https://user:pw@x.com/a/status/1?s=20',
  'https://x.com:8443/a/status/1?s=20',
  // Scheme.
  'http://x.com/a/status/1?s=20',
  'ftp://x.com/a/status/1?s=20',
  // Reserved single-segment routes, where the query can be real content.
  'https://x.com/search?q=hello',
  'https://x.com/SEARCH?q=hello',
  'https://x.com/home?s=20',
  'https://x.com/explore?s=20',
  'https://x.com/notifications?s=20',
  'https://x.com/compose?text=hi',
  'https://x.com/bookmarks?x=1',
  'https://x.com/connect_people?user_id=123',
  'https://x.com/premium_sign_up?referring_page=abc',
  'https://x.com/who_to_follow?a=1',
  'https://x.com/tweet?text=hi',
  'https://x.com/?s=20',
  // Paths outside the supported shapes.
  'https://x.com/intent/post?text=hi',
  'https://x.com/i/lists/1?s=20',
  'https://x.com/i/spaces/1?s=20',
  'https://x.com/example_handle/media?s=20',
  'https://x.com/a/status/abc?s=20',
  'https://x.com/a/status/1/analytics?s=20',
  'https://x.com/a/status/1/photo/1/extra?s=20',
  'https://x.com/not-a-handle?s=20',
];

for (const [input, expected] of CLEANED) {
  test(`cleans ${JSON.stringify(input)}`, () => {
    assert.equal(clean(input), expected);
  });

  test(`is idempotent for ${JSON.stringify(input)}`, () => {
    assert.equal(clean(clean(input)), expected);
  });
}

for (const input of UNCHANGED) {
  test(`leaves ${JSON.stringify(input)} unchanged`, () => {
    assert.equal(clean(input), input);
  });
}

test('passes non-string values through', () => {
  const value = { toString: () => 'https://x.com/a/status/1?s=20' };
  assert.equal(clean(value), value);
  assert.equal(clean(undefined), undefined);
  assert.equal(clean(null), null);
});
