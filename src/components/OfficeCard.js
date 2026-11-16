import { Pressable, View, Text, StyleSheet } from "react-native";
import StatusBadge from "./StatusBadge";
import { colors, radius, spacing } from "../theme";

export default function OfficeCard({ office, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Text style={styles.name}>{office.name}</Text>
        <StatusBadge status={office.status} />
      </View>
      <Text style={styles.description}>{office.description}</Text>
      <Text style={styles.hours}>{office.hours}</Text>
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
  },
  pressed: { opacity: 0.7 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  name: { fontSize: 18, fontWeight: "bold", color: colors.primary },
  description: { fontSize: 14, color: colors.text, marginBottom: spacing.xs },
  hours: { fontSize: 13, color: colors.muted },
});
