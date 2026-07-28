import React, { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  TextInput,
  Modal,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Pressable,
  InteractionManager,
  Keyboard,
  InputAccessoryView,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import LotusFlowerButton from './LotusFlowerButton';
import MidnightLoungeProfilePanel from './MidnightLoungeProfilePanel.js';
import MidnightLoungeProfileEditPanel from './MidnightLoungeProfileEditPanel.js';
import VillageBoutiqueScreen from './VillageBoutiqueScreen';
import { useVillageRewards } from './VillageRewardsContext';
import { MIDNIGHT, MIDNIGHT_LOUNGE_TABS } from './midnightLoungeTheme';
import {
  MIDNIGHT_LOUNGE_FEED_STACK,
  MIDNIGHT_LOUNGE_LAYOUT,
  MIDNIGHT_LOUNGE_LAYOUT_LOCKED,
  MIDNIGHT_LOUNGE_RITUALS_STACK,
  MIDNIGHT_LOUNGE_SHELL,
} from './midnightLoungeLayoutConfig';
import {
  MIDNIGHT_LOUNGE_POSTS,
  MIDNIGHT_MAMA_PROFILES,
  MIDNIGHT_CHAT_THREADS,
  MIDNIGHT_LOUNGE_FEATURES_PREGNANT,
  MIDNIGHT_LOUNGE_FEATURES_POSTPARTUM,
} from './midnightLoungeData';
import {
  VILLAGE_SNAPPY_SPRING,
  runNativeOpacitySceneSwap,
  NATIVE_SCENE_FADE_MS,
} from './villageScreenTransitions';
import { LIST_PERF } from './tabShellConfig';
import {
  VillageOracleStreamShell,
  VillageSanctuaryStreamShell,
} from './VillageStreamLoader';
import { warmPregnancyOracle } from './pregnancyOraclePreload';
import { warmPostpartumBabyOracle, warmPostpartumSanctuaryJournal } from './midnightLoungePreload';
import { warmBoutiqueCatalogImages } from './boutiqueProductsData';
import {
  PostpartumBabyOracleScreen,
  PostpartumSoulSanctuaryScreen,
} from './postpartumLoungeRitualScreens';
import TwoAMPregnancyOracleScreen from './screens/TwoAMPregnancyOracleScreen';
import { getTonightMantra } from './tonightMantraEngine';
import {
  createUserFeedPost,
  loadLoungeFeedState,
  mergeLoungeFeedPosts,
  saveLoungeFeedState,
  buildShareText,
  shareLoungePostNative,
  shareLoungePostSms,
  openSocialShare,
} from './midnightLoungeFeedStorage';

/** MIDNIGHT LOUNGE — layout locked. User must say "UNLOCK LOUNGE LAYOUT" before structural edits. */

const SoulSanctuaryScreen = lazy(() => import('./SoulSanctuaryScreen'));
const TwoAMBabyOracleScreen = lazy(() => import('./screens/TwoAMBabyOracleScreen'));

function LazySubViewFallback({ variant = 'sanctuary' }) {
  if (variant === 'oracle') return <VillageOracleStreamShell />;
  return <VillageSanctuaryStreamShell backgroundColor={MIDNIGHT.bg} />;
}

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const CHARCOAL = '#2C2C2C';
const LOUNGE_INK = '#FFFFFF';
const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

/** Soft display serif for Midnight Lounge titles */
const LOUNGE_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", "Times New Roman", serif' },
  ios: { fontFamily: 'Georgia' },
  android: { fontFamily: 'serif' },
  default: { fontFamily: 'serif' },
});

function configureFeedSpringLayout() {
  // No-op: LayoutAnimation fights native-driver lounge/sheet animations and causes feed stutter.
}

const FeedComposerBar = memo(function FeedComposerBar({
  draft,
  onDraftChange,
  onPublish,
  lightText,
  publishing,
}) {
  const canPost = Boolean(String(draft || '').trim()) && !publishing;
  return (
    <View style={[styles.askFeedCard, lightText && styles.askFeedCardLight]}>
      <Text style={[styles.askFeedEyebrow, lightText && styles.askFeedTextLight, SANS]}>
        SHARE WITH THE VILLAGE
      </Text>
      <Text style={[styles.askFeedHint, lightText && styles.askFeedHintLight, SANS]}>
        What&apos;s on your heart tonight? Other mamas can like, comment, and share your post.
      </Text>
      <TextInput
        style={styles.askFeedInput}
        value={draft}
        onChangeText={onDraftChange}
        placeholder="A gentle midnight thought for the circle…"
        placeholderTextColor="rgba(44, 44, 44, 0.45)"
        multiline
        maxLength={480}
        blurOnSubmit
        returnKeyType="done"
      />
      <TouchableOpacity
        style={[styles.askFeedBtn, !canPost && styles.askFeedBtnDisabled]}
        onPress={onPublish}
        disabled={!canPost}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Post to Midnight Lounge feed"
      >
        <Text style={styles.askFeedBtnText}>{publishing ? 'Posting…' : 'Post to feed ✨'}</Text>
      </TouchableOpacity>
    </View>
  );
});

