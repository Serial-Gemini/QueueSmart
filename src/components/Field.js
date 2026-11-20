import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

export default function Field({ label, secureTextEntry, ...props }) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={hidden}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: "bold", color: colors.text, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.text },
});