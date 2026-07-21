import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CosmicNebulaBackdrop from '../CosmicNebulaBackdrop';
import VillageCosmicStarsLayer, { PREGNANT_VILLAGE_COSMIC } from '../VillageCosmicStarsLayer';
import { Image } from 'expo-image';
import VillageHeroImage, { VILLAGE_HERO_ASSETS } from '../VillageHeroImage';
import { VillageStaggerFadeIn } from '../VillageStreamLoader';
import VillageBasketSafetyModal from '../VillageBasketSafetyModal';
import { injectNurseryWebFonts, retroSoft, retroAccent, retroHubTitle } from '../nurseryRetroFonts';
import { VILLAGE_COMMUNITY } from '../designTypography';
import { VILLAGE_IN_OUT_SIN } from '../villageEasing';
import {
  fetchConstellationNodesForUser,
  CONSTELLATION_EMPTY_PLACEHOLDER,
} from '../constellationNetworkEngine';
import {
  VILLAGE_PRIVACY_TITLE,
  VILLAGE_PRIVACY_DESCRIPTION,
  BASKET_SHARE_HINTS,
  BASKET_SHARE_PLACEHOLDER,
  ZONE_TINTS,
  MAP_PRIVACY_ZONES,
  NEARBY_MAMA_PROFILES,
} from '../villageCommunityData';
import FoundingGiftsClaimModal from '../FoundingGiftsClaimModal';
import { FOUNDING_GIFTS_CAP } from '../foundingGiftsConfig';

const BASKET_COSMIC_HERO_HEIGHT = Math.round(
  Math.min(540, Math.max(340, Dimensions.get('window').height * 0.52)),
);

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const GLASS = {
  bg: 'rgba(255, 252, 248, 0.42)',
  border: 'rgba(233, 168, 137, 0.35)',
};

const STAR_MAP = {
  periwinkleTop: '#A5ACC9',
  periwinkleBottom: '#B4B9D6',
  espresso: '#4A4038',
  grayBrown: '#7A6E64',
  cream: '#FFFCF8',
  peach: '#F5D9CE',
  peachActive: '#F0D4C4',
  sagePrivacy: '#BACDB0',
  forest: '#2F4A38',
  goldLine: 'rgba(255, 214, 140, 0.82)',
  goldGlow: 'rgba(255, 214, 140, 0.28)',
};

const BASKET_INK = '#4A4038';
const BASKET_INK_MUTED = '#5C4A3E';
const BASKET_TERRACOTTA = '#8B4A35';

const PORTAL_TABS = [
  { id: 'constellation', label: 'Constellation', emoji: '✨' },
  { id: 'basket', label: 'Village Basket', emoji: '📦' },
];

/** Fixed star-map node layout — stable positions for dotted connectors */
const CONSTELLATION_NODE_LAYOUT = {
  center: { left: 0.5, top: 0.54 },
  nodes: [
    { profileIndex: 0, left: 0.16, top: 0.3 },
    { profileIndex: 1, left: 0.74, top: 0.24 },
    { profileIndex: 2, left: 0.2, top: 0.72 },
    { profileIndex: 3, left: 0.78, top: 0.66 },
  ],
};

function PrivacyBanner({ variant = 'default' }) {
  if (variant === 'starMap') {
    return (
      <View style={styles.starMapPrivacyBanner}>
        <Text style={styles.starMapPrivacyTitle}>{VILLAGE_PRIVACY_TITLE}</Text>
        <Text style={styles.starMapPrivacyBody}>{VILLAGE_PRIVACY_DESCRIPTION}</Text>
      </View>
    );
  }

  return (
    <View style={styles.defaultPrivacyBanner}>
      <Text style={styles.defaultPrivacyTitle}>{VILLAGE_PRIVACY_TITLE}</Text>
      <Text style={styles.defaultPrivacyBody}>{VILLAGE_PRIVACY_DESCRIPTION}</Text>
    </View>
  );
}

