import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StatusBadge from "../components/StatusBadge";
import PrimaryButton from "../components/PrimaryButton";
import Notice from "../components/Notice";
import ConfirmModal from "../components/ConfirmModal";
import useAdminQueue from "../hooks/useAdminQueue";
import { useAuth } from "../context/AuthContext";
import { callNext, closeTicket, setPaused, setOfficeStatus, resetQueue } from "../services/queueService";
import { effectiveStatus } from "../utils/office";
import { colors, radius, spacing } from "../theme";

const timeOf = (t) =>
  t.createdAt?.toDate ? t.createdAt.toDate().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—";

export default function AdminQueueScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { office, tickets, waiting, serving, stats, session, loading, error } = useAdminQueue(profile?.officeId);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [confirm, setConfirm] = useState(null);

  const run = async (fn) => {
    setActionError("");
    setBusy(true);
    try { await fn(); } catch (e) { setActionError(e.message || "That action failed. Please try again."); }
    finally { setBusy(false); }
  };
  const ask = (title, message, label, fn) => setConfirm({ title, message, label, fn });
  const close = (ticket, action) => run(() => closeTicket({ officeId: office.id, ticket, action }));

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.hello}>Office Admin · {profile?.fullName}</Text>
      <Text style={styles.title}>{office?.name || "Queue Dashboard"}</Text>
      {office ? (
        <View style={styles.headRow}>
          <StatusBadge status={effectiveStatus(office)} />
          <Text style={styles.meta} numberOfLines={1}>{office.location}</Text>
        </View>
      ) : null}
    </View>
  );

  if (loading) {
    return <View style={styles.container}>{header}<ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} /></View>;
  }
  if (!office) {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.content}>
          <Notice>{error || `No office found with ID "${profile?.officeId}". Check the officeId of this admin in Firestore.`}</Notice>
        </View>
      </View>
    );
  }

  const next = waiting[0];
  const statCells = [
    ["Total", stats.total], ["Waiting", stats.waiting], ["Completed", stats.completed],
    ["Cancelled", stats.cancelled], ["Skipped", stats.skipped], ["Serving", stats.serving],
  ];

  return (
    <View style={styles.container}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        <Notice>{actionError || error}</Notice>

        <View style={styles.servingCard}>
          <Text style={styles.servingLabel}>Now Serving</Text>
          <Text style={styles.servingNumber}>{serving ? serving.number : "—"}</Text>
          <Text style={styles.servingName}>
            {serving ? `${serving.studentName} · ${serving.studentNumber}` : "No one is being served"}
          </Text>
        </View>

        {serving ? (
          <View style={styles.actionRow}>
            <PrimaryButton title="Complete" disabled={busy} style={{ flex: 1 }} onPress={() => close(serving, "completed")} />
            <PrimaryButton title="Skip" variant="outline" disabled={busy} style={{ flex: 1 }}
              onPress={() => ask("Skip this student?", `${serving.number} will be removed from the line and can get a new number later.`, "Skip", () => close(serving, "skipped"))} />
            <PrimaryButton title="Cancel" variant="outline" disabled={busy} style={{ flex: 1 }}
              onPress={() => ask("Cancel this entry?", `${serving.number} will be cancelled.`, "Cancel entry", () => close(serving, "cancelled"))} />
          </View>
        ) : (
          <View>
            <PrimaryButton title={next ? `Call Next (${next.number})` : "Call Next"} icon="megaphone-outline"
              variant="gold" disabled={busy || !next} onPress={() => run(() => callNext(office.id, next))} />
            {!next ? <Text style={styles.hint}>No students are waiting.</Text> : null}
          </View>
        )}

        <Text style={styles.heading}>Queue Overview</Text>
        <View style={styles.statGrid}>
          {statCells.map(([label, value]) => (
            <View key={label} style={styles.statBox}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.heading}>Waiting List ({waiting.length})</Text>
        {waiting.length === 0 ? <Text style={styles.empty}>Nobody is waiting right now.</Text> : null}
        {waiting.map((t) => (
          <View key={t.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowNumber}>{t.number}</Text>
              <Text style={styles.rowName}>{t.studentName} · {t.studentNumber}</Text>
              <Text style={styles.rowTime}>Registered {timeOf(t)}</Text>
            </View>
            <Pressable disabled={busy} style={styles.rowBtn}
              onPress={() => ask("Cancel this entry?", `${t.number} (${t.studentName}) will be cancelled.`, "Cancel entry", () => close(t, "cancelled"))}>
              <Text style={styles.rowBtnText}>Cancel</Text>
            </Pressable>
          </View>
        ))}

        <Text style={styles.heading}>Office Controls</Text>
        <View style={styles.chips}>
          {["Open", "On Break", "Closed"].map((s) => (
            <Pressable key={s} disabled={busy} onPress={() => run(() => setOfficeStatus(office.id, s))}
              style={[styles.chip, office.status === s && styles.chipOn]}>
              <Text style={[styles.chipText, office.status === s && styles.chipTextOn]}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton title={office.paused ? "Resume Queue" : "Pause Queue"} icon={office.paused ? "play" : "pause"}
          variant={office.paused ? "gold" : "outline"} disabled={busy} style={{ marginTop: spacing.sm }}
          onPress={() => run(() => setPaused(office.id, !office.paused))} />
        <Text style={styles.hint}>
          {office.paused ? "New students can't get numbers while paused." : "Pausing stops new numbers. Students already in line are kept."}
        </Text>

        <PrimaryButton title="Reset Daily Queue" icon="refresh" variant="outline" disabled={busy || !office.paused}
          style={{ marginTop: spacing.md }}
          onPress={() => ask("Reset the daily queue?",
            `Everyone still waiting or being served (${waiting.length + (serving ? 1 : 0)}) will be cancelled and numbering restarts at ${office.prefix}-001.`,
            "Reset", () => run(() => resetQueue(office.id, tickets.filter((t) => t.status === "waiting" || t.status === "serving"), session)))} />
        <Text style={styles.hint}>Pause the queue first, so nobody can join while it resets.</Text>
      </ScrollView>

      <ConfirmModal
        visible={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.label}
        onCancel={() => setConfirm(null)}
        onConfirm={() => { const fn = confirm?.fn; setConfirm(null); fn && fn(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingBottom: spacing.lg, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  hello: { fontSize: 13, color: colors.goldLight },
  title: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginVertical: 2 },
  headRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 4 },
  meta: { fontSize: 13, color: "#d7eadf", flexShrink: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.lg * 2 },
  servingCard: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.lg, alignItems: "center", marginBottom: spacing.md },
  servingLabel: { fontSize: 12, color: colors.goldLight, textTransform: "uppercase", letterSpacing: 1 },
  servingNumber: { fontSize: 44, fontWeight: "bold", color: "#ffffff" },
  servingName: { fontSize: 14, color: "#d7eadf", textAlign: "center" },
  actionRow: { flexDirection: "row", gap: spacing.sm },
  heading: { fontSize: 16, fontWeight: "bold", color: colors.primaryDark, marginTop: spacing.lg, marginBottom: spacing.sm },
  hint: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: spacing.sm },
  statGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: spacing.sm },
  statBox: { width: "31.5%", backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "bold", color: colors.primary },
  statLabel: { fontSize: 11, color: colors.muted, textTransform: "uppercase" },
  empty: { color: colors.muted, textAlign: "center", marginVertical: spacing.md },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.gold, padding: spacing.md, marginBottom: spacing.sm },
  rowNumber: { fontSize: 18, fontWeight: "bold", color: colors.primaryDark },
  rowName: { fontSize: 14, color: colors.text },
  rowTime: { fontSize: 12, color: colors.muted },
  rowBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.closed },
  rowBtnText: { color: colors.closed, fontWeight: "bold", fontSize: 13 },
  chips: { flexDirection: "row", gap: spacing.sm },
  chip: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "bold", color: colors.muted },
  chipTextOn: { color: "#ffffff" },
});