import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme";

export default function AdminHomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, logout } = useAuth();
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.hello}>Office Admin</Text>
        <Text style={styles.title}>{profile?.fullName || "Administrator"}</Text>
        <Text style={styles.hello}>Office: {profile?.officeId || "not assigned"}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            The queue dashboard, QR generator and queue controls arrive in the admin update.
          </Text>
        </View>
        <PrimaryButton title="Log Out" variant="outline" icon="log-out-outline" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  hello: { fontSize: 14, color: colors.goldLight },
  title: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginVertical: 2 },
  body: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  cardText: { fontSize: 14, color: colors.text },
});