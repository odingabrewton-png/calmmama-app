import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MIDNIGHT } from './midnightLoungeTheme';
import {
  getAppVersionLabel,
  getVercelEnvironmentLabel,
} from './adminAccess';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

function EnvBadge({ label }) {
  const tone =
    label === 'production' ? styles.envProd : label === 'preview' ? styles.envPreview : styles.envDev;
  return (
    <View style={[styles.envBadge, tone]}>
      <Text style={[styles.envBadgeText, SANS]}>{label}</Text>
    </View>
  );
}

function ActionButton({ label, busyKey, busy, onPress, tone = 'lavender' }) {
  const isBusy = busy === busyKey;
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        tone === 'terracotta' && styles.actionBtnTerracotta,
        tone === 'sage' && styles.actionBtnSage,
      ]}
      activeOpacity={0.88}
      disabled={Boolean(busy)}
      onPress={onPress}
    >
      {isBusy ? (
        <ActivityIndicator color={tone === 'terracotta' ? '#FFF8F5' : '#2A2540'} />
      ) : (
        <Text
          style={[
            styles.actionBtnText,
            tone === 'terracotta' && styles.actionBtnTextOnDark,
            SANS,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/**
 * Hidden admin tools — only mount when isAdmin === true.
 */
export default function AdminPortalPanel({
  accountEmail,
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
}) {
  const [busy, setBusy] = useState(null);
  const [status, setStatus] = useState('');
  const [grantAmount, setGrantAmount] = useState('500');
  const [manualRecipientEmail, setManualRecipientEmail] = useState('');
  const [manualGrantAmount, setManualGrantAmount] = useState('100');
  const [manualGrantNote, setManualGrantNote] = useState('');
  const version = useMemo(() => getAppVersionLabel(), []);
  const envLabel = useMemo(() => getVercelEnvironmentLabel(), []);

  const runAction = async (key, fn) => {
    if (busy) return;
    setBusy(key);
    setStatus('');
    try {
      const result = await fn?.();
      if (result?.ok === false) {
        const hint = result.hint ? ` — ${result.hint}` : '';
        setStatus(`${result.error || 'Action failed'}${hint}`);
      } else {
        setStatus(result?.message || 'Done');
      }
    } catch (err) {
      setStatus(err?.message || 'Unexpected error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.wrap} accessibilityLabel="Admin Portal">
      <Text style={[styles.eyebrow, SANS]}>RESTRICTED</Text>
      <Text style={[styles.title, SANS]}>Admin Portal</Text>
      <Text style={[styles.copy, SANS]}>
        Sandbox mode — test actions stay on this device / your admin inbox and are excluded from
        public analytics.
      </Text>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, SANS]}>App v{version}</Text>
        <EnvBadge label={envLabel} />
      </View>

      <Text style={[styles.fieldLabel, SANS]}>Admin account email</Text>
      <TextInput
        style={[styles.input, SANS]}
        value={accountEmail || ''}
        onChangeText={onAccountEmailChange}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="odingabrewton@gmail.com"
        placeholderTextColor={MIDNIGHT.textMuted}
      />

      <Text style={[styles.sectionLabel, SANS]}>Email smoke tests</Text>
      <ActionButton
        label="Send Test Newsletter Email"
        busyKey="newsletter"
        busy={busy}
        onPress={() => runAction('newsletter', () => onSendTestNewsletter?.())}
      />
      <ActionButton
        label="Send Test Welcome Email"
        busyKey="welcome"
        busy={busy}
        onPress={() => runAction('welcome', () => onSendTestWelcomeEmail?.())}
        tone="sage"
      />

      <Text style={[styles.sectionLabel, SANS]}>In-app smoke tests</Text>
      <ActionButton
        label="Fire Test Village Notification"
        busyKey="notify"
        busy={busy}
        onPress={() => runAction('notify', () => onFireTestNotification?.())}
      />
      <ActionButton
        label="Open Sanctuary Journal (newsletter CTA)"
        busyKey="journal"
        busy={busy}
        onPress={() => runAction('journal', () => onOpenSanctuaryJournalTest?.())}
      />
      <ActionButton
        label="Preview Premium Welcome Modal"
        busyKey="premium"
        busy={busy}
        onPress={() => runAction('premium', () => onPreviewPremiumWelcome?.())}
      />
      <ActionButton
        label="Open Village Constellation"
        busyKey="constellation"
        busy={busy}
        onPress={() => runAction('constellation', () => onOpenVillageConstellation?.())}
      />
      <ActionButton
        label="Open Village Basket"
        busyKey="basket"
        busy={busy}
        onPress={() => runAction('basket', () => onOpenVillageBasket?.())}
      />
      <ActionButton
        label="Refresh PWA Cache"
        busyKey="pwa"
        busy={busy}
        onPress={() => runAction('pwa', () => onRefreshPwaCache?.())}
        tone="terracotta"
      />

      <Text style={[styles.sectionLabel, SANS]}>Manual points recovery</Text>
      <Text style={[styles.copy, styles.sectionCopy, SANS]}>
        Queue Crown Points for a mama by email when a glitch kept her from earning them. She
        receives them the next time she opens the app with that email saved.
      </Text>
      <Text style={[styles.fieldLabel, SANS]}>Mama email</Text>
      <TextInput
        style={[styles.input, SANS]}
        value={manualRecipientEmail}
        onChangeText={setManualRecipientEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="mama@email.com"
        placeholderTextColor={MIDNIGHT.textMuted}
      />
      <Text style={[styles.fieldLabel, SANS]}>Points to grant</Text>
      <View style={styles.quickGrantRow}>
        {['25', '50', '100', '250', '500'].map((preset) => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.quickGrantChip,
              manualGrantAmount === preset && styles.quickGrantChipActive,
            ]}
            onPress={() => setManualGrantAmount(preset)}
            activeOpacity={0.88}
          >
            <Text style={[styles.quickGrantChipText, SANS]}>{preset}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={[styles.input, SANS]}
        value={manualGrantAmount}
        onChangeText={setManualGrantAmount}
        keyboardType="number-pad"
        placeholder="100"
        placeholderTextColor={MIDNIGHT.textMuted}
      />
      <Text style={[styles.fieldLabel, SANS]}>Note (optional)</Text>
      <TextInput
        style={[styles.input, styles.noteInput, SANS]}
        value={manualGrantNote}
        onChangeText={setManualGrantNote}
        placeholder="Missed poll points after feed glitch"
        placeholderTextColor={MIDNIGHT.textMuted}
        multiline
      />
      <ActionButton
        label="Grant manual points to mama"
        busyKey="manual-grant"
        busy={busy}
        tone="sage"
        onPress={() =>
          runAction('manual-grant', () =>
            onGrantManualPoints?.({
              recipientEmail: manualRecipientEmail,
              amount: Math.max(0, parseInt(manualGrantAmount, 10) || 0),
              note: manualGrantNote,
            }),
          )
        }
      />

      <Text style={[styles.fieldLabel, SANS]}>Device test points (this phone only)</Text>
      <Text style={[styles.pointsHint, SANS]}>
        Current balance: {Number(currentPoints || 0).toLocaleString()} pts
      </Text>
      <View style={styles.pointsRow}>
        <TextInput
          style={[styles.input, styles.pointsInput, SANS]}
          value={grantAmount}
          onChangeText={setGrantAmount}
          keyboardType="number-pad"
          placeholder="500"
          placeholderTextColor={MIDNIGHT.textMuted}
        />
        <TouchableOpacity
          style={[styles.actionBtn, styles.pointsBtn]}
          activeOpacity={0.88}
          disabled={Boolean(busy)}
          onPress={() =>
            runAction('grant', () =>
              onGrantTestPoints?.(Math.max(0, parseInt(grantAmount, 10) || 0)),
            )
          }
        >
          {busy === 'grant' ? (
            <ActivityIndicator color="#2A2540" />
          ) : (
            <Text style={[styles.actionBtnText, SANS]}>Grant</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.resetBtn]}
          activeOpacity={0.88}
          disabled={Boolean(busy)}
          onPress={() => runAction('reset', () => onResetTestPoints?.())}
        >
          {busy === 'reset' ? (
            <ActivityIndicator color="#FFF8F5" />
          ) : (
            <Text style={[styles.actionBtnText, styles.resetBtnText, SANS]}>Reset</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.vipRow}>
        <View style={styles.vipCopy}>
          <Text style={[styles.fieldLabel, styles.vipLabel, SANS]}>Toggle VIP Lifetime Access</Text>
          <Text style={[styles.pointsHint, SANS]}>
            {isVipLifetime ? 'VIP lifetime ON (device sandbox)' : 'VIP lifetime OFF'}
          </Text>
        </View>
        <Switch
          value={Boolean(isVipLifetime)}
          onValueChange={(next) =>
            runAction('vip', () => onToggleVipLifetime?.(next))
          }
          trackColor={{ false: 'rgba(120,110,140,0.35)', true: 'rgba(196,168,216,0.9)' }}
          thumbColor={isVipLifetime ? '#F8F1FF' : '#F5F2FA'}
          disabled={Boolean(busy)}
        />
      </View>

      {status ? <Text style={[styles.status, SANS]}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 216, 0.45)',
    backgroundColor: 'rgba(42, 37, 64, 0.55)',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: MIDNIGHT.lavenderMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: MIDNIGHT.textPrimary,
    marginBottom: 6,
  },
  copy: {
    fontSize: 13,
    lineHeight: 19,
    color: MIDNIGHT.textMuted,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: MIDNIGHT.textMuted,
  },
  envBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  envProd: { backgroundColor: 'rgba(90, 160, 120, 0.35)' },
  envPreview: { backgroundColor: 'rgba(196, 168, 216, 0.4)' },
  envDev: { backgroundColor: 'rgba(196, 165, 116, 0.35)' },
  envBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8F1FF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: MIDNIGHT.lavenderMuted,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionCopy: {
    marginTop: -2,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: MIDNIGHT.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: MIDNIGHT.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: MIDNIGHT.textPrimary,
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: MIDNIGHT.lavender,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 46,
    justifyContent: 'center',
  },
  actionBtnSage: {
    backgroundColor: 'rgba(186, 205, 176, 0.92)',
  },
  actionBtnTerracotta: {
    backgroundColor: '#8B4A35',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A2540',
  },
  actionBtnTextOnDark: {
    color: '#FFF8F5',
  },
  pointsHint: {
    fontSize: 12,
    color: MIDNIGHT.textMuted,
    marginBottom: 8,
    marginTop: -4,
  },
  quickGrantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  quickGrantChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    backgroundColor: MIDNIGHT.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickGrantChipActive: {
    borderColor: MIDNIGHT.lavender,
    backgroundColor: 'rgba(196, 168, 216, 0.35)',
  },
  quickGrantChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: MIDNIGHT.textPrimary,
  },
  noteInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  pointsInput: {
    flex: 1,
    marginBottom: 0,
  },
  pointsBtn: {
    flexBasis: 76,
    marginBottom: 0,
    paddingHorizontal: 8,
  },
  resetBtn: {
    flexBasis: 76,
    marginBottom: 0,
    backgroundColor: '#8B4A35',
  },
  resetBtnText: {
    color: '#FFF8F5',
  },
  vipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
    marginTop: 6,
  },
  vipCopy: {
    flex: 1,
  },
  vipLabel: {
    marginBottom: 4,
  },
  status: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: MIDNIGHT.lavender,
  },
});
