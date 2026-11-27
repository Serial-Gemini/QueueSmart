import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "../components/StatusBadge";
import PrimaryButton from "../components/PrimaryButton";
import Notice from "../components/Notice";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useTicket } from "../context/TicketContext";
import { cancelOwnTicket } from "../services/queueService";
import { colors, radius, spacing } from "../theme";

const MESSAGES = {
  Waiting: "You're in line. We'll notify you as your turn gets closer.",
  "Almost Your Turn": "Almost your turn! Please head to the office now.",
  "Now Serving": "It's your turn! Please proceed to the counter.",
  Completed: "Your transaction is complete. Thank you!",
  Cancelled: "This queue number was cancelled.",
  Skipped: "You were skipped. Scan the office QR code again to get a new number.",
};

export default function TicketScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { items, dismiss } = useTicket();
  const item = items.find((i) => i.id === route.params.ticketId);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const leave = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Tabs"));

  const cancel = async () => {
    setConfirm(false);
    setBusy(true);
    setError("");
    try {
      await cancelOwnTicket({ officeId: item.officeId, ticketId: item.id, uid: user.uid });
    } catch (e) {
      console.warn("cancel failed:", e);
      setError("Couldn't cancel your queue number. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const done = () => { dismiss(item.id); leave(); };

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable onPress={leave} style={styles.back} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color="#ffffff" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Your Queue Ticket</Text>
    </View>
  );

  if (!item) {
    return <View style={styles.container}>{header}<ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} /></View>;
  }

  const when = item.createdAt?.toDate
    ? item.createdAt.toDate().toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "Just now";

  return (
    <View style={styles.container}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        <Notice>{error}</Notice>
        <View style={styles.ticket}>
          <Text style={styles.label}>Queue Number</Text>
          <Text style={styles.number}>{item.number}</Text>
          <StatusBadge status={item.label} />
          <Text style={styles.message}>{MESSAGES[item.label]}</Text>
        </View>

        <View style={styles.card}>
          <Row label="Department" value={item.officeName} />
          <Row label="Now Serving" value={item.nowServing || "—"} />
          {item.status === "waiting" ? <Row label="People Ahead" value={String(item.ahead)} /> : null}
          <Row label="Student Name" value={item.studentName} />
          <Row label="Student Number" value={item.studentNumber} />
          <Row label="Registered" value={when} last />
        </View>

        {item.status === "waiting" ? (
          <PrimaryButton title="Cancel My Queue Number" variant="outline" icon="close-circle-outline" onPress={() => setConfirm(true)} loading={busy} />
        ) : null}
        {item.isFinal ? <PrimaryButton title="Done" onPress={done} /> : null}
      </ScrollView>

      <ConfirmModal
        visible={confirm}
        title="Cancel your queue number?"
        message={`${item.number} will be cancelled and you'll lose your place in line.`}
        confirmLabel="Cancel number"
        onCancel={() => setConfirm(false)}
        onConfirm={cancel}
      />
    </View>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.rowLine]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingBottom: spacing.lg, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, gap: spacing.sm },
  back: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start" },
  backText: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
  title: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
  content: { padding: spacing.md, paddingBottom: spacing.lg * 2 },
  ticket: { backgroundColor: colors.primaryDark, borderRadius: radius.md, padding: spacing.lg, alignItems: "center", gap: spacing.sm, marginBottom: spacing.md, borderBottomWidth: 4, borderBottomColor: colors.gold },
  label: { fontSize: 12, color: colors.goldLight, textTransform: "uppercase", letterSpacing: 1 },
  number: { fontSize: 52, fontWeight: "bold", color: "#ffffff" },
  message: { fontSize: 14, color: "#d7eadf", textAlign: "center", marginTop: spacing.xs },
  card: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.md, gap: spacing.md },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 13, color: colors.muted },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: "bold", flexShrink: 1, textAlign: "right" },
});