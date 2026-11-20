import { Pressable, Text, ActivityIndicator, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

export default function PrimaryButton({ title, onPress, loading, disabled, variant = "solid", icon, style }) {
  const off = disabled || loading;
  const textColor = variant === "outline" ? colors.primary : variant === "gold" ? colors.primaryDark : "#ffffff";
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [styles.base, styles[variant], off && styles.off, pressed && styles.pressed, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={20} color={textColor} /> : null}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { padding: spacing.md, borderRadius: radius.md, alignItems: "center", justifyContent: "center", minHeight: 52 },
  solid: { backgroundColor: colors.primary },
  gold: { backgroundColor: colors.gold },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
  off: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  content: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  text: { fontSize: 16, fontWeight: "bold" },
});