import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";
import { colors, radius, spacing } from "../theme";

export default function ActiveTicketCard({ item, onPress }) {
  const meta =
    item.status === "waiting"
      ? `${item.ahead} ahead · Now serving ${item.nowServing || "—"}`
      : item.isFinal ? "Tap to dismiss" : "Proceed to the counter";
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Your queue number</Text>
        <Text style={styles.number}>{item.number}</Text>
        <Text style={styles.office} numberOfLines={1}>{item.officeName}</Text>
      </View>
      <View style={styles.right}>
        <StatusBadge status={item.label} />
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.goldLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.primaryDark, borderRadius: radius.md, padding: spacing.md,
    borderLeftWidth: 4, borderLeftColor: colors.gold, marginBottom: spacing.md,
  },
  label: { fontSize: 11, color: colors.goldLight, textTransform: "uppercase", letterSpacing: 0.5 },
  number: { fontSize: 28, fontWeight: "bold", color: "#ffffff" },
  office: { fontSize: 13, color: "#d7eadf" },
  right: { alignItems: "flex-end", gap: 6, maxWidth: 150 },
  meta: { fontSize: 11, color: "#d7eadf", textAlign: "right" },
});