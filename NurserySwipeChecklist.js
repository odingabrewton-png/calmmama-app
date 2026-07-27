/**
 * Nursery tab — horizontal swipe cards for Postpartum Survival & Daily Checklist.
 * Awards Crown Points via nurseryChecklistItem on each check-off (daily cap).
 */

import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useVillageRewards } from './VillageRewardsContext';
import { NOTIFICATION_CATEGORIES } from './VillageNotificationToast';

const H_PAD = 16;
const FALLBACK_W = Platform.OS === 'web' ? 320 : Dimensions.get('window').width - H_PAD * 2;

export const DEFAULT_NURSERY_SURVIVAL_TASKS = [
  { id: 'hydrate', text: 'Hydration check — drink a full glass of water 💧', done: false, card: 'nourish' },
  { id: 'nourish', text: 'Nourishment check — eat something warm with two hands 🍲', done: false, card: 'nourish' },
  { id: 'healing', text: 'Healing log — notice one soft body signal today 🌸', done: false, card: 'heal' },
  { id: 'breath', text: 'Gentle breathwork — three slow breaths for your nervous system 🌬️', done: false, card: 'heal' },
  { id: 'rest', text: 'Rest pocket — lie down or close your eyes for 5 minutes 😴', done: false, card: 'rest' },
  { id: 'help', text: 'Village ask — request one small help without apologizing 💗', done: false, card: 'rest' },
];

const SURVIVAL_PAGES = [
  {
    id: 'nourish',
    emoji: '🥗',
    title: 'Hydration & Nourishment',
    hint: 'Fill your cup first — baby borrows from what you restore.',
  },
  {
    id: 'heal',
    emoji: '🌿',
    title: 'Healing & Breath',
    hint: 'Postpartum recovery is sacred work, not a productivity metric.',
  },
  {
    id: 'rest',
    emoji: '🌙',
    title: 'Rest & Village Support',
    hint: 'Soft rest and asking for help are both acts of motherhood.',
  },
];

function SurvivalTaskRow({ task, onToggle }) {
  return (
    <TouchableOpacity style={styles.taskRow} onPress={() => onToggle(task.id)} activeOpacity={0.88}>
      <View style={[styles.check, task.done && styles.checkOn]}>
        {task.done ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <Text style={[styles.taskText, task.done && styles.taskTextDone]}>{task.text}</Text>
    </TouchableOpacity>
  );
}

function NurserySwipeChecklist({
  tasks = DEFAULT_NURSERY_SURVIVAL_TASKS,
  onToggleTask,
}) {
  const { addPoints, notify } = useVillageRewards();
  const carouselRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(FALLBACK_W);
  const [activePage, setActivePage] = useState(0);

  const pages = useMemo(
    () =>
      SURVIVAL_PAGES.map((page) => ({
        ...page,
        tasks: (tasks || []).filter((task) => task.card === page.id),
      })),
    [tasks],
  );

  const handleToggle = useCallback(
    async (taskId) => {
      const task = (tasks || []).find((item) => item.id === taskId);
      const markingDone = Boolean(task) && !task.done;
      onToggleTask?.(taskId);

      if (!markingDone) return;

      const result = await addPoints(5, 'nurseryChecklistItem');
      if (result?.reason === 'daily_cap') {
        notify({
          category: NOTIFICATION_CATEGORIES.nursery,
          title: 'Cloud Nursery',
          message: 'Beautiful consistency — checklist points already bloomed today.',
        });
      }
    },
    [addPoints, notify, onToggleTask, tasks],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>POSTPARTUM SURVIVAL</Text>
      <Text style={styles.title}>Daily Checklist</Text>
      <Text style={styles.sub}>Swipe the soft cards — each check earns Crown Points.</Text>

      <View style={styles.dots}>
        {pages.map((page, index) => (
          <TouchableOpacity
            key={page.id}
            onPress={() => {
              carouselRef.current?.scrollTo({ x: index * pageWidth, animated: true });
              setActivePage(index);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.dot, index === activePage && styles.dotActive]}>
              {index === activePage ? '•' : '◦'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={styles.carouselShell}
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          if (w > 0) setPageWidth((prev) => (Math.abs(prev - w) <= 1 ? prev : w));
        }}
      >
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, pageWidth));
            setActivePage(Math.min(pages.length - 1, Math.max(0, page)));
          }}
          style={{ width: pageWidth }}
        >
          {pages.map((page) => (
            <View key={page.id} style={[styles.card, { width: pageWidth }]}>
              <Text style={styles.cardEmoji}>{page.emoji}</Text>
              <Text style={styles.cardTitle}>{page.title}</Text>
              <Text style={styles.cardHint}>{page.hint}</Text>
              {page.tasks.map((task) => (
                <SurvivalTaskRow key={task.id} task={task} onToggle={handleToggle} />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default memo(NurserySwipeChecklist);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
    width: '100%',
    alignSelf: 'stretch',
  },
  carouselShell: {
    width: '100%',
    alignSelf: 'stretch',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#6B8F78',
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2A382E',
    textAlign: 'center',
  },
  sub: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 18,
    color: '#5A6E58',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dot: {
    fontSize: 18,
    color: 'rgba(90, 110, 88, 0.45)',
  },
  dotActive: {
    color: '#3D5246',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 220,
  },
  cardEmoji: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A382E',
    textAlign: 'center',
  },
  cardHint: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 18,
    color: '#5A6E58',
    textAlign: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(90, 110, 88, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  checkOn: {
    backgroundColor: 'rgba(143, 179, 154, 0.85)',
    borderColor: '#6B8F78',
  },
  checkMark: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#3D5246',
    fontWeight: '600',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#7A8A7E',
  },
});
