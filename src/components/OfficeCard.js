import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";
import { effectiveStatus, queueSummary } from "../utils/office";
import { colors, radius, spacing } from "../theme";

export default function OfficeCard({ office, onPress }) {
  const { serving, waiting } = queueSummary(office);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>{office.name}</Text>
        <StatusBadge status={effectiveStatus(office)} />
      </View>
      <Text style={styles.description}>{office.description}</Text>

      <View style={styles.meta}>
        <Ionicons name="location-outline" size={14} color={colors.muted} />
        <Text style={styles.metaText}>{office.location || "Location not set"}</Text>
      </View>
      <View style={styles.meta}>
        <Ionicons name="time-outline" size={14} color={colors.muted} />
        <Text style={styles.metaText}>{office.hours}</Text>
      </View>

      <View style={styles.queueStrip}>
        <View style={styles.queueItem}>
          <Text style={styles.queueLabel}>Now Serving</Text>
          <Text style={styles.queueValue}>{serving || "—"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.queueItem}>
          <Text style={styles.queueLabel}>Waiting</Text>
          <Text style={styles.queueValue}>{waiting}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  pressed: { opacity: 0.7 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs, gap: spacing.sm },
  name: { fontSize: 18, fontWeight: "bold", color: colors.primary, flex: 1 },
  description: { fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  metaText: { fontSize: 13, color: colors.muted, flexShrink: 1 },
  queueStrip: {
    flexDirection: "row", alignItems: "center", marginTop: spacing.md,
    backgroundColor: colors.primaryLight, borderRadius: 10, padding: spacing.sm + 2,
  },
  queueItem: { flex: 1 },
  queueLabel: { fontSize: 11, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  queueValue: { fontSize: 18, fontWeight: "bold", color: colors.primaryDark },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border, marginRight: spacing.md },
});