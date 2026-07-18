import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { cardRadius, haloStyle, pillRadius, softShadow, useTheme } from './theme';

const checklist = [
  { label: 'Morning walk', done: true },
  { label: 'Apoquel — 16mg with food', done: true },
  { label: '10 min recall practice', done: false },
  { label: 'Evening meal', done: false },
];

export default function App() {
  const { colors } = useTheme();
  const done = checklist.filter((item) => item.done).length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.ground }]}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={[haloStyle, styles.halo, { backgroundColor: colors.mint }]}>
            <Text style={styles.haloGlyph}>🐾</Text>
          </View>
          <View>
            <Text style={[styles.eyebrow, { color: colors.mintDeep }]}>
              GOOD MORNING
            </Text>
            <Text style={[styles.title, { color: colors.ink }]}>Biscuit’s day</Text>
          </View>
        </View>

        <View style={[styles.card, softShadow, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>Today’s care</Text>
            <Text style={[styles.counter, { color: colors.mintDeep }]}>
              {done}/{checklist.length}
            </Text>
          </View>
          {checklist.map((item) => (
            <View key={item.label} style={styles.row}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: item.done ? colors.mint : colors.mintTint },
                ]}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { color: item.done ? colors.inkSoft : colors.ink },
                  item.done && styles.rowLabelDone,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.cta,
            softShadow,
            { backgroundColor: colors.mint, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={[styles.ctaLabel, { color: colors.onMint }]}>
            Ask Pawlie about Biscuit
          </Text>
        </Pressable>

        <Text style={[styles.disclaimer, { color: colors.inkSoft }]}>
          Pawlie is not a veterinarian. For emergencies, contact a vet immediately.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  halo: { width: 72, height: 72 },
  haloGlyph: { fontSize: 30 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  card: { borderRadius: cardRadius, padding: 22, gap: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  counter: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 20, height: 20, borderRadius: pillRadius },
  rowLabel: { fontSize: 14 },
  rowLabelDone: { textDecorationLine: 'line-through' },
  cta: {
    borderRadius: pillRadius,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 48,
  },
  ctaLabel: { fontSize: 15, fontWeight: '800' },
  disclaimer: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
