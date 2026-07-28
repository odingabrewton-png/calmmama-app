/**
 * Midnight Lounge feed — local persistence + share helpers.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform, Share } from 'react-native';
import { MIDNIGHT_LOUNGE_POSTS } from './midnightLoungeData';

const STORAGE_KEY = 'calmmama.midnightLoungeFeed.v1';
const APP_URL = 'https://calmmamavillage.com/app';

function normalizePost(post) {
  if (!post || typeof post !== 'object') return null;
  return {
    ...post,
    likes: Number(post.likes) || 0,
    comments: Number(post.comments) || 0,
    liked: Boolean(post.liked),
    commentList: Array.isArray(post.commentList) ? post.commentList : [],
  };
}

/** Merge saved user posts + interaction state onto seed posts. */
export function mergeLoungeFeedPosts(saved, seedPosts = MIDNIGHT_LOUNGE_POSTS) {
  const seed = (seedPosts || []).map(normalizePost).filter(Boolean);
  const userPosts = (saved?.userPosts || []).map(normalizePost).filter(Boolean);
  const interactions = saved?.interactions && typeof saved.interactions === 'object'
    ? saved.interactions
    : {};

  const mergedSeed = seed.map((post) => {
    const patch = interactions[post.id];
    if (!patch) return post;
    return normalizePost({
      ...post,
      ...patch,
      commentList: patch.commentList ?? post.commentList,
    });
  });

  const seen = new Set(mergedSeed.map((p) => p.id));
  const extraUser = userPosts.filter((p) => p && !seen.has(p.id));
  return [...extraUser, ...mergedSeed];
}

export async function loadLoungeFeedState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      userPosts: Array.isArray(parsed?.userPosts) ? parsed.userPosts.map(normalizePost).filter(Boolean) : [],
      interactions:
        parsed?.interactions && typeof parsed.interactions === 'object' ? parsed.interactions : {},
    };
  } catch (_) {
    return null;
  }
}

export async function saveLoungeFeedState(posts) {
  const list = Array.isArray(posts) ? posts : [];
  const userPosts = list.filter(
    (p) => p?.authorId === 'self' || String(p?.id || '').startsWith('user-') || String(p?.id || '').startsWith('gratitude-'),
  );
  const interactions = {};
  list.forEach((post) => {
    if (!post?.id) return;
    interactions[post.id] = {
      liked: Boolean(post.liked),
      likes: Number(post.likes) || 0,
      comments: Number(post.comments) || 0,
      commentList: Array.isArray(post.commentList) ? post.commentList : [],
    };
  });
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ userPosts, interactions }));
    return true;
  } catch (_) {
    return false;
  }
}

export function buildMamaHandle(mamaName) {
  const base = String(mamaName || 'Mama')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '');
  return `@${base || 'Mama'}`;
}

export function createUserFeedPost({
  body,
  mamaName = 'Mama',
  userJourney = 'postpartum',
  kind = 'post',
  avatarEmoji = '🌙',
} = {}) {
  const trimmed = String(body || '').trim();
  if (!trimmed) return null;
  const now = new Date();
  const displayName = String(mamaName || '').trim() || 'Mama';
  return normalizePost({
    id: `user-${now.getTime()}`,
    authorId: 'self',
    name: displayName,
    handle: buildMamaHandle(displayName),
    avatarEmoji,
    timestamp: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    body: trimmed,
    imageUri: null,
    likes: 0,
    comments: 0,
    liked: false,
    commentList: [],
    kind,
    journey: userJourney,
  });
}

export function buildShareText(post) {
  const name = post?.name || 'A mama';
  const body = String(post?.body || '').trim();
  return `${name} in the Midnight Lounge 🌙\n\n"${body}"\n\nJoin us: ${APP_URL}`;
}

export async function copyShareText(post) {
  const text = buildShareText(post);
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return { ok: true, via: 'clipboard' };
  }
  try {
    // eslint-disable-next-line global-require
    const Clipboard = require('expo-clipboard');
    if (Clipboard?.setStringAsync) {
      await Clipboard.setStringAsync(text);
      return { ok: true, via: 'expo-clipboard' };
    }
  } catch (_) {
    /* fall through */
  }
  return { ok: false, error: 'clipboard-unavailable' };
}

export async function shareLoungePostNative(post) {
  const message = buildShareText(post);
  try {
    const result = await Share.share(
      Platform.OS === 'ios'
        ? { message, url: APP_URL }
        : { message, title: 'Calm Mama Midnight Lounge' },
    );
    return { ok: result.action !== Share.dismissedAction };
  } catch (err) {
    return { ok: false, error: err?.message || 'share-failed' };
  }
}

export async function shareLoungePostSms(post) {
  const body = encodeURIComponent(buildShareText(post));
  const url = Platform.OS === 'ios' ? `sms:&body=${body}` : `sms:?body=${body}`;
  try {
    const opened = await Linking.openURL(url);
    return { ok: Boolean(opened) };
  } catch (err) {
    return { ok: false, error: err?.message || 'sms-failed' };
  }
}

export function socialShareUrl(post, platform) {
  const text = encodeURIComponent(buildShareText(post));
  const link = encodeURIComponent(APP_URL);
  if (platform === 'twitter' || platform === 'x') {
    return `https://twitter.com/intent/tweet?text=${text}`;
  }
  if (platform === 'facebook') {
    return `https://www.facebook.com/sharer/sharer.php?u=${link}&quote=${text}`;
  }
  if (platform === 'whatsapp') {
    return `https://wa.me/?text=${text}`;
  }
  return `mailto:?subject=${encodeURIComponent('From the Midnight Lounge 🌸')}&body=${text}`;
}

export async function openSocialShare(post, platform) {
  const url = socialShareUrl(post, platform);
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return { ok: true };
    }
    await Linking.openURL(url);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'open-failed' };
  }
}
