import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatRemaining } from './minutes';
import { layout, shadow, useTheme } from './ui/theme';

type Props = {
  label: string;
  // Null before the first minutes are added; the card keeps its size so nothing jumps.
  ringAt: Date | null;
  startedAt: number;
};

export default function TimerDisplay({ label, ringAt, startedAt }: Props) {
  const { colors } = useTheme();
  const [now, setNow] = useState(() => Date.now());
  const [entrance] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fade and slide in once, unless the phone's "reduce motion" setting is on.
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      if (reduceMotion) {
        entrance.setValue(1);
        return;
      }
      Animated.timing(entrance, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [entrance]);

  const remaining = ringAt ? ringAt.getTime() - now : 0;
  const total = ringAt ? ringAt.getTime() - startedAt : 0;
  const left = total > 0 ? Math.min(1, Math.max(0, remaining / total)) : 0;

  return (
    <Animated.View
      accessible
      accessibilityLabel={`${label}, ${formatRemaining(remaining)} left`}
      style={[
        styles.card,
        { backgroundColor: colors.primarySoft },
        shadow(2),
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.onPrimarySoft }]}>
        {label}
      </Text>
      <Text
        maxFontSizeMultiplier={1.4}
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.countdown, { color: colors.onPrimarySoft }]}
      >
        {formatRemaining(remaining)}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: colors.primary, width: `${left * 100}%` },
          ]}
        />
      </View>
      <Text style={[styles.ringTime, { color: colors.onPrimarySoft }]}>
        {ringAt
          ? `Rings at ${ringAt.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}`
          : 'Tap +1, +2, +5 or +10 to start'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.radiusLarge,
    padding: layout.space.l,
    alignItems: 'stretch',
    gap: layout.space.s,
  },
  label: {
    fontSize: layout.font.title,
    fontWeight: '700',
    textAlign: 'center',
  },
  countdown: {
    fontSize: layout.font.hero,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  track: { height: 14, borderRadius: 7, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 7 },
  ringTime: {
    fontSize: layout.font.bodyLarge,
    fontWeight: '600',
    textAlign: 'center',
  },
});
