import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";

export default function AuthLayout({ title, subtitle, children }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primary }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.logo}>
            <Ionicons name="ticket" size={28} color={colors.primaryDark} />
          </View>
          <Text style={styles.brand}>QueueSmart</Text>
          <Text style={styles.campus}>Cavite State University · Main Campus</Text>
          <View style={styles.goldBar} />
        </View>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingBottom: spacing.lg + 8 },
  logo: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gold,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.sm,
  },
  brand: { fontSize: 28, fontWeight: "bold", color: "#ffffff" },
  campus: { fontSize: 13, color: colors.goldLight, marginTop: 2 },
  goldBar: { width: 48, height: 3, borderRadius: 2, backgroundColor: colors.gold, marginTop: spacing.md },
  sheet: {
    flex: 1, backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.lg,
  },
  title: { fontSize: 22, fontWeight: "bold", color: colors.primaryDark },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: spacing.lg },
});