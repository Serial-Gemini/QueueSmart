import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

export default function Notice({ type = "error", children }) {
  if (!children) return null;
  const ok = type === "success";
  return (
    <View style={[styles.box, ok ? styles.ok : styles.err]}>
      <Text style={[styles.text, { color: ok ? colors.primaryDark : colors.closed }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: spacing.sm + 4, borderRadius: 10, marginBottom: spacing.md },
  ok: { backgroundColor: colors.primaryLight },
  err: { backgroundColor: "#fee2e2" },
  text: { fontSize: 13 },
});