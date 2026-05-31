import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Easing,
  StyleSheet,
  Platform,
} from 'react-native';
import VillageBrandHeader from './VillageBrandHeader';
import CosmicNebulaBackdrop from './CosmicNebulaBackdrop';
import { injectNurseryWebFonts, retroSoft, retroAccent, retroHubTitle } from './nurseryRetroFonts';
import { VILLAGE_IN_OUT_SIN } from './villageEasing';
import {
  VILLAGE_PRIVACY_BANNER,
  ICEBREAKER_HINTS,
  ICEBREAKER_PLACEHOLDER,
  BASKET_SHARE_HINTS,
  BASKET_SHARE_PLACEHOLDER,
  ZONE_TINTS,
  MAP_PRIVACY_ZONES,
  NEARBY_MAMA_PROFILES,
} from './villageCommunityData';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const GLASS = {
  bg: 'rgba(255, 252, 248, 0.42)',
  border: 'rgba(233, 168, 137, 0.35)',
};

const PORTAL_TABS = [
  { id: 'constellation', label: '✨ Constellation' },
  { id: 'basket', label: '📦 Village Basket' },
  { id: 'boards', label: '💬 Boards' },
];

function PrivacyBanner() {
  return (
    <View style={styles.privacyBanner}>
      <Text style={styles.privacyBannerText}>{VILLAGE_PRIVACY_BANNER}</Text>
    </View>
  );
}

function VillageMapTerrain({ mapGlow }) {
  const shimmer = mapGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  return (
    <Animated.View style={{ opacity: shimmer }}>
      <View style={styles.mapBaseTerrain} />
      <View style={styles.mapHillBack} />
      <View style={styles.mapHillFront} />
      <View style={styles.mapGridOverlay} pointerEvents="none" />
      <View style={[styles.mapParkPatch, styles.mapParkNorth]} />
      <View style={[styles.mapParkPatch, styles.mapParkSouth]} />
      <View style={styles.mapWater} />
      <View style={[styles.mapRoad, styles.mapRoadMainH]} />
      <View style={[styles.mapRoad, styles.mapRoadLowerH]} />
      <View style={[styles.mapRoad, styles.mapRoadMainV]} />
      <View style={[styles.mapRoad, styles.mapRoadEastV]} />
      <View style={[styles.mapRoad, styles.mapRoadDiagonal]} />
      <View style={styles.mapBlockA} />
      <View style={styles.mapBlockB} />
      <View style={styles.mapBlockC} />
      <View style={styles.mapShadowPlate} />
    </Animated.View>
  );
}

function LotusMapPin({ zone, mapDrift }) {
  const half = zone.size / 2;
  const tint = ZONE_TINTS[zone.tint] || ZONE_TINTS.sage;
  const bob = mapDrift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -5, 0],
  });
  const pulse = mapDrift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.03, 1],
  });

  return (
    <Animated.View
      style={[
        styles.lotusPinAnchor,
        {
          top: zone.top,
          left: zone.left,
          width: zone.size,
          height: zone.size,
          transform: [{ translateY: bob }, { scale: pulse }],
        },
      ]}
    >
      <View
        style={[
          styles.privacyRing,
          {
            width: zone.size,
            height: zone.size,
            borderRadius: half,
            borderColor: tint.ring,
            backgroundColor: tint.fill,
          },
        ]}
      />
      <View
        style={[
          styles.privacyRingGlow,
          {
            width: zone.size - 10,
            height: zone.size - 10,
            borderRadius: (zone.size - 10) / 2,
            backgroundColor: tint.glow,
          },
        ]}
      />
      <View style={styles.lotusPinBadge}>
        <Text style={styles.lotusPinEmoji}>🪷</Text>
      </View>
      <Text style={styles.lotusPinLabel}>{zone.label}</Text>
    </Animated.View>
  );
}

