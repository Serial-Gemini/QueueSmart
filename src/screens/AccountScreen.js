import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured } from "../firebase";
import { colors, radius, spacing } from "../theme";

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { profile, user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.primaryDark} />
        </View>
        <Text style={styles.name}>{profile?.fullName || "Preview user"}</Text>
        <Text style={styles.email}>{profile?.email || user?.email || "Firebase not connected"}</Text>
      </View>

      <View style={styles.body}>
        {profile?.studentNumber ? (
          <View style={styles.card}>
            <Text style={styles.label}>Student Number</Text>
            <Text style={styles.value}>{profile.studentNumber}</Text>
          </View>
        ) : null}
        {!isFirebaseConfigured ? (
          <View style={styles.card}>
            <Text style={styles.label}>Mode</Text>
            <Text style={styles.value}>Preview (sample data, no login)</Text>
          </View>
        ) : (
          <PrimaryButton title="Log Out" variant="outline" icon="log-out-outline" onPress={logout} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, alignItems: "center", paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  avatar: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: colors.gold,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.sm,
  },
  name: { fontSize: 20, fontWeight: "bold", color: "#ffffff" },
  email: { fontSize: 13, color: colors.goldLight, marginTop: 2 },
  body: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  label: { fontSize: 12, color: colors.muted },
  value: { fontSize: 16, color: colors.text, marginTop: 2 },
});