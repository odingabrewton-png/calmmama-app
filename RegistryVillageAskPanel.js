import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import {
  subscribeVillagePolls,
  submitVillagePollQuestion,
  getPreferredRegistryPlatform,
  setPreferredRegistryPlatform,
  ensureTempPreviewRegistryPolls,
  TEMP_REGISTRY_POLL_PREVIEW,
} from './villagePollBridge';
import { mamaCardScriptTitle } from './nurseryRetroFonts';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const REGISTRY_SITES = [
  { id: 'amazon', shortLabel: 'Amazon', emoji: '📦', url: 'https://www.amazon.com/baby-reg/homepage' },
  { id: 'target', shortLabel: 'Target', emoji: '🎯', url: 'https://www.target.com/gift-registry/baby-registry' },
  { id: 'babylist', shortLabel: 'Babylist', emoji: '🍼', url: 'https://www.babylist.com/' },
];

function AdviceRow({ poll, preferredSiteId, onOpenSite }) {
  if (!poll?.id) return null;

  const isOpen = poll?.status === 'open';
  const needed = !isOpen && (poll?.neededPct ?? 0) >= (poll?.skipPct ?? 0);
  const tips = Array.isArray(poll?.tips) ? poll.tips.filter((tip) => tip?.text) : [];

  return (
    <View style={[styles.adviceCard, needed && styles.adviceCardNeeded, !isOpen && !needed && styles.adviceCardSkip]}>
      <Text style={[styles.adviceItem, SANS]}>{poll?.item ?? 'Registry item'}</Text>
      {isOpen ? (
        <Text style={[styles.adviceStatus, SANS]}>Waiting on postpartum mamas (1 year+)…</Text>
      ) : (
        <>
          <Text style={[styles.adviceVerdict, SANS]}>
            {needed ? '✨ May be needed — village says add it' : '🌙 May not be needed — village says skip'}
          </Text>
          <Text style={[styles.adviceSplit, SANS]}>
            Needed {poll.neededPct}% · Skip {poll.skipPct}%
          </Text>
          {tips.length > 0 ? (
            <View style={styles.tipBlock}>
              <Text style={[styles.tipLabel, SANS]}>Mama notes</Text>
              {tips.slice(0, 3).map((tip) => (
                <Text key={tip.id || tip.text} style={[styles.adviceTip, SANS]}>
                  &ldquo;{tip.text}&rdquo;
                </Text>
              ))}
            </View>
          ) : (
            <Text style={[styles.adviceStatus, SANS]}>No written explanation this time.</Text>
          )}
          {needed ? (
            <View style={styles.addRow}>
              <Text style={[styles.addPrompt, SANS]}>
                {preferredSiteId
                  ? 'Add it to your registry:'
                  : 'Which registry do you use? Tap to add:'}
              </Text>
              <View style={styles.siteRow}>
                {REGISTRY_SITES.filter((site) => site?.id).map((site) => {
                  const preferred = preferredSiteId === site?.id;
                  return (
                    <TouchableOpacity
                      key={site?.id}
                      style={[styles.siteChip, preferred && styles.siteChipPreferred]}
                      onPress={() => onOpenSite(site)}
                      activeOpacity={0.88}
                      accessibilityRole="link"
                      accessibilityLabel={`Add to ${site?.shortLabel ?? 'registry'}`}
                    >
                      <Text style={styles.siteEmoji}>{site?.emoji ?? '✨'}</Text>
                      <Text style={[styles.siteLabel, SANS]}>{site?.shortLabel ?? 'Registry'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

export default function RegistryVillageAskPanel() {
  const [draft, setDraft] = useState('');
  const [openPolls, setOpenPolls] = useState([]);
  const [resolvedPolls, setResolvedPolls] = useState([]);
  const [duplicateFlash, setDuplicateFlash] = useState(null);
  const [preferredSiteId, setPreferredSiteId] = useState(() => getPreferredRegistryPlatform());

  useEffect(() => {
    if (TEMP_REGISTRY_POLL_PREVIEW) {
      ensureTempPreviewRegistryPolls();
    }
    return subscribeVillagePolls((snapshot) => {
      setOpenPolls(snapshot.open);
      setResolvedPolls(snapshot.resolved);
    });
  }, []);

  const handleAsk = useCallback(() => {
    const result = submitVillagePollQuestion(draft);
    if (!result?.ok) return;
    setDraft('');
    if (result.type === 'auto_resolved' || result.type === 'already_open' || result.type === 'duplicate') {
      setDuplicateFlash({
        ...(result.verdict || {}),
        item: result.poll?.item || result.verdict?.itemDisplay,
      });
      return;
    }
    setDuplicateFlash(null);
  }, [draft]);

  const handleOpenSite = useCallback((site) => {
    if (!site?.id || !site?.url) return;
    setPreferredRegistryPlatform(site.id);
    setPreferredSiteId(site.id);
    Linking.openURL(site.url).catch(() => {});
  }, []);

  const neededList = (resolvedPolls || []).filter(
    (poll) => poll?.id && (poll.neededPct ?? 0) >= (poll.skipPct ?? 0),
  );
  const skipList = (resolvedPolls || []).filter(
    (poll) => poll?.id && (poll.neededPct ?? 0) < (poll.skipPct ?? 0),
  );
  const waitingList = (openPolls || []).filter((poll) => poll?.id);

  return (
    <View style={styles.root}>
      <Text style={[styles.title, mamaCardScriptTitle]}>Ask a postpartum mama</Text>
      <Text style={[styles.hint, SANS]}>
        {TEMP_REGISTRY_POLL_PREVIEW
          ? 'TEMP preview — sample village advice below (needed vs skip + mama notes).'
          : 'Not sure if it belongs on your registry? Ask the village. Past answers show up here with notes.'}
      </Text>
      <TextInput
        style={[styles.input, SANS]}
        placeholder="e.g. Wipe warmer, bottle warmer, night light…"
        placeholderTextColor="rgba(44, 44, 44, 0.45)"
        value={draft}
        onChangeText={setDraft}
        returnKeyType="done"
        maxLength={64}
        {...Platform.select({ web: { outlineStyle: 'none' }, default: {} })}
      />
      <TouchableOpacity
        style={[styles.askBtn, !draft.trim() && styles.askBtnDisabled]}
        onPress={handleAsk}
        disabled={!draft.trim()}
        activeOpacity={0.9}
      >
        <Text style={[styles.askBtnText, SANS]}>Ask the village</Text>
      </TouchableOpacity>

      {duplicateFlash ? (
        <View style={styles.flashCard}>
          <Text style={[styles.flashBody, SANS]}>{duplicateFlash.message}</Text>
          <TouchableOpacity onPress={() => setDuplicateFlash(null)} activeOpacity={0.85}>
            <Text style={[styles.flashDismiss, SANS]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {neededList.length > 0 ? (
        <View style={styles.listBlock}>
          <Text style={[styles.listEyebrow, SANS]}>MAY BE NEEDED</Text>
          {neededList.map((poll) => (
            <AdviceRow
              key={poll.id}
              poll={poll}
              preferredSiteId={preferredSiteId}
              onOpenSite={handleOpenSite}
            />
          ))}
        </View>
      ) : null}

      {skipList.length > 0 ? (
        <View style={styles.listBlock}>
          <Text style={[styles.listEyebrow, SANS]}>MAY NOT BE NEEDED</Text>
          {skipList.map((poll) => (
            <AdviceRow
              key={poll.id}
              poll={poll}
              preferredSiteId={preferredSiteId}
              onOpenSite={handleOpenSite}
            />
          ))}
        </View>
      ) : null}

      {waitingList.length > 0 ? (
        <View style={styles.listBlock}>
          <Text style={[styles.listEyebrow, SANS]}>STILL WAITING ON MAMAS</Text>
          {waitingList.map((poll) => (
            <AdviceRow
              key={poll.id}
              poll={poll}
              preferredSiteId={preferredSiteId}
              onOpenSite={handleOpenSite}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(92, 122, 104, 0.28)',
  },
  title: {
    fontSize: 20,
    color: '#2F4638',
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(47, 70, 56, 0.72)',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2C2C2C',
    marginBottom: 10,
  },
  askBtn: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(92, 122, 104, 0.92)',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  askBtnDisabled: {
    opacity: 0.45,
  },
  askBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FDFBF7',
  },
  flashCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(253, 251, 247, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.2)',
  },
  flashBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#2F4638',
    marginBottom: 8,
  },
  flashDismiss: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(47, 70, 56, 0.55)',
  },
  listBlock: {
    marginTop: 16,
    gap: 10,
  },
  listEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: 'rgba(47, 70, 56, 0.55)',
    marginBottom: 2,
  },
  adviceCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.18)',
  },
  adviceCardNeeded: {
    borderColor: 'rgba(92, 122, 104, 0.42)',
    backgroundColor: 'rgba(232, 242, 234, 0.75)',
  },
  adviceCardSkip: {
    borderColor: 'rgba(180, 160, 150, 0.35)',
    backgroundColor: 'rgba(250, 244, 240, 0.7)',
  },
  adviceItem: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  adviceStatus: {
    fontSize: 12,
    color: 'rgba(47, 70, 56, 0.65)',
    fontStyle: 'italic',
  },
  adviceVerdict: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F4638',
    marginBottom: 2,
  },
  adviceSplit: {
    fontSize: 11,
    color: 'rgba(47, 70, 56, 0.55)',
    marginBottom: 6,
  },
  tipBlock: {
    gap: 6,
    marginBottom: 8,
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: 'rgba(47, 70, 56, 0.5)',
    textTransform: 'uppercase',
  },
  adviceTip: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(44, 44, 44, 0.78)',
    fontStyle: 'italic',
  },
  addRow: {
    marginTop: 4,
  },
  addPrompt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F4638',
    marginBottom: 8,
  },
  siteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  siteChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.2)',
  },
  siteChipPreferred: {
    borderColor: 'rgba(92, 122, 104, 0.65)',
    backgroundColor: 'rgba(92, 122, 104, 0.12)',
  },
  siteEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  siteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F4638',
  },
});
