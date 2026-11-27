import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OfficeCard from "../components/OfficeCard";
import PrimaryButton from "../components/PrimaryButton";
import useOffices from "../hooks/useOffices";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";
import ActiveTicketCard from "../components/ActiveTicketCard";
import { useTicket } from "../context/TicketContext";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { offices, loading, source, error } = useOffices();
  const firstName = profile?.fullName?.split(" ")[0];
  const { items = [] } = useTicket() || {};

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.hello}>{firstName ? `Hello, ${firstName}` : "Welcome"}</Text>
        <Text style={styles.title}>Campus Offices</Text>
        <Text style={styles.subtitle}>Pick an office, or scan its QR code to get a queue number.</Text>
        <PrimaryButton title="Scan QR Code" icon="qr-code-outline" variant="gold" onPress={() => navigation.navigate("Scan")} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : (
        <FlatList
          data={offices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OfficeCard office={item} onPress={() => navigation.navigate("OfficeDetails", { officeId: item.id })} />
          )}
          ListHeaderComponent={
            <>
            {items.map((it) => (
  <ActiveTicketCard
    key={it.id}
    item={it}
    onPress={() => navigation.navigate("Ticket", { officeId: it.officeId, ticketId: it.id })}
  />
))}
              {source === "sample" ? (
                <View style={styles.banner}>
                  <Text style={styles.bannerText}>Showing sample data (no offices found in Firebase yet)</Text>
                </View>
              ) : null}
              {error ? <Text style={styles.error}>Firebase error: {error}</Text> : null}
            </>
          }
          ListEmptyComponent={<Text style={styles.empty}>No offices available right now.</Text>}
          contentContainerStyle={styles.list}
        />
      )}
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
  title: { fontSize: 26, fontWeight: "bold", color: "#ffffff" },
  subtitle: { fontSize: 14, color: "#d7eadf", marginBottom: spacing.md, marginTop: 2 },
  list: { padding: spacing.md, paddingBottom: spacing.lg },
  banner: { backgroundColor: colors.goldLight, padding: spacing.sm, borderRadius: 8, marginBottom: spacing.md },
  bannerText: { fontSize: 12, color: colors.primaryDark },
  error: { color: colors.closed, fontSize: 12, marginBottom: spacing.sm },
  empty: { textAlign: "center", color: colors.muted, marginTop: spacing.lg },
});