const FeedCommentSheet = memo(function FeedCommentSheet({
  visible,
  post,
  draft,
  onDraftChange,
  onClose,
  onSubmit,
}) {
  if (!post) return null;
  const comments = Array.isArray(post.commentList) ? post.commentList : [];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.gratitudeBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.commentSheet}>
          <Text style={[styles.gratitudeTitle, SANS]}>Comments</Text>
          <Text style={[styles.commentPostPreview, SANS]} numberOfLines={3}>
            {post.body}
          </Text>
          <ScrollView style={styles.commentList} keyboardShouldPersistTaps="handled">
            {comments.length ? (
              comments.map((entry) => (
                <View key={entry.id} style={styles.commentRow}>
                  <Text style={[styles.commentAuthor, SANS]}>{entry.name || 'Mama'}</Text>
                  <Text style={[styles.commentBody, SANS]}>{entry.body}</Text>
                  <Text style={[styles.commentTime, SANS]}>{entry.timestamp}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.commentEmpty, SANS]}>
                Be the first to leave a gentle word for this mama.
              </Text>
            )}
          </ScrollView>
          <TextInput
            style={[styles.commentInput, SANS]}
            value={draft}
            onChangeText={onDraftChange}
            placeholder="Leave a kind comment…"
            placeholderTextColor={MIDNIGHT.textMuted}
            multiline
          />
          <TouchableOpacity style={styles.gratitudeDoneBtn} onPress={onSubmit} activeOpacity={0.88}>
            <Text style={[styles.gratitudeDoneText, SANS]}>Post comment</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const FeedShareSheet = memo(function FeedShareSheet({ visible, post, onClose, onCopied }) {
  if (!post) return null;

  const runShare = async (action) => {
    if (action === 'native') {
      await shareLoungePostNative(post);
      onClose?.();
      return;
    }
    if (action === 'sms') {
      await shareLoungePostSms(post);
      onClose?.();
      return;
    }
    if (action === 'copy') {
      try {
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(buildShareText(post));
        } else {
          await Clipboard.setStringAsync(buildShareText(post));
        }
        onCopied?.();
      } catch (_) {
        /* ignore */
      }
      onClose?.();
      return;
    }
    if (action === 'twitter' || action === 'facebook' || action === 'whatsapp' || action === 'email') {
      await openSocialShare(post, action === 'email' ? 'email' : action);
      onClose?.();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.gratitudeBackdrop} onPress={onClose}>
        <Pressable style={styles.shareSheet} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.gratitudeTitle, SANS]}>Share with mamas</Text>
          <Text style={[styles.commentPostPreview, SANS]} numberOfLines={3}>
            {post.body}
          </Text>
          <TouchableOpacity style={styles.shareOptionBtn} onPress={() => runShare('native')} activeOpacity={0.88}>
            <Text style={[styles.shareOptionText, SANS]}>Share via device…</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareOptionBtn} onPress={() => runShare('sms')} activeOpacity={0.88}>
            <Text style={[styles.shareOptionText, SANS]}>Text another mama 💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareOptionBtn} onPress={() => runShare('whatsapp')} activeOpacity={0.88}>
            <Text style={[styles.shareOptionText, SANS]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareOptionBtn} onPress={() => runShare('twitter')} activeOpacity={0.88}>
            <Text style={[styles.shareOptionText, SANS]}>Share on X / Twitter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareOptionBtn} onPress={() => runShare('facebook')} activeOpacity={0.88}>
            <Text style={[styles.shareOptionText, SANS]}>Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareOptionBtn} onPress={() => runShare('copy')} activeOpacity={0.88}>
            <Text style={[styles.shareOptionText, SANS]}>Copy post text</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareCancelBtn} onPress={onClose} activeOpacity={0.88}>
            <Text style={[styles.shareCancelText, SANS]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const FeedListHeader = memo(function FeedListHeader({
  isLight,
  feedDraft,
  onFeedDraftChange,
  onPublishFeedPost,
  publishingFeed,
}) {
  return (
    <>
      <View
        style={[styles.feedIntro, isLight && styles.feedIntroLight]}
        nativeID={MIDNIGHT_LOUNGE_FEED_STACK[0]}
      >
        <Text style={[styles.feedIntroEyebrow, isLight && styles.feedIntroTextLight, SANS]}>
          AFTER HOURS · VILLAGE CIRCLE
        </Text>
        <Text style={[styles.feedIntroTitle, isLight && styles.feedIntroTextLight, SANS]}>
          You are not alone in the quiet
        </Text>
        <Text style={[styles.feedIntroSub, isLight && styles.feedIntroSubLight, SANS]}>
          A soft-lit space for mamas awake when the world sleeps.
        </Text>
      </View>
      <FeedComposerBar
        draft={feedDraft}
        onDraftChange={onFeedDraftChange}
        onPublish={onPublishFeedPost}
        lightText={isLight}
        publishing={publishingFeed}
      />
    </>
  );
});

function featureEmoji(featureId) {
  if (featureId === 'ml-journal') return '📓';
  if (featureId === 'ml-pregnancy-oracle' || featureId === 'ml-baby-oracle') return '🔮';
  return '✨';
}

function getRitualFeatures(userJourney) {
  return userJourney === 'pregnant'
    ? MIDNIGHT_LOUNGE_FEATURES_PREGNANT
    : MIDNIGHT_LOUNGE_FEATURES_POSTPARTUM;
}

const PeacefulEveningRituals = memo(function PeacefulEveningRituals({
  onGratitudePress,
  onFeaturePress,
  mantra,
  userJourney,
}) {
  const ritualFeatures = useMemo(() => getRitualFeatures(userJourney), [userJourney]);

  const ritualsHeader = useMemo(
    () => (
      <>
        <View style={styles.ritualsHeader} nativeID={MIDNIGHT_LOUNGE_RITUALS_STACK[0]}>
          <Text style={[styles.ritualsGreeting, SANS]}>Good evening, Mama</Text>
          <Text style={[styles.ritualsSub, SANS]}>Take a deep breath and settle in.</Text>
        </View>

        <View
          style={[styles.ritualCard, styles.ritualCardPeach]}
          nativeID={MIDNIGHT_LOUNGE_RITUALS_STACK[1]}
        >
          <Text style={styles.ritualCardEmoji}>✨</Text>
          <Text style={[styles.ritualCardTitle, LOUNGE_SERIF]}>Tonight&apos;s Mantra</Text>
          <Text style={[styles.ritualMantraBody, LOUNGE_SERIF]}>&ldquo;{mantra}&rdquo;</Text>
        </View>

        <TouchableOpacity
          style={[styles.ritualCard, styles.ritualCardLavender]}
          nativeID={MIDNIGHT_LOUNGE_RITUALS_STACK[2]}
          onPress={onGratitudePress}
          activeOpacity={0.9}
        >
          <Text style={styles.ritualCardEmoji}>🙏</Text>
          <Text style={[styles.ritualCardTitle, LOUNGE_SERIF]}>1-Minute Gratitude Check-in</Text>
          <Text style={[styles.ritualCardSub, SANS]}>
            Tap to name one small grace from today — even if it is simply that you are still here.
          </Text>
          <Text style={[styles.ritualCardCta, SANS]}>Begin check-in →</Text>
        </TouchableOpacity>
      </>
    ),
    [mantra, onGratitudePress],
  );

  const renderRitualFeature = useCallback(
    ({ item, index }) => (
      <TouchableOpacity
        style={[
          styles.ritualCard,
          index % 2 === 0 ? styles.ritualCardLavender : styles.ritualCardPowder,
        ]}
        onPressIn={() => {
          if (item.id === 'ml-pregnancy-oracle') {
            warmPregnancyOracle();
            return;
          }
          if (userJourney === 'postpartum' && item.id === 'ml-journal') {
            warmPostpartumSanctuaryJournal();
            return;
          }
          if (userJourney === 'postpartum' && item.id === 'ml-baby-oracle') {
            warmPostpartumBabyOracle();
          }
        }}
        onPress={() => onFeaturePress?.(item.id)}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}`}
      >
        <Text style={styles.ritualCardEmoji}>{featureEmoji(item.id)}</Text>
        <Text style={[styles.ritualCardTitle, LOUNGE_SERIF]}>{item.title}</Text>
        <Text style={[styles.ritualCardSub, SANS]}>{item.vibe}</Text>
        <Text style={[styles.ritualCardSub, SANS]}>{item.description}</Text>
        <Text style={[styles.ritualCardCta, SANS]}>Open →</Text>
      </TouchableOpacity>
    ),
    [onFeaturePress],
  );

  const ritualKeyExtractor = useCallback((item) => item.id, []);

  return (
    <FlatList
      data={ritualFeatures}
      keyExtractor={ritualKeyExtractor}
      renderItem={renderRitualFeature}
      ListHeaderComponent={ritualsHeader}
      nativeID={MIDNIGHT_LOUNGE_RITUALS_STACK[3]}
      style={styles.feedScroll}
      contentContainerStyle={styles.feedScrollContent}
      showsVerticalScrollIndicator={false}
      {...LIST_PERF}
    />
  );
});

const MidnightLoungeHeader = memo(function MidnightLoungeHeader({ onBack }) {
  return (
    <View style={styles.header} nativeID={MIDNIGHT_LOUNGE_SHELL.header}>
      <View style={styles.headerSideSlot}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={onBack} activeOpacity={0.85}>
          <Text style={[styles.headerBackText, SANS]}>← Back</Text>
        </TouchableOpacity>
      </View>
      <Text
        style={[styles.headerTitle, LOUNGE_SERIF]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
      >
        🌙 Midnight Lounge
      </Text>
      <View style={styles.headerSideSlot} />
    </View>
  );
});

const FeedPostCard = memo(
  function FeedPostCard({ post, onLike, onComment, onShare, onOpenProfile, lightFeedText, gratitudeHighlight }) {
    if (!post) return null;

    return (
      <View style={[styles.feedCard, gratitudeHighlight && styles.feedCardGratitude]}>
        <TouchableOpacity
          style={styles.feedAuthorRow}
          onPress={() => onOpenProfile(post)}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={`View ${post.name ?? 'mama'} profile`}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{post.avatarEmoji ?? '💜'}</Text>
          </View>
          <View style={styles.feedAuthorMeta}>
            <Text style={[styles.feedAuthorName, lightFeedText && styles.feedAuthorNameLight, SANS]}>
              {post.name ?? 'Mama'}
            </Text>
            <Text style={[styles.feedAuthorHandle, lightFeedText && styles.feedAuthorHandleLight, SANS]}>
              {post.handle ?? '@mama'} · {post.timestamp ?? 'Just now'} · Tap for profile
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.feedBody, lightFeedText && styles.feedBodyLight, SANS]}>{post.body ?? ''}</Text>

        {post.imageUri ? (
          <Image source={{ uri: post.imageUri }} style={styles.feedImage} resizeMode="cover" />
        ) : null}

        <View style={styles.feedToolbar}>
          <TouchableOpacity style={styles.feedToolBtn} onPress={() => onLike(post.id)} activeOpacity={0.85}>
            <Text
              style={[
                styles.feedToolText,
                lightFeedText && styles.feedToolTextLight,
                post.liked && styles.feedToolTextActive,
              ]}
            >
              ❤️ {post?.likes ?? 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedToolBtn} onPress={() => onComment(post.id)} activeOpacity={0.85}>
            <Text style={[styles.feedToolText, lightFeedText && styles.feedToolTextLight]}>
              💬 {post?.comments ?? 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedToolBtn} onPress={() => onShare(post.id)} activeOpacity={0.85}>
            <Text style={[styles.feedToolText, lightFeedText && styles.feedToolTextLight]}>↗ Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
  (prev, next) => {
    if (!prev.post || !next.post) return prev.post === next.post;
    return (
      prev.post.id === next.post.id &&
      prev.post.liked === next.post.liked &&
      prev.post.likes === next.post.likes &&
      prev.post.comments === next.post.comments &&
      prev.lightFeedText === next.lightFeedText &&
      prev.onLike === next.onLike &&
      prev.onComment === next.onComment &&
      prev.onShare === next.onShare &&
      prev.onOpenProfile === next.onOpenProfile
    );
  },
);

function MamaProfileSheet({ visible, profile, slideAnim, onClose, onStartChat, onFollow, isSelf }) {
  if (!profile) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View style={[styles.profileSheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.profilePreviewEyebrow, SANS]}>PROFILE PREVIEW</Text>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatarLarge}>
              <Text style={styles.profileAvatarEmoji}>{profile.avatarEmoji}</Text>
            </View>
            <Text style={[styles.profileName, SANS]}>{profile.name}</Text>
            <Text style={[styles.profileHandle, SANS]}>{profile.handle}</Text>
            <View style={styles.profileBadges}>
              <View style={[styles.profileBadge, styles.profileBadgeLavender]}>
                <Text style={[styles.profileBadgeText, SANS]}>📍 {profile.location}</Text>
              </View>
              <View style={[styles.profileBadge, styles.profileBadgePeach]}>
                <Text style={[styles.profileBadgeText, SANS]}>👶 {profile.phase}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.profileBio, SANS]}>{profile.bio}</Text>

          <View style={styles.profileActions}>
            {isSelf ? (
              <View style={styles.profileSelfNote}>
                <Text style={[styles.profileSelfNoteText, SANS]}>
                  This is you, mama — edit your profile from the Me tab.
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.chatBtnFilled} onPress={onStartChat} activeOpacity={0.88}>
                  <Text style={[styles.chatBtnFilledText, SANS]}>💬 Chat with this mama</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.followBtnOutline} onPress={onFollow} activeOpacity={0.88}>
                  <Text style={[styles.followBtnOutlineText, SANS]}>
                    {profile.following ? '✓ Following' : '➕ Follow Mama'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const ChatBubbleRow = memo(function ChatBubbleRow({ msg }) {
  return (
    <View style={[styles.chatBubble, msg.mine ? styles.chatBubbleMine : styles.chatBubbleTheirs]}>
      <Text style={[styles.chatBubbleText, SANS, msg.mine && styles.chatBubbleTextMine]}>
        {msg.text}
      </Text>
      <Text style={[styles.chatBubbleTime, SANS]}>{msg.time}</Text>
    </View>
  );
});

const CHAT_INPUT_ACCESSORY_ID = 'midnightLoungeChatDone';

function PrivateChatView({ profile, messages, draft, onDraftChange, onSend, onBack }) {
  const renderMessage = useCallback(
    ({ item }) => <ChatBubbleRow msg={item} />,
    [],
  );
  const messageKeyExtractor = useCallback((item) => item.id, []);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleSend = useCallback(() => {
    Keyboard.dismiss();
    onSend?.();
  }, [onSend]);

  if (!profile) return null;

  return (
    <KeyboardAvoidingView
      style={styles.chatRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.chatTopBar}>
        <TouchableOpacity
          onPress={() => {
            dismissKeyboard();
            onBack?.();
          }}
          style={styles.chatBackBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.chatBackText}>←</Text>
        </TouchableOpacity>
        <Pressable style={styles.chatTopMeta} onPress={dismissKeyboard}>
          <Text style={[styles.chatTopName, SANS]}>{profile.name}</Text>
          <Text style={[styles.chatTopSub, SANS]}>{profile.handle}</Text>
        </Pressable>
        <Pressable style={styles.chatTopAvatar} onPress={dismissKeyboard}>
          <Text style={styles.chatTopAvatarEmoji}>{profile.avatarEmoji}</Text>
        </Pressable>
      </View>

      <FlatList
        data={messages}
        keyExtractor={messageKeyExtractor}
        renderItem={renderMessage}
        style={styles.chatMessages}
        contentContainerStyle={styles.chatMessagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={dismissKeyboard}
        onTouchStart={dismissKeyboard}
        {...LIST_PERF}
      />

      <View style={styles.chatComposer}>
        <TextInput
          style={[styles.chatInput, SANS]}
          value={draft}
          onChangeText={onDraftChange}
          placeholder="Send a gentle midnight note…"
          placeholderTextColor={MIDNIGHT.textMuted}
          multiline
          blurOnSubmit={false}
          returnKeyType="default"
          inputAccessoryViewID={Platform.OS === 'ios' ? CHAT_INPUT_ACCESSORY_ID : undefined}
        />
        {Platform.OS === 'android' ? (
          <TouchableOpacity
            style={styles.chatDoneBtn}
            onPress={dismissKeyboard}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Dismiss keyboard"
          >
            <Text style={[styles.chatDoneBtnText, SANS]}>Done</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.chatSendBtn} onPress={handleSend} activeOpacity={0.88}>
          <Text style={styles.chatSendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={CHAT_INPUT_ACCESSORY_ID}>
          <View style={styles.keyboardAccessory}>
            <TouchableOpacity
              onPress={dismissKeyboard}
              style={styles.keyboardAccessoryBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Dismiss keyboard"
            >
              <Text style={[styles.keyboardAccessoryBtnText, SANS]}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      ) : null}
    </KeyboardAvoidingView>
  );
}

function MidnightLoungeBottomNav({
  activeTab,
  onTabChange,
  midnightLoungeOpen = false,
  subtleLotusBloom = false,
}) {
  return (
    <View style={styles.bottomNav} nativeID={MIDNIGHT_LOUNGE_SHELL.bottomNav}>
      {MIDNIGHT_LOUNGE_TABS.map((tab) => {
        const active = activeTab === tab.id;
        if (tab.center) {
          return (
            <View key={tab.id} style={styles.bottomNavCenterSlot}>
              <LotusFlowerButton
                variant="lavender"
                hideLabel
                midnightLoungeOpen={midnightLoungeOpen}
                subtleBloom={subtleLotusBloom}
                onPress={() => onTabChange('feed')}
              />
            </View>
          );
        }
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.bottomNavItem}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.85}
          >
            <Text style={[styles.bottomNavIcon, active && styles.bottomNavIconActive]}>{tab.icon}</Text>
            <Text style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive, SANS]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function PlaceholderPanel({ title, subtitle, emoji }) {
  return (
    <View style={styles.placeholderPanel}>
      <Text style={styles.placeholderEmoji}>{emoji}</Text>
      <Text style={[styles.placeholderTitle, SANS]}>{title}</Text>
      <Text style={[styles.placeholderSub, SANS]}>{subtitle}</Text>
    </View>
  );
}

function MidnightLoungeScreen({
  onExit,
  initialTab = 'home',
  focusToken = 0,
  userJourney = 'postpartum',
  activeMode = 'pregnant',
  onSelectJourneyMode,
  postpartumLotusOpen = false,
  mamaName = 'Mama',
  onMamaNameChange,
  shortBio = '',
  onShortBioChange,
  mamaBirthday,
  onBirthdayChange,
  profilePhotoUri,
  onPickProfilePhoto,
  onOpenVillagePortal,
  onDeleteAccount,
  adminUser = null,
  accountEmail = '',
  onAccountEmailChange,
  isVipLifetime = false,
  onToggleVipLifetime,
  onSendTestNewsletter,
  onSendTestWelcomeEmail,
  onGrantTestPoints,
  onResetTestPoints,
  onGrantManualPoints,
  onFireTestNotification,
  onOpenSanctuaryJournalTest,
  onPreviewPremiumWelcome,
  onOpenVillageConstellation,
  onOpenVillageBasket,
  onRefreshPwaCache,
  currentPoints = 0,
  littleOnes = [],
  onChildrenChange,
  ventingHistory = [],
  onAppendVentingEntry,
  guidanceHistory = [],
  onAppendGuidanceHistory,
  isPro = false,
  isSubscribed = false,
  onRequestUpgrade,
  journeyContext = '',
  initialJournalPrompt = '',
  autoOpenJournal = false,
  renderVillagePortal,
} = {}) {
  if (__DEV__ && !MIDNIGHT_LOUNGE_LAYOUT_LOCKED) {
    console.warn('[MidnightLounge] MIDNIGHT_LOUNGE_LAYOUT_LOCKED is false — layout edits allowed');
  }

  const [loungeTab, setLoungeTab] = useState(initialTab);
  const [activeSubView, setActiveSubView] = useState(null);
  const loungeSceneOpacity = useRef(new Animated.Value(1)).current;
  const loungeSceneSwapLock = useRef(false);
  const [boutiqueOpen, setBoutiqueOpen] = useState(false);
  const [boutiqueCanGoBack, setBoutiqueCanGoBack] = useState(false);
  const boutiqueRef = useRef(null);
  const boutiqueOpacity = useRef(new Animated.Value(0)).current;
  const boutiqueAnimatingRef = useRef(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const profileEditOpacity = useRef(new Animated.Value(0)).current;
  const profileEditAnimatingRef = useRef(false);
  const [posts, setPosts] = useState(MIDNIGHT_LOUNGE_POSTS);
  const [profiles, setProfiles] = useState(MIDNIGHT_MAMA_PROFILES);
  const [feedDraft, setFeedDraft] = useState('');
  const [publishingFeed, setPublishingFeed] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [sharePostId, setSharePostId] = useState(null);
  const feedHydratedRef = useRef(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [chatProfileId, setChatProfileId] = useState(null);
  const [chatDraft, setChatDraft] = useState('');
  const [gratitudeOpen, setGratitudeOpen] = useState(false);
  const [gratitudeNote, setGratitudeNote] = useState('');
  const todayKey = new Date().toDateString();
  const eveningMantra = useMemo(() => getTonightMantra(new Date()), [todayKey]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm0',
      text: 'Hey mama — I saw your post. You are doing beautifully.',
      time: '2:10 AM',
      mine: false,
    },
  ]);
  const { addPoints } = useVillageRewards();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadLoungeFeedState();
      if (cancelled) return;
      setPosts((prev) => mergeLoungeFeedPosts(saved, prev));
      feedHydratedRef.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!feedHydratedRef.current) return;
    void saveLoungeFeedState(posts);
  }, [posts]);

  const commentPost = commentPostId ? posts.find((entry) => entry.id === commentPostId) : null;
  const sharePost = sharePostId ? posts.find((entry) => entry.id === sharePostId) : null;

  useEffect(() => {
    if (!focusToken) return;
    setLoungeTab(initialTab || 'home');
    setActiveSubView(autoOpenJournal ? 'journal' : null);
  }, [focusToken, initialTab, autoOpenJournal]);

  useEffect(() => {
    if (userJourney === 'pregnant') {
      warmPregnancyOracle();
    }
  }, [userJourney]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      warmBoutiqueCatalogImages();
    });
    return () => task.cancel();
  }, []);

  useEffect(() => {
    if (loungeTab === 'profile') {
      warmBoutiqueCatalogImages();
    }
  }, [loungeTab]);

  const openBoutique = useCallback(() => {
    if (boutiqueAnimatingRef.current) return;
    warmBoutiqueCatalogImages();
    setBoutiqueCanGoBack(false);
    setBoutiqueOpen(true);
    boutiqueAnimatingRef.current = true;
    boutiqueOpacity.setValue(0);
    Animated.timing(boutiqueOpacity, {
      toValue: 1,
      duration: 440,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      boutiqueAnimatingRef.current = false;
    });
  }, [boutiqueOpacity]);

  const closeBoutique = useCallback(() => {
    if (boutiqueAnimatingRef.current) return;
    boutiqueAnimatingRef.current = true;
    Animated.timing(boutiqueOpacity, {
      toValue: 0,
      duration: 360,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      boutiqueAnimatingRef.current = false;
      if (!finished) return;
      setBoutiqueOpen(false);
      setBoutiqueCanGoBack(false);
    });
  }, [boutiqueOpacity]);

  const handleBoutiqueCanGoBack = useCallback((canGoBack) => {
    setBoutiqueCanGoBack(Boolean(canGoBack));
  }, []);

  const handleBoutiqueBack = useCallback(() => {
    if (boutiqueCanGoBack && boutiqueRef.current?.goBack?.()) {
      return;
    }
    closeBoutique();
  }, [boutiqueCanGoBack, closeBoutique]);

  const openProfileEdit = useCallback(() => {
    if (profileEditAnimatingRef.current) return;
    setProfileEditOpen(true);
    profileEditAnimatingRef.current = true;
    profileEditOpacity.setValue(0);
    Animated.timing(profileEditOpacity, {
      toValue: 1,
      duration: 380,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      profileEditAnimatingRef.current = false;
    });
  }, [profileEditOpacity]);

  const closeProfileEdit = useCallback(() => {
    if (profileEditAnimatingRef.current) return;
    profileEditAnimatingRef.current = true;
    Animated.timing(profileEditOpacity, {
      toValue: 0,
      duration: 320,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      profileEditAnimatingRef.current = false;
      if (!finished) return;
      setProfileEditOpen(false);
    });
  }, [profileEditOpacity]);

  const sheetY = useRef(new Animated.Value(420)).current;

  const selectedProfile = selectedProfileId ? profiles[selectedProfileId] : null;
  const chatProfile = chatProfileId ? profiles[chatProfileId] : null;
  const isViewingSelfProfile = selectedProfileId === 'self';

  const openProfile = useCallback(
    (postOrAuthorId) => {
      const fromPost = postOrAuthorId && typeof postOrAuthorId === 'object';
      const authorId = fromPost
        ? postOrAuthorId.authorId || 'self'
        : postOrAuthorId;
      if (!authorId) return;

      if (fromPost && !profiles[authorId]) {
        const displayName = postOrAuthorId.name?.trim() || mamaName?.trim() || 'Mama';
        const handle =
          postOrAuthorId.handle ||
          `@${displayName.replace(/\s+/g, '')}`;
        setProfiles((prev) => ({
          ...prev,
          [authorId]: {
            id: authorId,
            name: displayName,
            handle,
            avatarEmoji: postOrAuthorId.avatarEmoji || '🌙',
            location: 'Your village',
            phase:
              userJourney === 'pregnant'
                ? 'Expecting mama'
                : userJourney === 'postpartum'
                  ? 'Postpartum mama'
                  : 'Village mama',
            bio:
              authorId === 'self'
                ? shortBio?.trim() || 'Sharing from the midnight lounge.'
                : 'A mama in the Midnight Lounge circle.',
            following: false,
          },
        }));
      }

      setSelectedProfileId(authorId);
      setProfileSheetOpen(true);
      sheetY.setValue(420);
      Animated.spring(sheetY, {
        toValue: 0,
        ...VILLAGE_SNAPPY_SPRING,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    },
    [sheetY, profiles, mamaName, userJourney, shortBio],
  );

  const closeProfile = useCallback(() => {
    Animated.timing(sheetY, {
      toValue: 420,
      duration: 260,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      setProfileSheetOpen(false);
      setSelectedProfileId(null);
    });
  }, [sheetY]);

  const startPrivateChat = useCallback(() => {
    if (!selectedProfileId || selectedProfileId === 'self') return;
    setChatProfileId(selectedProfileId);
    closeProfile();
    setLoungeTab('chat');
  }, [closeProfile, selectedProfileId]);

  const toggleFollow = useCallback(() => {
    if (!selectedProfileId) return;
    setProfiles((prev) => ({
      ...prev,
      [selectedProfileId]: {
        ...prev[selectedProfileId],
        following: !prev[selectedProfileId].following,
      },
    }));
  }, [selectedProfileId]);

  const handleLike = useCallback((postId) => {
    setPosts((prev) => {
      const target = prev.find((p) => p.id === postId);
      const liking = Boolean(target && !target.liked);
      if (liking) {
        Promise.resolve().then(() => addPoints(25, 'encourage'));
      }
      return prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          liked: liking,
          likes: liking ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      });
    });
  }, [addPoints]);

  const handlePublishFeedPost = useCallback(() => {
    const trimmed = feedDraft.trim();
    if (!trimmed || publishingFeed) return;

    setPublishingFeed(true);
    const displayName = mamaName?.trim() || 'Mama';
    const newPost = createUserFeedPost({
      body: trimmed,
      mamaName: displayName,
      userJourney,
      kind: 'post',
      avatarEmoji: '🌙',
    });
    if (!newPost) {
      setPublishingFeed(false);
      return;
    }

    configureFeedSpringLayout();
    setProfiles((prev) => ({
      ...prev,
      self: prev.self ?? {
        id: 'self',
        name: displayName,
        handle: newPost.handle,
        avatarEmoji: '🌙',
        location: 'Your village',
        phase: userJourney === 'pregnant' ? 'Expecting mama' : 'Postpartum mama',
        bio: shortBio?.trim() || 'Sharing from the midnight lounge.',
        following: false,
      },
    }));
    setPosts((prev) => [newPost, ...prev]);
    setFeedDraft('');
    setPublishingFeed(false);
    void addPoints(40, 'share');
  }, [feedDraft, publishingFeed, mamaName, userJourney, shortBio, addPoints]);

  const handleFeedComment = useCallback((postId) => {
    setCommentPostId(postId);
    setCommentDraft('');
  }, []);

  const closeCommentSheet = useCallback(() => {
    setCommentPostId(null);
    setCommentDraft('');
  }, []);

  const handleSubmitComment = useCallback(() => {
    const trimmed = commentDraft.trim();
    if (!commentPostId || !trimmed) return;

    const displayName = mamaName?.trim() || 'Mama';
    const now = new Date();
    const entry = {
      id: `c-${now.getTime()}`,
      name: displayName,
      body: trimmed,
      timestamp: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== commentPostId) return post;
        const commentList = Array.isArray(post.commentList) ? [...post.commentList, entry] : [entry];
        return {
          ...post,
          comments: commentList.length,
          commentList,
        };
      }),
    );
    setCommentDraft('');
    closeCommentSheet();
    void addPoints(15, 'comment');
  }, [commentDraft, commentPostId, mamaName, closeCommentSheet, addPoints]);

  const handleFeedShare = useCallback((postId) => {
    setSharePostId(postId);
  }, []);

  const closeShareSheet = useCallback(() => {
    setSharePostId(null);
  }, []);

  const handleShareCopied = useCallback(() => {
    if (Platform.OS === 'web') {
      Alert.alert('Copied', 'Post copied — paste it into a text or social app for another mama.');
    }
  }, []);

  const handleSendChat = useCallback(() => {
    const trimmed = chatDraft.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { id: `m-${Date.now()}`, text: trimmed, time: now, mine: true }]);
    setChatDraft('');
  }, [chatDraft]);

  useEffect(() => {
    if (loungeTab !== 'chat') setChatProfileId(null);
  }, [loungeTab]);


  const handleHoldGratitude = useCallback(() => {
    const trimmed = gratitudeNote.trim();
    if (!trimmed) {
      setGratitudeOpen(false);
      return;
    }

    if (userJourney !== 'postpartum') {
      setGratitudeNote('');
      setGratitudeOpen(false);
      return;
    }

    const now = new Date();
    const displayName = mamaName?.trim() || 'Mama';
    const handle = `@${displayName.replace(/\s+/g, '')}`;
    const gratitudePost = createUserFeedPost({
      body: `Tonight I am holding gratitude for: ${trimmed}`,
      mamaName: displayName,
      userJourney,
      kind: 'gratitude',
      avatarEmoji: '🙏',
    });
    if (!gratitudePost) {
      setGratitudeOpen(false);
      return;
    }
    gratitudePost.id = `gratitude-${now.getTime()}`;

    configureFeedSpringLayout();
    setProfiles((prev) => ({
      ...prev,
      self: prev.self ?? {
        id: 'self',
        name: displayName,
        handle,
        avatarEmoji: '🙏',
        location: 'Your village',
        phase: userJourney === 'pregnant' ? 'Expecting mama' : 'Postpartum mama',
        bio: shortBio?.trim() || 'Sharing grace from the midnight lounge.',
        following: false,
      },
    }));
    setPosts((prev) => [gratitudePost, ...prev]);
    setGratitudeNote('');
    setGratitudeOpen(false);
    setLoungeTab('feed');
  }, [gratitudeNote, mamaName, shortBio, userJourney]);

  const isPregnantJourney = userJourney === 'pregnant';
  const isPostpartumJourney = userJourney === 'postpartum';
  const isImmersiveSubView = Boolean(
    chatProfileId || boutiqueOpen || profileEditOpen || activeSubView,
  );

  const enterLoungeSubView = useCallback(
    (subViewId) => {
      if (loungeSceneSwapLock.current) return;
      loungeSceneSwapLock.current = true;
      runNativeOpacitySceneSwap(
        loungeSceneOpacity,
        () => {
          setActiveSubView(subViewId);
        },
        {
          duration: NATIVE_SCENE_FADE_MS,
          onComplete: () => {
            loungeSceneSwapLock.current = false;
          },
        },
      );
    },
    [loungeSceneOpacity],
  );

  const closeLoungeSubView = useCallback(() => {
    if (loungeSceneSwapLock.current || !activeSubView) return;
    loungeSceneSwapLock.current = true;
    runNativeOpacitySceneSwap(
      loungeSceneOpacity,
      () => {
        setActiveSubView(null);
      },
      {
        duration: NATIVE_SCENE_FADE_MS,
        onComplete: () => {
          loungeSceneSwapLock.current = false;
        },
      },
    );
  }, [activeSubView, loungeSceneOpacity]);

  const handleFeaturePress = useCallback(
    (featureId) => {
      if (featureId === 'ml-journal') {
        if (isPostpartumJourney) {
          void warmPostpartumSanctuaryJournal().then(() => enterLoungeSubView('journal'));
          return;
        }
        enterLoungeSubView('journal');
        return;
      }
      if (featureId === 'ml-baby-oracle') {
        if (isPostpartumJourney) {
          void warmPostpartumBabyOracle().then(() => enterLoungeSubView('baby-oracle'));
          return;
        }
        enterLoungeSubView('baby-oracle');
        return;
      }
      if (featureId === 'ml-pregnancy-oracle') {
        enterLoungeSubView('pregnancy-oracle');
      }
    },
    [enterLoungeSubView, isPostpartumJourney],
  );

  const feedListHeader = useMemo(
    () => (
      <FeedListHeader
        isLight={isPregnantJourney || isPostpartumJourney}
        feedDraft={feedDraft}
        onFeedDraftChange={setFeedDraft}
        onPublishFeedPost={handlePublishFeedPost}
        publishingFeed={publishingFeed}
      />
    ),
    [
      isPregnantJourney,
      isPostpartumJourney,
      feedDraft,
      handlePublishFeedPost,
      publishingFeed,
    ],
  );

  const renderFeedPost = useCallback(
    ({ item }) => (
      <FeedPostCard
        post={item}
        onLike={handleLike}
        onComment={handleFeedComment}
        onShare={handleFeedShare}
        onOpenProfile={openProfile}
        lightFeedText={isPregnantJourney || isPostpartumJourney}
        gratitudeHighlight={isPostpartumJourney && item.kind === 'gratitude'}
      />
    ),
    [handleLike, handleFeedComment, handleFeedShare, openProfile, isPregnantJourney, isPostpartumJourney],
  );

  const feedKeyExtractor = useCallback((item) => item.id, []);

  const chatThreads = useMemo(() => MIDNIGHT_CHAT_THREADS, []);

  const renderChatThread = useCallback(
    ({ item }) => {
      const mama = profiles[item.mamaId];
      if (!mama) return null;
      return (
        <TouchableOpacity
          style={styles.chatThreadRow}
          onPress={() => setChatProfileId(item.mamaId)}
          activeOpacity={0.88}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{mama.avatarEmoji}</Text>
          </View>
          <View style={styles.chatThreadBody}>
            <Text style={[styles.chatThreadName, SANS]}>{mama.name}</Text>
            <Text style={[styles.chatThreadPreview, SANS]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
          <View style={styles.chatThreadMeta}>
            <Text style={[styles.chatThreadTime, SANS]}>{item.timestamp}</Text>
            {item.unread > 0 ? (
              <View style={styles.unreadDot}>
                <Text style={styles.unreadDotText}>{item.unread}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [profiles],
  );

  const chatKeyExtractor = useCallback((item) => item.id, []);

  const chatListHeader = useMemo(
    () => <Text style={[styles.sectionTitle, SANS]}>Private midnight threads</Text>,
    [],
  );

  const ritualsHomePanel = (
    <PeacefulEveningRituals
      mantra={eveningMantra}
      userJourney={userJourney}
      onGratitudePress={() => setGratitudeOpen(true)}
      onFeaturePress={handleFeaturePress}
    />
  );

  const renderRitualSubViewContent = (subViewId) => {
    if (subViewId === 'pregnancy-oracle') {
      return <TwoAMPregnancyOracleScreen onExit={closeLoungeSubView} gentleEnter={false} />;
    }

    if (subViewId === 'baby-oracle') {
      if (isPostpartumJourney) {
        return (
          <PostpartumBabyOracleScreen
            onExit={closeLoungeSubView}
            gentleEnter={false}
            loungeSubView
          />
        );
      }

      return (
        <Suspense fallback={<LazySubViewFallback variant="oracle" />}>
          <TwoAMBabyOracleScreen
            onExit={closeLoungeSubView}
            gentleEnter={false}
            loungeSubView
          />
        </Suspense>
      );
    }

    if (subViewId === 'journal') {
      if (isPostpartumJourney) {
        return (
          <PostpartumSoulSanctuaryScreen
            mamaName={mamaName}
            onExit={closeLoungeSubView}
            ventingHistory={ventingHistory}
            onAppendVentingEntry={onAppendVentingEntry}
            isPro={isPro || isSubscribed}
            isSubscribed={isPro || isSubscribed}
            onRequestUpgrade={onRequestUpgrade}
            gentleEnter={false}
            loungeSubView
            showMoodTracker
            journeyContext={journeyContext}
            journeyStage={activeMode === 'hybrid' ? 'hybrid' : userJourney}
            initialJournalPrompt={initialJournalPrompt}
          />
        );
      }

      return (
        <Suspense fallback={<LazySubViewFallback variant="journal" />}>
          <SoulSanctuaryScreen
            mamaName={mamaName}
            onExit={closeLoungeSubView}
            ventingHistory={ventingHistory}
            onAppendVentingEntry={onAppendVentingEntry}
            isPro={isPro || isSubscribed}
            isSubscribed={isPro || isSubscribed}
            onRequestUpgrade={onRequestUpgrade}
            gentleEnter={false}
            loungeSubView
            journeyContext={journeyContext}
            journeyStage={activeMode === 'hybrid' ? 'hybrid' : userJourney}
            initialJournalPrompt={initialJournalPrompt}
          />
        </Suspense>
      );
    }

    return null;
  };

  const renderMainBody = () => {
    if (chatProfileId && chatProfile) {
      return (
        <PrivateChatView
          profile={chatProfile}
          messages={chatMessages}
          draft={chatDraft}
          onDraftChange={setChatDraft}
          onSend={handleSendChat}
          onBack={() => setChatProfileId(null)}
        />
      );
    }

    if (loungeTab === 'home') {
      return (
        <View style={styles.loungeBodyStage}>
          {activeSubView ? (
            <View style={styles.loungeBodyFill}>{renderRitualSubViewContent(activeSubView)}</View>
          ) : (
            <View style={styles.loungeBodyFill}>{ritualsHomePanel}</View>
          )}
        </View>
      );
    }

    return renderLoungeTabBody();
  };

  function renderLoungeTabBody() {
    switch (loungeTab) {
      case 'village':
        return (
          <View style={styles.villageTabShell}>
            {renderVillagePortal?.({
              onClose: () => setLoungeTab('home'),
            })}
          </View>
        );
      case 'chat':
        return (
          <FlatList
            data={chatThreads}
            keyExtractor={chatKeyExtractor}
            renderItem={renderChatThread}
            ListHeaderComponent={chatListHeader}
            style={styles.feedScroll}
            contentContainerStyle={styles.feedScrollContent}
            showsVerticalScrollIndicator={false}
            {...LIST_PERF}
          />
        );
      case 'profile':
        return (
          <MidnightLoungeProfilePanel
            mamaName={mamaName}
            shortBio={shortBio}
            profilePhotoUri={profilePhotoUri}
            onOpenBoutique={openBoutique}
            onOpenProfileEdit={openProfileEdit}
            onDeleteAccount={onDeleteAccount}
            activeMode={activeMode}
            adminUser={adminUser}
            accountEmail={accountEmail}
            onAccountEmailChange={onAccountEmailChange}
            isVipLifetime={isVipLifetime}
            onToggleVipLifetime={onToggleVipLifetime}
            onSendTestNewsletter={onSendTestNewsletter}
            onSendTestWelcomeEmail={onSendTestWelcomeEmail}
            onGrantTestPoints={onGrantTestPoints}
            onResetTestPoints={onResetTestPoints}
            onGrantManualPoints={onGrantManualPoints}
            onFireTestNotification={onFireTestNotification}
            onOpenSanctuaryJournalTest={onOpenSanctuaryJournalTest}
            onPreviewPremiumWelcome={onPreviewPremiumWelcome}
            onOpenVillageConstellation={onOpenVillageConstellation}
            onOpenVillageBasket={onOpenVillageBasket}
            onRefreshPwaCache={onRefreshPwaCache}
            currentPoints={currentPoints}
          />
        );
      case 'feed':
      default:
        return (
          <FlatList
            data={posts}
            keyExtractor={feedKeyExtractor}
            renderItem={renderFeedPost}
            ListHeaderComponent={feedListHeader}
            nativeID={MIDNIGHT_LOUNGE_FEED_STACK[3]}
            style={styles.feedScroll}
            contentContainerStyle={styles.feedScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            {...LIST_PERF}
          />
        );
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.sceneCanvas, { opacity: loungeSceneOpacity }]}>
          {!isImmersiveSubView && loungeTab !== 'village' ? (
            <MidnightLoungeHeader onBack={onExit} />
          ) : null}

          <View style={styles.body} nativeID={MIDNIGHT_LOUNGE_SHELL.body}>
            {renderMainBody()}
            {boutiqueOpen ? (
              <Animated.View
                style={[styles.boutiqueSubView, { opacity: boutiqueOpacity }]}
                pointerEvents="auto"
              >
                <TouchableOpacity
                  style={styles.boutiqueBackBtn}
                  onPress={handleBoutiqueBack}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={
                    boutiqueCanGoBack ? 'Back to boutique items' : 'Back to Me'
                  }
                >
                  <Text style={[styles.boutiqueBackText, SANS]}>
                    {boutiqueCanGoBack ? '← Boutique' : '← Back to Me'}
                  </Text>
                </TouchableOpacity>
                <VillageBoutiqueScreen
                  ref={boutiqueRef}
                  onCanGoBackChange={handleBoutiqueCanGoBack}
                />
              </Animated.View>
            ) : null}
            {profileEditOpen ? (
              <Animated.View
                style={[styles.boutiqueSubView, { opacity: profileEditOpacity }]}
                pointerEvents="auto"
              >
                <TouchableOpacity
                  style={styles.boutiqueBackBtn}
                  onPress={closeProfileEdit}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Me"
                >
                  <Text style={[styles.boutiqueBackText, SANS]}>← Back to Me</Text>
                </TouchableOpacity>
                <MidnightLoungeProfileEditPanel
                  mamaName={mamaName}
                  onMamaNameChange={onMamaNameChange}
                  shortBio={shortBio}
                  onShortBioChange={onShortBioChange}
                  mamaBirthday={mamaBirthday}
                  onBirthdayChange={onBirthdayChange}
                  profilePhotoUri={profilePhotoUri}
                  onPickProfilePhoto={onPickProfilePhoto}
                  onClose={closeProfileEdit}
                  activeMode={activeMode}
                  onSelectJourneyMode={onSelectJourneyMode}
                  accountEmail={accountEmail}
                  onAccountEmailChange={onAccountEmailChange}
                  littleOnes={littleOnes}
                  onChildrenChange={onChildrenChange}
                />
              </Animated.View>
            ) : null}
          </View>

          {!isImmersiveSubView ? (
            <MidnightLoungeBottomNav
              activeTab={loungeTab}
              onTabChange={setLoungeTab}
              midnightLoungeOpen={isPostpartumJourney ? postpartumLotusOpen : false}
              subtleLotusBloom={isPostpartumJourney}
            />
          ) : null}
        </Animated.View>
      </SafeAreaView>

      <MamaProfileSheet
        visible={profileSheetOpen}
        profile={selectedProfile}
        slideAnim={sheetY}
        onClose={closeProfile}
        onStartChat={startPrivateChat}
        onFollow={toggleFollow}
        isSelf={isViewingSelfProfile}
      />

      <Modal
        visible={gratitudeOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setGratitudeOpen(false)}
      >
        <View style={styles.gratitudeBackdrop}>
          <View style={styles.gratitudeSheet}>
            <Text style={[styles.gratitudeTitle, SANS]}>One grace from today</Text>
            {isPostpartumJourney ? (
              <Text style={[styles.gratitudeShareHint, SANS]}>
                Hold this gratitude to share it softly in the Midnight Lounge feed.
              </Text>
            ) : null}
            <TextInput
              style={[styles.gratitudeInput, SANS]}
              value={gratitudeNote}
              onChangeText={setGratitudeNote}
              placeholder="A warm cup, a sleepy sigh, a kind text…"
              placeholderTextColor={MIDNIGHT.textMuted}
              multiline
            />
            <TouchableOpacity
              style={styles.gratitudeDoneBtn}
              onPress={handleHoldGratitude}
              activeOpacity={0.88}
            >
              <Text style={[styles.gratitudeDoneText, SANS]}>Hold this gratitude</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FeedCommentSheet
        visible={Boolean(commentPostId)}
        post={commentPost}
        draft={commentDraft}
        onDraftChange={setCommentDraft}
        onClose={closeCommentSheet}
        onSubmit={handleSubmitComment}
      />

      <FeedShareSheet
        visible={Boolean(sharePostId)}
        post={sharePost}
        onClose={closeShareSheet}
        onCopied={handleShareCopied}
      />
    </View>
  );
}

export default React.memo(MidnightLoungeScreen);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MIDNIGHT.bg,
  },
  safe: {
    flex: 1,
  },
  sceneCanvas: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MIDNIGHT_LOUNGE_LAYOUT.headerPadHorizontal,
    paddingVertical: MIDNIGHT_LOUNGE_LAYOUT.headerPadVertical,
    borderBottomWidth: 1,
    borderBottomColor: MIDNIGHT.borderSoft,
    backgroundColor: MIDNIGHT.bgElevated,
    zIndex: 10,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
      },
      default: {},
    }),
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    fontStyle: 'italic',
    color: MIDNIGHT.textPrimary,
    letterSpacing: 0.15,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  headerSideSlot: {
    width: 64,
  },
  headerBackBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 8,
  },
  headerBackText: {
    fontSize: 15,
    fontWeight: '600',
    color: MIDNIGHT.lavender,
  },
  body: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  loungeBodyStage: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: MIDNIGHT.bg,
  },
  loungeBodyFill: {
    flex: 1,
    minHeight: 0,
    backgroundColor: MIDNIGHT.bg,
  },
  feedScroll: {
    flex: 1,
  },
  feedScrollContent: {
    paddingHorizontal: MIDNIGHT_LOUNGE_LAYOUT.feedPadHorizontal,
    paddingTop: MIDNIGHT_LOUNGE_LAYOUT.feedPadTop,
    paddingBottom: MIDNIGHT_LOUNGE_LAYOUT.feedPadBottom,
  },
  feedIntro: {
    marginBottom: MIDNIGHT_LOUNGE_LAYOUT.feedIntroMarginBottom,
    padding: MIDNIGHT_LOUNGE_LAYOUT.feedIntroPad,
    borderRadius: MIDNIGHT_LOUNGE_LAYOUT.feedIntroRadius,
    backgroundColor: MIDNIGHT.lavenderTint,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
  },
  feedIntroEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#000000',
    marginBottom: 6,
  },
  feedIntroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  feedIntroSub: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: '#000000',
    fontStyle: 'italic',
  },
  feedIntroLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  feedIntroTextLight: {
    color: '#FFFFFF',
  },
  feedIntroSubLight: {
    color: 'rgba(255, 255, 255, 0.88)',
  },
  askFeedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: MIDNIGHT_LOUNGE_LAYOUT.askCardRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    padding: MIDNIGHT_LOUNGE_LAYOUT.askCardPad,
    paddingBottom: 20,
    marginBottom: MIDNIGHT_LOUNGE_LAYOUT.askCardMarginBottom,
    overflow: 'visible',
  },
  askFeedCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  askFeedTextLight: {
    color: '#FFFFFF',
  },
  askFeedHintLight: {
    color: 'rgba(255, 255, 255, 0.88)',
  },
  askFeedEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#000000',
    marginBottom: 6,
  },
  askFeedHint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 12,
  },
  askFeedInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 14,
    lineHeight: 20,
    color: CHARCOAL,
    fontWeight: '600',
    marginBottom: 12,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  askFeedBtn: {
    alignSelf: 'stretch',
    height: 50,
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
      },
      web: {
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.16)',
      },
    }),
  },
  askFeedBtnDisabled: {
    opacity: 0.55,
  },
  askFeedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.3,
  },
  askVerdictCard: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    padding: 12,
  },
  askVerdictEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#000000',
    marginBottom: 6,
  },
  askVerdictBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: '#000000',
  },
  askVerdictAddBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  askVerdictAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  askVerdictDismiss: {
    fontSize: 11,
    fontWeight: '500',
    color: '#000000',
    marginTop: 8,
  },
  askRegistryCard: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    padding: 12,
  },
  askRegistryStepLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: MIDNIGHT.textMuted,
    marginBottom: 6,
  },
  askRegistryItemContext: {
    fontSize: 11,
    fontWeight: '600',
    color: MIDNIGHT.textSecondary,
    marginBottom: 8,
  },
  askRegistryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: MIDNIGHT.textPrimary,
    marginBottom: 10,
    lineHeight: 18,
  },
  askRegistryChosenBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: MIDNIGHT.textSecondary,
    marginBottom: 8,
  },
  askRegistryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  askRegistryPlatformBtn: {
    alignItems: 'center',
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  askRegistryPlatformEmoji: {
    fontSize: 20,
  },
  askRegistryPlatformLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: MIDNIGHT.textSecondary,
    marginTop: 4,
  },
  askRegistryBrandsHint: {
    fontSize: 11,
    fontWeight: '600',
    color: MIDNIGHT.textMuted,
    marginBottom: 10,
    lineHeight: 16,
  },
  askRegistryBrandBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  askRegistryBrandText: {
    fontSize: 13,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
  },
  askRegistryLinkInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: MIDNIGHT.textPrimary,
    marginBottom: 8,
  },
  askRegistryConfirmBtn: {
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 11,
    alignItems: 'center',
  },
  askRegistryConfirmText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  askRegistryBackLink: {
    fontSize: 11,
    fontWeight: '600',
    color: MIDNIGHT.textSecondary,
    marginBottom: 4,
  },
  livePollFeedSection: {
    marginBottom: 8,
  },
  postpartumPollPopStack: {
    marginTop: 2,
    marginBottom: 10,
  },
  livePollFeedHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#000000',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  ritualsHeader: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  ritualsGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: LOUNGE_INK,
    marginBottom: 8,
  },
  ritualsSub: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: LOUNGE_INK,
    fontStyle: 'italic',
  },
  ritualCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  ritualCardLavender: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  ritualCardPeach: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  ritualCardPowder: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  ritualCardEmoji: {
    fontSize: 24,
    marginBottom: 10,
  },
  ritualCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LOUNGE_INK,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  ritualCardSub: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: LOUNGE_INK,
    marginBottom: 12,
  },
  ritualCardCta: {
    fontSize: 13,
    fontWeight: '700',
    color: LOUNGE_INK,
  },
  ritualMantraBody: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: LOUNGE_INK,
    fontStyle: 'italic',
  },
  subViewFallback: {
    flex: 1,
    backgroundColor: MIDNIGHT.bg,
  },
  villageTabShell: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  boutiqueSubView: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    flexDirection: 'column',
    backgroundColor: MIDNIGHT.bg,
    overflow: 'hidden',
    ...Platform.select({
      web: { isolation: 'isolate' },
      default: {},
    }),
  },
  boutiqueBackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  boutiqueBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: MIDNIGHT.lavender,
  },
  gratitudeBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 8, 16, 0.62)',
    justifyContent: 'center',
    padding: 24,
    ...Platform.select({
      web: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' },
      default: {},
    }),
  },
  gratitudeSheet: {
    backgroundColor: MIDNIGHT.bgCardSoft,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
  },
  gratitudeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  gratitudeShareHint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: MIDNIGHT.textSecondary,
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  gratitudeInput: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    backgroundColor: MIDNIGHT.bgCard,
    padding: 14,
    fontSize: 15,
    color: MIDNIGHT.textPrimary,
    marginBottom: 14,
  },
  gratitudeDoneBtn: {
    backgroundColor: MIDNIGHT.lavender,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  gratitudeDoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A2540',
  },
  commentSheet: {
    backgroundColor: MIDNIGHT.bgCardSoft,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    maxHeight: '78%',
  },
  commentPostPreview: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: MIDNIGHT.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  commentList: {
    maxHeight: 220,
    marginBottom: 12,
  },
  commentRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: MIDNIGHT.borderSoft,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    marginBottom: 4,
  },
  commentBody: {
    fontSize: 14,
    lineHeight: 20,
    color: MIDNIGHT.textPrimary,
  },
  commentTime: {
    fontSize: 11,
    color: MIDNIGHT.textMuted,
    marginTop: 4,
  },
  commentEmpty: {
    fontSize: 13,
    lineHeight: 19,
    color: MIDNIGHT.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  commentInput: {
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    backgroundColor: MIDNIGHT.bgCard,
    padding: 14,
    fontSize: 15,
    color: MIDNIGHT.textPrimary,
    marginBottom: 12,
  },
  shareSheet: {
    backgroundColor: MIDNIGHT.bgCardSoft,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
  },
  shareOptionBtn: {
    backgroundColor: MIDNIGHT.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  shareOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
  },
  shareCancelBtn: {
    marginTop: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: MIDNIGHT.textMuted,
  },
  feedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  feedCardGratitude: {
    borderColor: 'rgba(245, 217, 206, 0.55)',
    backgroundColor: 'rgba(255, 252, 248, 0.14)',
  },
  feedAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MIDNIGHT.powderTint,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  feedAuthorMeta: {
    flex: 1,
  },
  feedAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  feedAuthorNameLight: {
    color: '#FFFFFF',
  },
  feedAuthorHandle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    marginTop: 2,
  },
  feedAuthorHandleLight: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  feedBody: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 12,
  },
  feedBodyLight: {
    color: 'rgba(255, 255, 255, 0.94)',
  },
  feedImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  feedToolbar: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: MIDNIGHT.borderSoft,
  },
  feedToolBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  feedToolText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  feedToolTextLight: {
    color: 'rgba(255, 255, 255, 0.88)',
  },
  feedToolTextActive: {
    color: MIDNIGHT.peach,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 8, 16, 0.62)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: { backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' },
      default: {},
    }),
  },
  profileSheet: {
    backgroundColor: MIDNIGHT.bgCardSoft,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: MIDNIGHT.lavenderMuted,
    alignSelf: 'center',
    marginBottom: 18,
  },
  profilePreviewEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  profileSelfNote: {
    backgroundColor: MIDNIGHT.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  profileSelfNoteText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: MIDNIGHT.textSecondary,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: MIDNIGHT.lavenderTint,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileAvatarEmoji: {
    fontSize: 32,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
  },
  profileHandle: {
    fontSize: 13,
    color: MIDNIGHT.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  profileBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  profileBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  profileBadgeLavender: {
    backgroundColor: MIDNIGHT.lavenderTint,
    borderColor: 'rgba(196, 188, 230, 0.35)',
  },
  profileBadgePeach: {
    backgroundColor: MIDNIGHT.peachTint,
    borderColor: 'rgba(245, 217, 206, 0.28)',
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: MIDNIGHT.textSecondary,
  },
  profileBio: {
    fontSize: 14,
    lineHeight: 21,
    color: MIDNIGHT.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 10,
  },
  chatBtnFilled: {
    flex: 1,
    backgroundColor: MIDNIGHT.lavender,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  chatBtnFilledText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2A2540',
    textAlign: 'center',
  },
  followBtnOutline: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    backgroundColor: 'transparent',
  },
  followBtnOutlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
  },
  chatRoot: {
    flex: 1,
    backgroundColor: MIDNIGHT.bg,
  },
  chatTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MIDNIGHT.borderSoft,
    backgroundColor: MIDNIGHT.bgElevated,
  },
  chatBackBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBackText: {
    fontSize: 22,
    color: MIDNIGHT.lavender,
  },
  chatTopMeta: {
    flex: 1,
    marginLeft: 4,
  },
  chatTopName: {
    fontSize: 16,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
  },
  chatTopSub: {
    fontSize: 12,
    color: MIDNIGHT.textMuted,
  },
  chatTopAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MIDNIGHT.powderTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTopAvatarEmoji: {
    fontSize: 18,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 16,
    paddingBottom: 12,
  },
  chatBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  chatBubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: MIDNIGHT.bgCard,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
  },
  chatBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: MIDNIGHT.lavenderTint,
    borderWidth: 1,
    borderColor: 'rgba(196, 188, 230, 0.35)',
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: MIDNIGHT.textSecondary,
  },
  chatBubbleTextMine: {
    color: MIDNIGHT.textPrimary,
  },
  chatBubbleTime: {
    fontSize: 10,
    color: MIDNIGHT.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: MIDNIGHT.borderSoft,
    backgroundColor: MIDNIGHT.bgElevated,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: MIDNIGHT.bgCard,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: MIDNIGHT.textPrimary,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MIDNIGHT.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A2540',
  },
  chatDoneBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MIDNIGHT.bgCard,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
  },
  chatDoneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: MIDNIGHT.lavender,
  },
  keyboardAccessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: MIDNIGHT.bgElevated,
    borderTopWidth: 1,
    borderTopColor: MIDNIGHT.borderSoft,
  },
  keyboardAccessoryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  keyboardAccessoryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: MIDNIGHT.lavender,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    marginBottom: 14,
  },
  chatThreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: MIDNIGHT.bgCard,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    marginBottom: 10,
  },
  chatThreadBody: {
    flex: 1,
    marginLeft: 4,
  },
  chatThreadName: {
    fontSize: 14,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
  },
  chatThreadPreview: {
    fontSize: 12,
    color: MIDNIGHT.textMuted,
    marginTop: 2,
  },
  chatThreadMeta: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  chatThreadTime: {
    fontSize: 10,
    color: MIDNIGHT.textMuted,
  },
  unreadDot: {
    marginTop: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: MIDNIGHT.peach,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3D2E28',
  },
  placeholderPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSub: {
    fontSize: 14,
    lineHeight: 20,
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: MIDNIGHT.borderSoft,
    backgroundColor: MIDNIGHT.bgElevated,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bottomNavCenterSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    paddingBottom: 2,
  },
  bottomNavIcon: {
    fontSize: 18,
    opacity: 0.45,
    marginBottom: 2,
  },
  bottomNavIconActive: {
    opacity: 1,
  },
  bottomNavLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: MIDNIGHT.textMuted,
  },
  bottomNavLabelActive: {
    color: MIDNIGHT.lavender,
    fontWeight: '800',
  },
});
