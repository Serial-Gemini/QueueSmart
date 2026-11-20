import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "../components/StatusBadge";
import PrimaryButton from "../components/PrimaryButton";
import useOffices from "../hooks/useOffices";
import { effectiveStatus, acceptingQueue, queueSummary } from "../utils/office";
import { colors, radius, spacing } from "../theme";

export default function OfficeDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { offices, loading } = useOffices();
  const office = offices.find((o) => o.id === route.params.officeId);

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color="#ffffff" />
        <Text style={styles.backText}>Offices</Text>
      </Pressable>
      {office ? (
        <>
          <Text style={styles.name}>{office.name}</Text>
          <StatusBadge status={effectiveStatus(office)} />
        </>
      ) : null}
    </View>
  );

  if (loading || !office) {
    return (
      <View style={styles.container}>
        {header}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : (
          <Text style={styles.empty}>This office could not be found.</Text>
        )}
      </View>
    );
  }

  const { serving, waiting } = queueSummary(office);
  const accepting = acceptingQueue(office);

  return (
    <View style={styles.container}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>{office.description}</Text>

        <View style={styles.infoCard}>
          <InfoRow icon="location-outline" label="Location" value={office.location || "Not set"} />
          <InfoRow icon="time-outline" label="Operating Hours" value={office.hours} />
        </View>

        <Text style={styles.heading}>Queue Status</Text>
        <View style={styles.queueCard}>
          <View style={styles.queueItem}>
            <Text style={styles.queueLabel}>Now Serving</Text>
            <Text style={styles.queueValue}>{serving || "—"}</Text>
          </View>
          <View style={styles.queueItem}>
            <Text style={styles.queueLabel}>Waiting</Text>
            <Text style={styles.queueValue}>{waiting}</Text>
          </View>
        </View>

        <Text style={styles.heading}>Available Services</Text>
        {(office.services || []).map((item, i) => (
          <View key={i} style={styles.service}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.serviceText}>{item}</Text>
          </View>
        ))}

        <Text style={styles.heading}>Required Documents</Text>
        {(office.requirements || []).map((item, i) => (
          <View key={i} style={styles.service}>
            <Ionicons name="document-text-outline" size={18} color={colors.gold} />
            <Text style={styles.serviceText}>{item}</Text>
          </View>
        ))}

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton
            title="Scan QR Code"
            icon="qr-code-outline"
            disabled={!accepting}
            onPress={() => navigation.navigate("Scan", { officeId: office.id })}
          />
          {!accepting ? (
            <Text style={styles.hint}>This office isn't accepting queue numbers right now.</Text>
          ) : (
            <Text style={styles.hint}>Scan the QR code posted at the office to get your number.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, gap: spacing.sm,
  },
  back: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start" },
  backText: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
  name: { fontSize: 26, fontWeight: "bold", color: "#ffffff" },
  content: { padding: spacing.md, paddingBottom: spacing.lg * 2 },
  body: { fontSize: 15, color: colors.text, marginBottom: spacing.md },
  infoCard: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, gap: spacing.md,
  },
  infoRow: { flexDirection: "row", gap: spacing.sm + 4, alignItems: "flex-start" },
  infoLabel: { fontSize: 12, color: colors.muted },
  infoValue: { fontSize: 14, color: colors.text },
  heading: { fontSize: 16, fontWeight: "bold", color: colors.primaryDark, marginTop: spacing.lg, marginBottom: spacing.sm },
  queueCard: { flexDirection: "row", backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md },
  queueItem: { flex: 1 },
  queueLabel: { fontSize: 11, color: colors.goldLight, textTransform: "uppercase", letterSpacing: 0.5 },
  queueValue: { fontSize: 26, fontWeight: "bold", color: "#ffffff" },
  service: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.card,
    padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  serviceText: { fontSize: 15, color: colors.text, flex: 1 },
  hint: { textAlign: "center", color: colors.muted, fontSize: 12, marginTop: spacing.sm },
  empty: { textAlign: "center", color: colors.muted, marginTop: spacing.lg },
});