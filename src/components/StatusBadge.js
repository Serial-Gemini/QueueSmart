import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme";

const statusColor = {
  Open: colors.open,
  "On Break": colors.break,
  Closed: colors.closed,
  Paused: colors.paused,
};

export default function StatusBadge({ status }) {
  const color = statusColor[status] || colors.muted;
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  text: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
});