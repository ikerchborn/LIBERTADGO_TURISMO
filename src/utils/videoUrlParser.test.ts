import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateVideoUrl } from './videoUrlParser.ts';

test('videoUrlParser parses standard YouTube URLs', () => {
  const result = parseAndValidateVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(result.isValid, true);
  assert.equal(result.data?.platform, 'youtube');
  assert.equal(result.data?.externalVideoId, 'dQw4w9WgXcQ');
  assert.equal(result.data?.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
});

test('videoUrlParser parses youtu.be short URLs', () => {
  const result = parseAndValidateVideoUrl('https://youtu.be/dQw4w9WgXcQ?si=test1234');
  assert.equal(result.isValid, true);
  assert.equal(result.data?.platform, 'youtube');
  assert.equal(result.data?.externalVideoId, 'dQw4w9WgXcQ');
});

test('videoUrlParser parses YouTube Shorts', () => {
  const result = parseAndValidateVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  assert.equal(result.isValid, true);
  assert.equal(result.data?.platform, 'youtube');
  assert.equal(result.data?.externalVideoId, 'dQw4w9WgXcQ');
});

test('videoUrlParser parses TikTok video URLs', () => {
  const url = 'https://www.tiktok.com/@descubrelalibertad/video/7328918237192837192?lang=es';
  const result = parseAndValidateVideoUrl(url);
  assert.equal(result.isValid, true);
  assert.equal(result.data?.platform, 'tiktok');
  assert.equal(result.data?.externalVideoId, '7328918237192837192');
  assert.equal(result.data?.embedUrl, 'https://www.tiktok.com/embed/v2/7328918237192837192');
});

test('videoUrlParser parses Instagram Reels and Posts', () => {
  const reelResult = parseAndValidateVideoUrl('https://www.instagram.com/reel/C3bJ87XLzqK/');
  assert.equal(reelResult.isValid, true);
  assert.equal(reelResult.data?.platform, 'instagram');
  assert.equal(reelResult.data?.externalVideoId, 'C3bJ87XLzqK');
  assert.equal(reelResult.data?.embedUrl, 'https://www.instagram.com/p/C3bJ87XLzqK/embed');

  const postResult = parseAndValidateVideoUrl('https://instagram.com/p/C3bJ87XLzqK');
  assert.equal(postResult.isValid, true);
  assert.equal(postResult.data?.externalVideoId, 'C3bJ87XLzqK');
});

test('videoUrlParser rejects unauthorized domains and non-HTTPS', () => {
  const httpResult = parseAndValidateVideoUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(httpResult.isValid, false);

  const fbResult = parseAndValidateVideoUrl('https://www.facebook.com/reel/123456');
  assert.equal(fbResult.isValid, false);

  const invalidResult = parseAndValidateVideoUrl('not-a-valid-url');
  assert.equal(invalidResult.isValid, false);
});