function VillageMapPanel() {
  const mapDrift = useRef(new Animated.Value(0)).current;
  const mapGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mapDrift, {
          toValue: 1,
          duration: 5200,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(mapDrift, {
          toValue: 0,
          duration: 5200,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mapGlow, {
          toValue: 1,
          duration: 3600,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(mapGlow, {
          toValue: 0,
          duration: 3600,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    driftLoop.start();
    glowLoop.start();
    return () => {
      driftLoop.stop();
      glowLoop.stop();
    };
  }, [mapDrift, mapGlow]);

  const mapLift = mapDrift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 1],
  });

  return (
    <ScrollView
      style={styles.portalScroll}
      contentContainerStyle={styles.mapPanelScrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View
        style={[
          styles.mapStage3D,
          {
            transform: [{ translateY: mapLift }],
          },
        ]}
      >
        <View style={styles.mapCanvas}>
          <VillageMapTerrain mapGlow={mapGlow} />
          <View style={styles.mapLegendRow} pointerEvents="none">
            <Text style={styles.mapCaption}>Neighborhood model · blurred 1–3 mi zones</Text>
            <Text style={styles.mapLegendLotus}>🪷 lotus pin</Text>
          </View>
          {MAP_PRIVACY_ZONES.map((zone) => (
            <LotusMapPin key={zone.id} zone={zone} mapDrift={mapDrift} />
          ))}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.mapYouMarker,
              {
                transform: [
                  {
                    translateY: mapDrift.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -3],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.mapYouRing, { borderColor: ZONE_TINTS.sage.ring }]} />
            <View style={styles.mapYouBadge}>
              <Text style={styles.mapYouLotus}>🪷</Text>
            </View>
            <Text style={styles.mapYouLabel}>You</Text>
          </Animated.View>
        </View>
      </Animated.View>

      <View style={styles.matchFeedSection}>
        <Text style={[styles.feedHeading, retroAccent]}>Mamas near you</Text>
        <Text style={styles.feedSub}>Scroll to meet blurred-nearby mamas in your village</Text>
        {NEARBY_MAMA_PROFILES.map((profile) => (
          <View key={profile.id} style={styles.matchCard}>
            <Text style={[styles.matchNickname, retroSoft]}>{profile.nickname}</Text>
            <Text style={styles.matchMeta}>
              {profile.persona} · {profile.distance}
            </Text>
            <Text style={[styles.matchBio, retroSoft]}>{profile.bio}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function VillageConstellationPanel({ selectedVillageMamaId, onSelectVillageMama }) {
  const phaseAnim = useRef(new Animated.Value(0)).current;
  const nodePulses = useRef(NEARBY_MAMA_PROFILES.map(() => new Animated.Value(0.2))).current;

  useEffect(() => {
    const nebulaLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(phaseAnim, {
          toValue: 1,
          duration: 8000,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(phaseAnim, {
          toValue: 0,
          duration: 8000,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );

    const nodeLoops = nodePulses.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1800 + (index % 5) * 260,
            easing: VILLAGE_IN_OUT_SIN,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 1800 + (index % 5) * 260,
            easing: VILLAGE_IN_OUT_SIN,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      )
    );

    nebulaLoop.start();
    nodeLoops.forEach((l) => l.start());

    return () => {
      nebulaLoop.stop();
      nodeLoops.forEach((l) => l.stop());
    };
  }, [phaseAnim, nodePulses]);

  const selectedProfile =
    NEARBY_MAMA_PROFILES.find((p) => p.id === selectedVillageMamaId) || null;

  return (
    <ScrollView
      style={styles.portalScroll}
      contentContainerStyle={styles.constellationScrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.constellationViewport}>
        <CosmicNebulaBackdrop phaseAnim={phaseAnim} />

        <View style={styles.constellationOverlay} pointerEvents="box-none">
          <View style={styles.constellationCenterStarWrap} pointerEvents="none">
            <View style={styles.constellationCenterHalo} />
            <View style={styles.constellationCenterStar} />
            <Text style={styles.constellationCenterLabel}>You</Text>
          </View>

          {NEARBY_MAMA_PROFILES.map((profile, index) => {
            const pulse = nodePulses[index];
            const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
            const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] });

            // Stable, pseudo-random layout — no GPS, just a constellation.
            const left = `${12 + ((index * 31) % 76)}%`;
            const top = `${10 + ((index * 47) % 70)}%`;

            const isSelected = selectedVillageMamaId === profile.id;

            return (
              <TouchableOpacity
                key={profile.id}
                style={[styles.constellationNodeTap, { left, top }]}
                activeOpacity={0.9}
                onPress={() => onSelectVillageMama(profile.id)}
              >
                <Animated.View
                  style={[
                    styles.constellationNodeGlow,
                    {
                      opacity: glow,
                      transform: [{ scale }],
                    },
                    isSelected && styles.constellationNodeGlowSelected,
                  ]}
                />
                <Animated.View
                  style={[
                    styles.constellationNode,
                    {
                      transform: [{ scale }],
                    },
                    isSelected && styles.constellationNodeSelected,
                  ]}
                />
                <Text style={styles.constellationNodeDistance}>{profile.distance}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.constellationCardDock}>
        {selectedProfile ? (
          <View style={styles.constellationProfileCard}>
            <Text style={[styles.constellationProfileName, retroSoft]}>
              {selectedProfile.nickname}
            </Text>
            <Text style={styles.constellationProfileMeta}>
              {selectedProfile.persona} · {selectedProfile.distance}
            </Text>
            <Text style={[styles.constellationProfileBio, retroSoft]}>
              {selectedProfile.bio}
            </Text>
          </View>
        ) : (
          <View style={styles.constellationHintCard}>
            <Text style={[styles.constellationHintTitle, retroAccent]}>
              Tap a star mama to meet her
            </Text>
            <Text style={[styles.constellationHintText, retroSoft]}>
              Distances are fuzzy on purpose — your exact location stays hidden.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function BasketListing({ item, onCoordinate }) {
  return (
    <View style={styles.basketCard}>
      <Text style={styles.basketTag}>{item.tag}</Text>
      {item.sharedBy ? (
        <Text style={styles.basketSharedBy}>Shared by {item.sharedBy}</Text>
      ) : null}
      <Text style={[styles.basketTitle, retroSoft]}>{item.title}</Text>
      <Text style={[styles.basketDetail, retroSoft]}>{item.detail}</Text>
      <TouchableOpacity style={styles.basketBtn} onPress={() => onCoordinate(item.id)} activeOpacity={0.88}>
        <Text style={styles.basketBtnText}>Coordinate Support Hub</Text>
      </TouchableOpacity>
    </View>
  );
}

function VillageBasketPanel({
  basketOfferings,
  basketSeeking,
  newBasketDraft,
  onNewBasketDraftChange,
  basketShareMode,
  onBasketShareModeChange,
  onAddBasketListing,
  onCoordinate,
}) {
  return (
    <ScrollView style={styles.portalScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.icebreakerCard}>
        <Text style={[styles.icebreakerTitle, retroHubTitle]}>Village Basket Share</Text>
        <Text style={[styles.icebreakerSub, retroSoft]}>
          Tell nearby mamas what you can offer — or what you gently need
        </Text>
        {BASKET_SHARE_HINTS.map((hint) => (
          <Text key={hint} style={styles.icebreakerHint}>
            · {hint}
          </Text>
        ))}
        <View style={styles.basketModeRow}>
          <TouchableOpacity
            style={[
              styles.basketModeBtn,
              basketShareMode === 'offering' && styles.basketModeBtnActive,
            ]}
            onPress={() => onBasketShareModeChange('offering')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.basketModeBtnText,
                basketShareMode === 'offering' && styles.basketModeBtnTextActive,
              ]}
            >
              📦 Offering
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.basketModeBtn,
              basketShareMode === 'seeking' && styles.basketModeBtnActive,
            ]}
            onPress={() => onBasketShareModeChange('seeking')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.basketModeBtnText,
                basketShareMode === 'seeking' && styles.basketModeBtnTextActive,
              ]}
            >
              🙏 Seeking
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.icebreakerInput, retroSoft]}
          placeholder={BASKET_SHARE_PLACEHOLDER}
          placeholderTextColor="#7A8E82"
          value={newBasketDraft}
          onChangeText={onNewBasketDraftChange}
          multiline
          onSubmitEditing={onAddBasketListing}
        />
        <TouchableOpacity style={styles.icebreakerPostBtn} onPress={onAddBasketListing} activeOpacity={0.88}>
          <Text style={styles.icebreakerPostBtnText}>Share with the Village Basket</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.basketSectionTitle, retroAccent]}>Offering Items</Text>
      {(basketOfferings ?? []).map((item) => (
        <BasketListing key={item.id} item={item} onCoordinate={onCoordinate} />
      ))}
      <Text style={[styles.basketSectionTitle, { marginTop: 8 }, retroAccent]}>Seeking Help</Text>
      {(basketSeeking ?? []).map((item) => (
        <BasketListing key={item.id} item={item} onCoordinate={onCoordinate} />
      ))}
    </ScrollView>
  );
}

function CommunityBoardsPanel({
  communityPosts,
  expandedThreads,
  threadDrafts,
  newPostDraft,
  onNewPostDraftChange,
  onAddCommunityPost,
  onToggleThread,
  onThreadDraftChange,
  onAddThreadReply,
}) {
  return (
    <ScrollView style={styles.portalScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.icebreakerCard}>
        <Text style={[styles.icebreakerTitle, retroHubTitle]}>Icebreaker Village Chat</Text>
        <Text style={[styles.icebreakerSub, retroSoft]}>
          Start a gentle conversation — your village is listening
        </Text>
        {ICEBREAKER_HINTS.map((hint) => (
          <Text key={hint} style={styles.icebreakerHint}>
            · {hint}
          </Text>
        ))}
        <TextInput
          style={[styles.icebreakerInput, retroSoft]}
          placeholder={ICEBREAKER_PLACEHOLDER}
          placeholderTextColor="#7A8E82"
          value={newPostDraft}
          onChangeText={onNewPostDraftChange}
          multiline
          onSubmitEditing={onAddCommunityPost}
        />
        <TouchableOpacity style={styles.icebreakerPostBtn} onPress={onAddCommunityPost} activeOpacity={0.88}>
          <Text style={styles.icebreakerPostBtnText}>Post to the Village</Text>
        </TouchableOpacity>
      </View>

      {communityPosts.map((post) => {
        const expanded = !!expandedThreads[post.id];
        const draft = threadDrafts[post.id] || '';
        return (
          <View key={post.id} style={styles.postCard}>
            <Text style={[styles.postAuthor, retroSoft]}>{post.author}</Text>
            <Text style={styles.postTime}>{post.time}</Text>
            <Text style={[styles.postBody, retroSoft]}>{post.body}</Text>
            <TouchableOpacity style={styles.threadToggle} onPress={() => onToggleThread(post.id)}>
              <Text style={[styles.threadToggleText, retroAccent]}>
                {expanded ? '▼ Hide village thread' : '▶ Open village thread'}
              </Text>
            </TouchableOpacity>
            {expanded ? (
              <View style={styles.threadBox}>
                {(post.replies || []).map((reply) => (
                  <View key={reply.id} style={styles.replyRow}>
                    <Text style={[styles.replyAuthor, retroSoft]}>{reply.author}</Text>
                    <Text style={[styles.replyText, retroSoft]}>{reply.text}</Text>
                    <Text style={styles.replyTime}>{reply.time}</Text>
                  </View>
                ))}
                <View style={styles.replyComposer}>
                  <TextInput
                    style={[styles.replyInput, retroSoft]}
                    placeholder="Reply with warmth…"
                    placeholderTextColor="#7A8E82"
                    value={draft}
                    onChangeText={(text) => onThreadDraftChange(post.id, text)}
                    onSubmitEditing={() => onAddThreadReply(post.id)}
                    returnKeyType="send"
                  />
                  <TouchableOpacity
                    style={styles.replySendBtn}
                    onPress={() => onAddThreadReply(post.id)}
                  >
                    <Text style={styles.replySendText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

export default function VillageCommunityPortal({
  villageLogoUri,
  pulseAnim,
  villagePortalTab,
  onVillagePortalTabChange,
  onClose,
  communityPosts,
  expandedThreads,
  threadDrafts,
  newPostDraft,
  onNewPostDraftChange,
  onAddCommunityPost,
  onToggleThread,
  onThreadDraftChange,
  onAddThreadReply,
  onCoordinateBasket,
  basketOfferings,
  basketSeeking,
  newBasketDraft,
  onNewBasketDraftChange,
  basketShareMode,
  onBasketShareModeChange,
  onAddBasketListing,
  selectedVillageMamaId,
  onSelectVillageMama,
}) {
  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  return (
    <View style={styles.portalRoot}>
      <View style={styles.portalWarmWash} pointerEvents="none" />
      <View style={styles.portalForeground}>
      <View style={styles.portalHeader}>
        <TouchableOpacity style={styles.portalBackBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={[styles.portalBackText, retroSoft]}>← Back to Me</Text>
        </TouchableOpacity>
        <VillageBrandHeader
          logoUri={villageLogoUri}
          pulseAnim={pulseAnim}
          variant="sanctuary"
          sanctuaryMode
          compact
          notchSafe
        />
      </View>

      <PrivacyBanner />

      <View style={styles.portalTabRow}>
        {PORTAL_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.portalTabBtn, villagePortalTab === tab.id && styles.portalTabBtnActive]}
            onPress={() => onVillagePortalTabChange(tab.id)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.portalTabText,
                retroSoft,
                villagePortalTab === tab.id && styles.portalTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.portalBody}>
        {villagePortalTab === 'constellation' ? (
          <VillageConstellationPanel
            selectedVillageMamaId={selectedVillageMamaId}
            onSelectVillageMama={onSelectVillageMama}
          />
        ) : null}
        {villagePortalTab === 'basket' ? (
          <VillageBasketPanel
            basketOfferings={basketOfferings}
            basketSeeking={basketSeeking}
            newBasketDraft={newBasketDraft}
            onNewBasketDraftChange={onNewBasketDraftChange}
            basketShareMode={basketShareMode}
            onBasketShareModeChange={onBasketShareModeChange}
            onAddBasketListing={onAddBasketListing}
            onCoordinate={onCoordinateBasket}
          />
        ) : null}
        {villagePortalTab === 'boards' ? (
          <CommunityBoardsPanel
            communityPosts={communityPosts}
            expandedThreads={expandedThreads}
            threadDrafts={threadDrafts}
            newPostDraft={newPostDraft}
            onNewPostDraftChange={onNewPostDraftChange}
            onAddCommunityPost={onAddCommunityPost}
            onToggleThread={onToggleThread}
            onThreadDraftChange={onThreadDraftChange}
            onAddThreadReply={onAddThreadReply}
          />
        ) : null}
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portalRoot: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  portalWarmWash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: '#C8D4BC',
    ...Platform.select({
      web: {
        backgroundImage:
          'linear-gradient(180deg, #BAC6BC 0%, #D4C8B8 42%, #E9A889 100%)',
      },
      default: {},
    }),
  },
  portalForeground: {
    flex: 1,
    minHeight: 0,
    zIndex: 1,
  },
  portalHeader: {
    paddingTop: 36,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  portalBackBtn: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    paddingVertical: 4,
  },
  portalBackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5C50',
  },
  portalTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: 'rgba(255, 248, 242, 0.32)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.22)',
  },
  portalTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
  },
  portalTabBtnActive: {
    backgroundColor: 'rgba(233, 168, 137, 0.38)',
    borderColor: 'rgba(163, 83, 56, 0.45)',
  },
  portalTabText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5C6E63',
    textAlign: 'center',
  },
  portalTabTextActive: {
    color: '#2A382E',
    fontWeight: '800',
  },
  portalBody: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  portalScroll: {
    flex: 1,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        minHeight: 0,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      },
      default: {},
    }),
  },
  privacyBanner: {
    backgroundColor: 'rgba(255, 252, 248, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(163, 83, 56, 0.32)',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 4,
  },
  privacyBannerText: {
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '700',
    color: '#3D5246',
    textAlign: 'center',
  },
  constellationScrollContent: {
    paddingBottom: 28,
  },
  constellationViewport: {
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    backgroundColor: '#050B1F',
    marginBottom: 14,
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 14px 28px rgba(10, 12, 30, 0.26), inset 0 2px 14px rgba(255,255,255,0.12)',
      },
      default: {
        shadowColor: '#050B1F',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 7,
      },
    }),
  },
  constellationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  constellationCenterStarWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 64,
    height: 64,
    marginLeft: -32,
    marginTop: -32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  constellationCenterHalo: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 214, 140, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 140, 0.35)',
  },
  constellationCenterStar: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD68C',
    ...Platform.select({
      web: { boxShadow: '0 0 18px rgba(255, 214, 140, 0.8)' },
      default: {},
    }),
  },
  constellationCenterLabel: {
    marginTop: 8,
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
    backgroundColor: 'rgba(255, 214, 140, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  constellationNodeTap: {
    position: 'absolute',
    width: 74,
    alignItems: 'center',
  },
  constellationNodeGlow: {
    position: 'absolute',
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(199, 186, 255, 0.26)',
  },
  constellationNodeGlowSelected: {
    backgroundColor: 'rgba(255, 214, 140, 0.22)',
  },
  constellationNode: {
    marginTop: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EDE7FF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  constellationNodeSelected: {
    backgroundColor: '#FFD68C',
    borderColor: 'rgba(255, 214, 140, 0.9)',
  },
  constellationNodeDistance: {
    marginTop: 6,
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  constellationCardDock: {
    paddingBottom: 6,
  },
  constellationProfileCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.55)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.38)',
  },
  constellationProfileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0E1A12',
  },
  constellationProfileMeta: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    color: '#6B3D2E',
    letterSpacing: 0.2,
  },
  constellationProfileBio: {
    marginTop: 10,
    fontSize: 12,
    color: '#1D2B22',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  constellationHintCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.45)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
  },
  constellationHintTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2A382E',
    textAlign: 'center',
  },
  constellationHintText: {
    marginTop: 8,
    fontSize: 11,
    color: '#3D5246',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  mapPanelScrollContent: {
    paddingBottom: 28,
  },
  mapStage3D: {
    marginBottom: 14,
  },
  mapCanvas: {
    height: 240,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#A8B8A0',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 92, 80, 0.3)',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 14px 28px rgba(45, 62, 52, 0.18), inset 0 2px 12px rgba(255,255,255,0.25)',
      },
      default: {
        shadowColor: '#2A382E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 6,
      },
    }),
  },
  mapBaseTerrain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#C4D2BA',
    ...Platform.select({
      web: {
        backgroundImage:
          'radial-gradient(ellipse at 28% 18%, rgba(200, 220, 195, 0.95) 0%, transparent 52%), radial-gradient(ellipse at 72% 78%, rgba(220, 200, 185, 0.9) 0%, transparent 48%), linear-gradient(165deg, #B0C0A6 0%, #C5D4BC 35%, #D6CCBA 58%, #B8AE9E 100%)',
      },
      default: {},
    }),
  },
  mapHillBack: {
    position: 'absolute',
    top: '8%',
    right: '-5%',
    width: '55%',
    height: '38%',
    borderRadius: 80,
    backgroundColor: 'rgba(143, 168, 132, 0.35)',
  },
  mapHillFront: {
    position: 'absolute',
    bottom: '6%',
    left: '-8%',
    width: '48%',
    height: '32%',
    borderRadius: 60,
    backgroundColor: 'rgba(160, 178, 148, 0.4)',
  },
  mapShadowPlate: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(55, 70, 58, 0.12)',
  },
  mapGridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  mapParkPatch: {
    position: 'absolute',
    borderRadius: 24,
    backgroundColor: 'rgba(143, 176, 132, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(98, 130, 90, 0.25)',
  },
  mapParkNorth: { top: '6%', left: '4%', width: '40%', height: '30%' },
  mapParkSouth: { top: '58%', left: '60%', width: '34%', height: '34%' },
  mapWater: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    width: '24%',
    height: '16%',
    borderRadius: 20,
    backgroundColor: 'rgba(142, 178, 198, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(110, 150, 175, 0.35)',
  },
  mapRoad: {
    position: 'absolute',
    backgroundColor: 'rgba(248, 244, 238, 0.94)',
    borderColor: 'rgba(210, 200, 185, 0.8)',
    borderWidth: 0.5,
  },
  mapRoadMainH: { top: '36%', left: '2%', width: '96%', height: 5, borderRadius: 3 },
  mapRoadLowerH: { top: '72%', left: '8%', width: '84%', height: 4, borderRadius: 2 },
  mapRoadMainV: { top: '8%', left: '30%', width: 4, height: '88%', borderRadius: 2 },
  mapRoadEastV: { top: '12%', left: '74%', width: 3, height: '76%', borderRadius: 2 },
  mapRoadDiagonal: {
    top: '22%',
    left: '18%',
    width: '68%',
    height: 3,
    borderRadius: 2,
    transform: [{ rotate: '24deg' }],
  },
  mapBlockA: {
    position: 'absolute',
    top: '20%',
    left: '48%',
    width: '18%',
    height: '12%',
    borderRadius: 4,
    backgroundColor: 'rgba(228, 220, 208, 0.7)',
    borderWidth: 0.5,
    borderColor: 'rgba(180, 170, 155, 0.5)',
  },
  mapBlockB: {
    position: 'absolute',
    top: '52%',
    left: '34%',
    width: '14%',
    height: '10%',
    borderRadius: 4,
    backgroundColor: 'rgba(232, 225, 212, 0.65)',
  },
  mapBlockC: {
    position: 'absolute',
    top: '78%',
    left: '52%',
    width: '20%',
    height: '11%',
    borderRadius: 4,
    backgroundColor: 'rgba(218, 210, 196, 0.6)',
  },
  mapLegendRow: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 12,
  },
  mapCaption: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2F4036',
    letterSpacing: 0.3,
  },
  mapLegendLotus: { fontSize: 8, fontWeight: '700', color: '#5A4034' },
  lotusPinAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  privacyRing: {
    position: 'absolute',
    borderWidth: 2.5,
  },
  privacyRingGlow: {
    position: 'absolute',
    opacity: 0.65,
  },
  lotusPinBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 252, 248, 0.96)',
    borderWidth: 2,
    borderColor: 'rgba(163, 83, 56, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(90, 50, 35, 0.28)' },
      default: { elevation: 4 },
    }),
  },
  lotusPinEmoji: { fontSize: 20, marginTop: -1 },
  lotusPinLabel: {
    position: 'absolute',
    bottom: 2,
    fontSize: 7,
    fontWeight: '800',
    color: '#3D291F',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  mapYouMarker: {
    position: 'absolute',
    bottom: 20,
    right: 22,
    alignItems: 'center',
    zIndex: 10,
  },
  mapYouRing: {
    position: 'absolute',
    top: -8,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.5,
    backgroundColor: 'rgba(186, 214, 198, 0.3)',
  },
  mapYouBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5C7A68',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapYouLotus: { fontSize: 18 },
  mapYouLabel: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: 'rgba(60, 90, 78, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matchFeedSection: {
    marginTop: 4,
  },
  feedHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A382E',
    marginBottom: 4,
  },
  feedSub: {
    fontSize: 10,
    color: '#5C6E63',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  matchCard: {
    backgroundColor: GLASS.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  matchNickname: { fontSize: 14, fontWeight: '800', color: '#1F2E24' },
  matchMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B3D2E',
    marginTop: 2,
    marginBottom: 6,
  },
  matchBio: { fontSize: 11, color: '#4A5C50', lineHeight: 16, fontStyle: 'italic' },
  icebreakerCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.52)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.4)',
    marginBottom: 14,
  },
  icebreakerTitle: {
    fontSize: 18,
    color: '#3D5246',
    textAlign: 'center',
    marginBottom: 4,
  },
  icebreakerSub: {
    fontSize: 11,
    color: '#5C6E63',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  icebreakerHint: {
    fontSize: 10,
    color: '#5A6E58',
    lineHeight: 15,
    marginBottom: 3,
    fontStyle: 'italic',
  },
  icebreakerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    color: '#152219',
    minHeight: 72,
    textAlignVertical: 'top',
    marginTop: 8,
    marginBottom: 10,
  },
  icebreakerPostBtn: {
    backgroundColor: '#A35338',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  icebreakerPostBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  basketModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  basketModeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
  },
  basketModeBtnActive: {
    backgroundColor: 'rgba(92, 122, 104, 0.22)',
    borderColor: 'rgba(92, 122, 104, 0.55)',
  },
  basketModeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C6E63',
  },
  basketModeBtnTextActive: {
    color: '#2A382E',
    fontWeight: '800',
  },
  basketSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2A382E',
    marginBottom: 8,
    marginTop: 4,
  },
  basketSharedBy: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5C7A68',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  basketCard: {
    backgroundColor: GLASS.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  basketTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A35338',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  basketTitle: { fontSize: 13, fontWeight: '800', color: '#1F2E24', marginBottom: 4 },
  basketDetail: { fontSize: 11, color: '#4A5C50', lineHeight: 16, marginBottom: 10 },
  basketBtn: {
    backgroundColor: '#5C7A68',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  basketBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  postCard: {
    backgroundColor: GLASS.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  postAuthor: { fontSize: 12, fontWeight: '800', color: '#1F2E24' },
  postTime: { fontSize: 9, color: '#6E8578', marginTop: 2, marginBottom: 6 },
  postBody: { fontSize: 12, color: '#3D4F44', lineHeight: 18 },
  threadToggle: { marginTop: 10, alignSelf: 'flex-start' },
  threadToggleText: { fontSize: 11, fontWeight: '700', color: '#6B3D2E' },
  threadBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
  },
  replyRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  replyAuthor: { fontSize: 10, fontWeight: '800', color: '#4A5C50' },
  replyText: { fontSize: 11, color: '#2A382E', marginTop: 2, lineHeight: 16 },
  replyTime: { fontSize: 9, color: '#7A8E82', marginTop: 4, fontStyle: 'italic' },
  replyComposer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  replyInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 11,
    color: '#152219',
    marginRight: 8,
  },
  replySendBtn: {
    backgroundColor: '#A35338',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  replySendText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
});