function PortalTabBar({ activeTab, onTabChange }) {
  return (
    <View style={styles.portalTabRow}>
      {PORTAL_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const isConstellation = tab.id === 'constellation';
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.portalTabPill,
              isConstellation && isActive && styles.portalTabPillConstellationActive,
              !isConstellation && isActive && styles.portalTabPillCreamActive,
              !isActive && styles.portalTabPillIdle,
            ]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.85}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              style={[
                styles.portalTabPillText,
                isConstellation && isActive && styles.portalTabTextConstellationActive,
                !isConstellation && isActive && styles.portalTabTextCreamActive,
                !isActive && styles.portalTabTextIdle,
                VILLAGE_COMMUNITY,
              ]}
            >
              {tab.emoji} {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ConstellationDottedLine({ x1, y1, x2, y2 }) {
  const dotCount = 10;
  const dots = [];

  for (let i = 0; i <= dotCount; i += 1) {
    const t = i / dotCount;
    dots.push(
      <View
        key={`dot-${x1}-${y1}-${x2}-${y2}-${i}`}
        style={[
          styles.constellationLineDot,
          {
            left: x1 + (x2 - x1) * t - 2,
            top: y1 + (y2 - y1) * t - 2,
          },
        ]}
      />,
    );
  }

  return <>{dots}</>;
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

function VillageConstellationPanel({
  selectedVillageMamaId,
  onSelectVillageMama,
  villageUserState,
  villageUserLatitude,
  villageUserLongitude,
  pregnantCosmic = false,
}) {
  const constellationNodes = useMemo(
    () =>
      fetchConstellationNodesForUser({
        state: villageUserState,
        latitude: villageUserLatitude,
        longitude: villageUserLongitude,
      }).nodes,
    [villageUserState, villageUserLatitude, villageUserLongitude]
  );

  const isConstellationEmpty = constellationNodes.length === 0;
  const layoutSlots = CONSTELLATION_NODE_LAYOUT.nodes.slice(0, constellationNodes.length);

  const phaseAnim = useRef(new Animated.Value(0)).current;
  const nodePulseCount = Math.max(constellationNodes.length, 1);
  const nodePulsesRef = useRef([]);
  if (nodePulsesRef.current.length !== nodePulseCount) {
    nodePulsesRef.current = Array.from({ length: nodePulseCount }, () => new Animated.Value(0.2));
  }
  const nodePulses = nodePulsesRef.current;
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isConstellationEmpty) return undefined;

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
  }, [phaseAnim, nodePulses, isConstellationEmpty]);

  const selectedProfile =
    constellationNodes.find((p) => p.id === selectedVillageMamaId) || null;

  const centerX = mapSize.width * CONSTELLATION_NODE_LAYOUT.center.left;
  const centerY = mapSize.height * CONSTELLATION_NODE_LAYOUT.center.top;

  return (
    <ScrollView
      style={styles.portalScroll}
      contentContainerStyle={styles.constellationScrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[styles.constellationViewport, pregnantCosmic && styles.constellationViewportPregnantPop]}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setMapSize({ width, height });
        }}
      >
        <CosmicNebulaBackdrop phaseAnim={phaseAnim} />
        <View style={styles.constellationCosmicWash} pointerEvents="none" />

        <View style={styles.constellationOverlay} pointerEvents="box-none">
          <View style={styles.constellationLinesLayer} pointerEvents="none">
            {!isConstellationEmpty && mapSize.width > 0
              ? layoutSlots.map((node, index) => {
                  const nx = mapSize.width * node.left;
                  const ny = mapSize.height * node.top;
                  return (
                    <ConstellationDottedLine
                      key={`line-${constellationNodes[index]?.id ?? index}`}
                      x1={centerX}
                      y1={centerY}
                      x2={nx}
                      y2={ny}
                    />
                  );
                })
              : null}
          </View>

          <View style={styles.constellationCenterMoonWrap} pointerEvents="none">
            <View style={styles.constellationMoonHalo} />
            <View style={styles.constellationMoonSparkleRow}>
              <Text style={styles.constellationMoonSparkle}>✨</Text>
              <Text style={styles.constellationMoonIcon}>🌙</Text>
              <Text style={styles.constellationMoonSparkle}>✨</Text>
            </View>
            <Text style={styles.constellationCenterLabel}>You</Text>
          </View>

          {!isConstellationEmpty
            ? layoutSlots.map((node, index) => {
            const profile = constellationNodes[index];
            if (!profile) return null;

            const pulse = nodePulses[index];
            const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] });
            const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.95] });
            const isSelected = selectedVillageMamaId === profile.id;

            return (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.constellationNodeTap,
                  { left: `${node.left * 100}%`, top: `${node.top * 100}%` },
                ]}
                activeOpacity={0.9}
                onPress={() => onSelectVillageMama(profile.id)}
              >
                <Animated.View
                  style={[
                    styles.constellationStarGlow,
                    { opacity: glow, transform: [{ scale }] },
                    isSelected && styles.constellationStarGlowSelected,
                  ]}
                />
                <Animated.View
                  style={[
                    styles.constellationStarIconWrap,
                    { transform: [{ scale }] },
                  ]}
                >
                  <Text
                    style={[
                      styles.constellationStarIcon,
                      isSelected && styles.constellationStarIconSelected,
                    ]}
                  >
                    ⭐
                  </Text>
                </Animated.View>
                <Text style={styles.constellationNodeDistance}>{profile.distance}</Text>
              </TouchableOpacity>
            );
          })
            : null}
        </View>
      </View>

      <View style={[styles.constellationCardDock, pregnantCosmic && styles.constellationCardDockPregnant]}>
        {isConstellationEmpty ? (
          <View style={[styles.constellationEmptyCard, pregnantCosmic && styles.constellationCardPopPregnant]}>
            <Text style={styles.constellationEmptyText}>{CONSTELLATION_EMPTY_PLACEHOLDER}</Text>
          </View>
        ) : selectedProfile ? (
          <View style={[styles.constellationProfileCard, pregnantCosmic && styles.constellationCardPopPregnant]}>
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
          <View style={[styles.constellationHintCard, pregnantCosmic && styles.constellationCardPopPregnant]}>
            <Text style={styles.constellationHintFlourishLeft} pointerEvents="none">
              ❧
            </Text>
            <Text style={styles.constellationHintFlourishRight} pointerEvents="none">
              ❧
            </Text>
            <Text style={styles.constellationHintTitle}>Tap a star mama to meet her</Text>
            <Text style={styles.constellationHintText}>
              Distances are fuzzy on purpose — your exact location stays hidden.
            </Text>
          </View>
        )}
      </View>
      <PrivacyBanner variant="starMap" />
    </ScrollView>
  );
}

function BasketListing({ item, onCoordinate, pregnantCosmic = false }) {
  return (
    <View style={[styles.basketCard, pregnantCosmic && styles.basketCardPregnantCosmic]}>
      <Text style={[styles.basketTag, pregnantCosmic && styles.basketTextOnCosmicMuted]}>{item.tag}</Text>
      {item.sharedBy ? (
        <Text style={[styles.basketSharedBy, pregnantCosmic && styles.basketTextOnCosmicMuted]}>
          Shared by {item.sharedBy}
        </Text>
      ) : null}
      <Text style={[styles.basketTitle, pregnantCosmic && styles.basketTextOnCosmic]}>{item.title}</Text>
      <Text style={[styles.basketDetail, pregnantCosmic && styles.basketTextOnCosmicMuted]}>{item.detail}</Text>
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
  pregnantCosmic = false,
}) {
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);

  const requestShare = () => {
    if (!newBasketDraft?.trim()) return;
    setSafetyModalOpen(true);
  };

  const confirmShare = () => {
    setSafetyModalOpen(false);
    onAddBasketListing();
  };

  return (
    <View style={[styles.basketPanelRoot, pregnantCosmic && styles.basketPanelRootPregnant]}>
      {pregnantCosmic ? <VillageCosmicStarsLayer /> : null}
      <View style={pregnantCosmic ? styles.basketHeroFrame : styles.basketHeroFullBleed}>
        <VillageHeroImage
          source={VILLAGE_HERO_ASSETS.villageLivingroom}
          style={styles.basketWatermarkImage}
          imageOpacity={pregnantCosmic ? 0.42 : 0.35}
          contentFit={pregnantCosmic ? 'contain' : 'cover'}
        />
      </View>

      <ScrollView
        style={[styles.portalScroll, styles.basketScrollLayer]}
        contentContainerStyle={styles.basketScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <VillageStaggerFadeIn staggerMs={44}>
          <View style={[styles.basketShareCard, pregnantCosmic && styles.basketShareCardPregnantCosmic]}>
            <Text style={[styles.basketPanelTitle, pregnantCosmic && styles.basketTextOnCosmic]}>
              Village Basket — Share
            </Text>
            <Text style={[styles.basketPanelSub, pregnantCosmic && styles.basketTextOnCosmicMuted]}>
              Tell nearby mamas what you can offer — or what you gently need
            </Text>
            {BASKET_SHARE_HINTS.map((hint) => (
              <Text key={hint} style={[styles.basketHint, pregnantCosmic && styles.basketTextOnCosmicMuted]}>
                · {hint}
              </Text>
            ))}
            <View style={styles.basketModeRow}>
              <TouchableOpacity
                style={[
                  styles.basketModeBtn,
                  basketShareMode === 'offering' && styles.basketModeBtnOfferingActive,
                  basketShareMode !== 'offering' && styles.basketModeBtnIdle,
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
                  basketShareMode === 'seeking' && styles.basketModeBtnSeekingActive,
                  basketShareMode !== 'seeking' && styles.basketModeBtnIdle,
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
              style={styles.basketPanelInput}
              placeholder={BASKET_SHARE_PLACEHOLDER}
              placeholderTextColor={BASKET_INK_MUTED}
              value={newBasketDraft}
              onChangeText={onNewBasketDraftChange}
              multiline
              onSubmitEditing={requestShare}
            />
            <TouchableOpacity style={styles.basketSharePostBtn} onPress={requestShare} activeOpacity={0.88}>
              <Text style={styles.basketShareBtnText}>Share with the Village Basket</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text style={[styles.basketSectionTitle, pregnantCosmic && styles.basketSectionTitlePregnant]}>
              Offering Items
            </Text>
            {(basketOfferings ?? []).map((item) => (
              <BasketListing key={item.id} item={item} onCoordinate={onCoordinate} pregnantCosmic={pregnantCosmic} />
            ))}
          </View>

          <View>
            <Text style={[styles.basketSectionTitle, pregnantCosmic && styles.basketSectionTitlePregnant]}>
              Seeking Help
            </Text>
            {(basketSeeking ?? []).map((item) => (
              <BasketListing key={item.id} item={item} onCoordinate={onCoordinate} pregnantCosmic={pregnantCosmic} />
            ))}
            <PrivacyBanner />
          </View>
        </VillageStaggerFadeIn>
      </ScrollView>

      <VillageBasketSafetyModal
        visible={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        onConfirm={confirmShare}
      />
    </View>
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
  foundingGiftsClaimCount = 0,
  foundingGiftsAvailable = false,
  foundingGiftsYearlyEligible = false,
  foundingGiftsUserClaimed = false,
  foundingGiftsClaiming = false,
  onClaimFoundingGift,
  onRefreshFoundingGiftsCount,
  villageUserState = 'TX',
  villageUserLatitude,
  villageUserLongitude,
  userJourney = 'postpartum',
}) {
  const [foundingGiftsModalOpen, setFoundingGiftsModalOpen] = useState(false);
  const pregnantCosmic = userJourney === 'pregnant' || userJourney === 'postpartum';

  useEffect(() => {
    injectNurseryWebFonts();
    Image.prefetch(VILLAGE_HERO_ASSETS.villageLivingroom).catch(() => {});
  }, []);

  useEffect(() => {
    if (villagePortalTab === 'boards') {
      onVillagePortalTabChange('constellation');
    }
  }, [villagePortalTab, onVillagePortalTabChange]);

  useEffect(() => {
    onRefreshFoundingGiftsCount?.();
  }, [onRefreshFoundingGiftsCount]);

  useEffect(() => {
    if (!foundingGiftsYearlyEligible) {
      setFoundingGiftsModalOpen(false);
    }
  }, [foundingGiftsYearlyEligible]);

  const showFoundingGiftEntry =
    foundingGiftsYearlyEligible &&
    foundingGiftsAvailable &&
    !foundingGiftsUserClaimed &&
    foundingGiftsClaimCount < FOUNDING_GIFTS_CAP;

  const handleOpenFoundingGifts = () => {
    if (!showFoundingGiftEntry) return;
    setFoundingGiftsModalOpen(true);
  };

  const handleClaimFoundingGift = async () => {
    await onClaimFoundingGift?.();
    setFoundingGiftsModalOpen(false);
  };

  return (
    <View style={[styles.portalRoot, pregnantCosmic && styles.portalRootPregnant]}>
      <LinearGradient
        colors={
          pregnantCosmic
            ? [PREGNANT_VILLAGE_COSMIC.top, PREGNANT_VILLAGE_COSMIC.bottom]
            : [STAR_MAP.periwinkleTop, STAR_MAP.periwinkleBottom]
        }
        style={styles.portalGradientBg}
        pointerEvents="none"
      />
      {pregnantCosmic ? (
        <VillageCosmicStarsLayer />
      ) : (
        <Text style={styles.portalStarAccent} pointerEvents="none">
          ✦
        </Text>
      )}

      <View style={styles.portalForeground}>
      <View style={styles.portalTopStack}>
        <TouchableOpacity style={styles.portalBackBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={[styles.portalBackText, pregnantCosmic && styles.portalBackTextPregnant, retroSoft]}>
            ← Back to Me
          </Text>
        </TouchableOpacity>

        {showFoundingGiftEntry ? (
          <TouchableOpacity
            style={styles.foundingGiftBanner}
            onPress={handleOpenFoundingGifts}
            activeOpacity={0.9}
          >
            <Text style={[styles.foundingGiftBannerTitle, VILLAGE_COMMUNITY]}>
              🎁 Founding Sisters Gift
            </Text>
            <Text style={styles.foundingGiftBannerSub}>
              Free tote, pin & mug bundle · {FOUNDING_GIFTS_CAP - foundingGiftsClaimCount} spots left
            </Text>
          </TouchableOpacity>
        ) : null}

        <PortalTabBar activeTab={villagePortalTab} onTabChange={onVillagePortalTabChange} />
      </View>

      <View style={styles.portalBody}>
        {villagePortalTab === 'constellation' ? (
          <VillageConstellationPanel
            selectedVillageMamaId={selectedVillageMamaId}
            onSelectVillageMama={onSelectVillageMama}
            villageUserState={villageUserState}
            villageUserLatitude={villageUserLatitude}
            villageUserLongitude={villageUserLongitude}
            pregnantCosmic={pregnantCosmic}
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
            pregnantCosmic={pregnantCosmic}
          />
        ) : null}
      </View>
      </View>

      <FoundingGiftsClaimModal
        visible={foundingGiftsModalOpen && showFoundingGiftEntry && foundingGiftsYearlyEligible}
        claimCount={foundingGiftsClaimCount}
        claiming={foundingGiftsClaiming}
        onClose={() => setFoundingGiftsModalOpen(false)}
        onClaim={handleClaimFoundingGift}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  portalRoot: {
    flex: 1,
    minHeight: 0,
    backgroundColor: STAR_MAP.periwinkleTop,
    position: 'relative',
    overflow: 'hidden',
  },
  portalRootPregnant: {
    backgroundColor: PREGNANT_VILLAGE_COSMIC.top,
  },
  portalGradientBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  portalStarAccent: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    fontSize: 30,
    color: 'rgba(255, 255, 255, 0.38)',
    zIndex: 0,
  },
  portalForeground: {
    flex: 1,
    minHeight: 0,
    zIndex: 1,
    position: 'relative',
  },
  portalTabRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 16,
    marginHorizontal: 16,
    gap: 12,
  },
  portalTabPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    minHeight: 48,
  },
  portalTabPillConstellationActive: {
    backgroundColor: STAR_MAP.peach,
    borderColor: 'rgba(212, 168, 150, 0.55)',
    ...Platform.select({
      web: { boxShadow: '0 4px 14px rgba(74, 64, 56, 0.14)' },
      default: {
        shadowColor: '#4A4038',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.14,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  portalTabPillCreamActive: {
    backgroundColor: STAR_MAP.cream,
    borderColor: 'rgba(186, 198, 188, 0.55)',
    ...Platform.select({
      web: { boxShadow: '0 4px 14px rgba(74, 64, 56, 0.12)' },
      default: {
        shadowColor: '#4A4038',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  portalTabPillIdle: {
    backgroundColor: STAR_MAP.cream,
    borderColor: 'rgba(186, 198, 188, 0.45)',
  },
  portalTabPillText: {
    fontSize: 13,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  portalTabTextConstellationActive: {
    color: STAR_MAP.espresso,
    fontWeight: '800',
  },
  portalTabTextCreamActive: {
    color: STAR_MAP.espresso,
    fontWeight: '800',
  },
  portalTabTextIdle: {
    color: STAR_MAP.grayBrown,
    fontWeight: '600',
  },
  starMapPrivacyBanner: {
    backgroundColor: STAR_MAP.sagePrivacy,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    marginTop: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 148, 116, 0.45)',
  },
  starMapPrivacyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: STAR_MAP.forest,
    textAlign: 'center',
    marginBottom: 6,
  },
  starMapPrivacyBody: {
    fontSize: 12,
    fontWeight: '600',
    color: STAR_MAP.forest,
    lineHeight: 18,
    textAlign: 'center',
  },
  defaultPrivacyBanner: {
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 16,
  },
  defaultPrivacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  defaultPrivacyBody: {
    fontSize: 11,
    fontWeight: '500',
    color: '#D1D1D6',
    textAlign: 'center',
    marginTop: 2,
  },
  portalTopStack: {
    position: 'relative',
    zIndex: 2,
    paddingBottom: 8,
    paddingTop: 4,
  },
  portalBackBtn: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    paddingVertical: 4,
  },
  portalBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: STAR_MAP.espresso,
  },
  portalBackTextPregnant: {
    color: 'rgba(255, 252, 248, 0.9)',
  },
  foundingGiftBanner: {
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(255, 252, 248, 0.72)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.42)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  foundingGiftBannerTitle: {
    fontSize: 14,
    color: '#2A382E',
    textAlign: 'center',
  },
  foundingGiftBannerSub: {
    fontSize: 11,
    color: '#6A7A68',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
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
  basketPanelRoot: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E8EDE4',
  },
  basketPanelRootPregnant: {
    backgroundColor: PREGNANT_VILLAGE_COSMIC.top,
  },
  basketHeroFullBleed: {
    ...StyleSheet.absoluteFillObject,
  },
  basketHeroFrame: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    height: BASKET_COSMIC_HERO_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    opacity: 1,
  },
  basketWatermarkImage: {
    opacity: 1,
  },
  basketScrollContent: {
    paddingBottom: 28,
    paddingTop: 4,
  },
  basketScrollLayer: {
    zIndex: 2,
    position: 'relative',
  },
  basketTextOnCosmic: {
    color: 'rgba(255, 252, 248, 0.94)',
  },
  basketTextOnCosmicMuted: {
    color: 'rgba(255, 252, 248, 0.78)',
  },
  basketShareCard: {
    backgroundColor: 'rgba(235, 240, 230, 0.55)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        boxShadow: '0 8px 24px rgba(74, 64, 56, 0.14)',
      },
      default: {
        shadowColor: '#4A4038',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
        elevation: 5,
      },
    }),
  },
  basketShareCardPregnantCosmic: {
    backgroundColor: 'rgba(255, 252, 248, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 12px 32px rgba(10, 8, 24, 0.35)',
      },
      default: {
        shadowColor: '#0A0818',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
        elevation: 6,
      },
    }),
  },
  constellationScrollContent: {
    paddingBottom: 28,
    gap: 14,
  },
  constellationViewport: {
    height: 320,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(45, 35, 82, 0.72)',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 16px 36px rgba(30, 22, 58, 0.28), inset 0 2px 16px rgba(255,255,255,0.1)',
      },
      default: {
        shadowColor: '#1E163A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.24,
        shadowRadius: 18,
        elevation: 8,
      },
    }),
  },
  constellationViewportPregnantPop: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.34)',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 44px rgba(8, 6, 20, 0.45), inset 0 2px 18px rgba(255,255,255,0.12)',
      },
      default: {
        shadowColor: '#080614',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.38,
        shadowRadius: 22,
        elevation: 10,
      },
    }),
  },
  constellationCosmicWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(58, 42, 108, 0.45)',
    zIndex: 1,
  },
  constellationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  constellationLinesLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  constellationLineDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: STAR_MAP.goldLine,
  },
  constellationCenterMoonWrap: {
    position: 'absolute',
    left: '50%',
    top: '54%',
    width: 96,
    marginLeft: -48,
    marginTop: -48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  constellationMoonHalo: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: STAR_MAP.goldGlow,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 140, 0.45)',
  },
  constellationMoonSparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  constellationMoonSparkle: {
    fontSize: 14,
    opacity: 0.9,
  },
  constellationMoonIcon: {
    fontSize: 34,
  },
  constellationCenterLabel: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
    color: STAR_MAP.espresso,
    backgroundColor: 'rgba(255, 252, 248, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  constellationNodeTap: {
    position: 'absolute',
    width: 88,
    marginLeft: -44,
    marginTop: -28,
    alignItems: 'center',
    zIndex: 5,
  },
  constellationStarGlow: {
    position: 'absolute',
    top: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: STAR_MAP.goldGlow,
  },
  constellationStarGlowSelected: {
    backgroundColor: 'rgba(255, 214, 140, 0.42)',
  },
  constellationStarIcon: {
    fontSize: 28,
    textShadowColor: 'rgba(255, 214, 140, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  constellationStarIconWrap: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  constellationStarIconSelected: {
    fontSize: 32,
  },
  constellationNodeDistance: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    backgroundColor: 'rgba(20, 16, 40, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  constellationCardDock: {
    paddingBottom: 4,
  },
  constellationCardDockPregnant: {
    paddingTop: 2,
  },
  constellationCardPopPregnant: {
    ...Platform.select({
      web: {
        boxShadow: '0 14px 36px rgba(8, 6, 20, 0.42)',
      },
      default: {
        shadowColor: '#080614',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.32,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
  },
  constellationProfileCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.92)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
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
    backgroundColor: STAR_MAP.cream,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
    position: 'relative',
    overflow: 'hidden',
  },
  constellationHintFlourishLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -14,
    fontSize: 22,
    color: 'rgba(186, 175, 155, 0.55)',
    transform: [{ scaleX: -1 }],
  },
  constellationHintFlourishRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -14,
    fontSize: 22,
    color: 'rgba(186, 175, 155, 0.55)',
  },
  constellationHintTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: STAR_MAP.espresso,
    textAlign: 'center',
  },
  constellationHintText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: STAR_MAP.grayBrown,
    textAlign: 'center',
    lineHeight: 21,
  },
  constellationEmptyCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.72)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(74, 64, 56, 0.1)' },
      default: {
        shadowColor: '#4A4038',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
  constellationEmptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: STAR_MAP.espresso,
    textAlign: 'center',
    fontWeight: '600',
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
  basketPanelTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BASKET_INK,
    textAlign: 'center',
    marginBottom: 6,
  },
  basketPanelSub: {
    fontSize: 16,
    fontWeight: '600',
    color: BASKET_INK,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  basketHint: {
    fontSize: 15,
    fontWeight: '600',
    color: BASKET_INK,
    lineHeight: 22,
    marginBottom: 4,
  },
  basketPanelInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: BASKET_INK,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: 8,
    marginBottom: 10,
  },
  basketSharePostBtn: {
    backgroundColor: BASKET_TERRACOTTA,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 40, 28, 0.35)',
    ...Platform.select({
      web: { boxShadow: '0 4px 14px rgba(74, 40, 28, 0.28)' },
      default: {
        shadowColor: '#4A281C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  basketShareBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  boardsPanelSub: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D5246',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  icebreakerHint: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D5246',
    lineHeight: 22,
    marginBottom: 4,
  },
  icebreakerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
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
    fontSize: 18,
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
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  basketModeBtnIdle: {
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  basketModeBtnOfferingActive: {
    backgroundColor: 'rgba(245, 217, 206, 0.72)',
    borderColor: 'rgba(235, 200, 185, 0.75)',
  },
  basketModeBtnSeekingActive: {
    backgroundColor: 'rgba(186, 205, 176, 0.72)',
    borderColor: 'rgba(168, 187, 160, 0.75)',
  },
  basketModeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: BASKET_INK_MUTED,
  },
  basketModeBtnTextActive: {
    color: BASKET_INK,
    fontWeight: '800',
  },
  basketSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BASKET_INK,
    marginBottom: 10,
    marginTop: 4,
  },
  basketSectionTitlePregnant: {
    color: 'rgba(255, 252, 248, 0.92)',
  },
  basketSharedBy: {
    fontSize: 9,
    fontWeight: '700',
    color: BASKET_INK_MUTED,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  basketCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.78)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      },
      default: {
        shadowColor: '#4A4038',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  basketCardPregnantCosmic: {
    backgroundColor: 'rgba(255, 252, 248, 0.24)',
    borderColor: 'rgba(255, 255, 255, 0.26)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 10px 28px rgba(8, 6, 20, 0.32)',
      },
      default: {
        shadowColor: '#0A0818',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.24,
        shadowRadius: 14,
        elevation: 5,
      },
    }),
  },
  basketTag: {
    fontSize: 9,
    fontWeight: '800',
    color: BASKET_TERRACOTTA,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  basketTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BASKET_INK,
    marginBottom: 6,
  },
  basketDetail: {
    fontSize: 15,
    fontWeight: '600',
    color: BASKET_INK,
    lineHeight: 22,
    marginBottom: 10,
  },
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
  postTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6E8578',
    marginTop: 4,
    marginBottom: 8,
  },
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
