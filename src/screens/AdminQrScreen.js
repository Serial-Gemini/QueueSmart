import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import PrimaryButton from "../components/PrimaryButton";
import Notice from "../components/Notice";
import ConfirmModal from "../components/ConfirmModal";
import useAdminQueue from "../hooks/useAdminQueue";
import { useAuth } from "../context/AuthContext";
import { buildQr, setQrActive, regenerateQr } from "../services/queueService";
import { canExportQr, makeQrPng, downloadPng, printPng } from "../utils/qrExport";
import { colors, radius, spacing } from "../theme";

export default function AdminQrScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { office, loading, error } = useAdminQueue(profile?.officeId);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [png, setPng] = useState(null);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const value = office?.qrToken ? buildQr(office.id, office.qrToken) : null;

  useEffect(() => {
    let alive = true;
    setPng(null);
    if (value && canExportQr) makeQrPng(value).then((u) => alive && setPng(u)).catch(() => {});
    return () => { alive = false; };
  }, [value]);

  const run = async (fn) => {
    setMsg("");
    setBusy(true);
    try { await fn(); } catch (e) { setMsg(e.message || "That action failed."); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.hello}>QR Code</Text>
        <Text style={styles.title}>{office?.name || "Queue QR"}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : !office ? (
        <View style={styles.content}><Notice>{error || "Office not found."}</Notice></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Notice>{msg || error}</Notice>

          <View style={styles.qrCard}>
            {value && office.qrActive ? (
              <QRCode value={value} size={220} />
            ) : (
              <View style={styles.off}>
                <Text style={styles.offText}>
                  {value ? "This QR code is deactivated. Students who scan it will be turned away." : "No QR code yet. Tap Regenerate to create one."}
                </Text>
              </View>
            )}
            <Text style={[styles.pill, office.qrActive ? styles.pillOn : styles.pillOff]}>
              {office.qrActive ? "ACTIVE" : "INACTIVE"}
            </Text>
            <Text style={styles.caption}>Students scan this to get a queue number. It never contains a number itself.</Text>
            {value ? <Text selectable style={styles.caption}>{value}</Text> : null}
          </View>

          <PrimaryButton title={office.qrActive ? "Deactivate QR" : "Activate QR"} icon={office.qrActive ? "close-circle-outline" : "checkmark-circle-outline"}
            variant={office.qrActive ? "outline" : "solid"} disabled={busy || !value}
            onPress={() => run(() => setQrActive(office.id, !office.qrActive))} />
          <PrimaryButton title="Regenerate QR" icon="refresh" variant="outline" disabled={busy} style={{ marginTop: spacing.sm }}
            onPress={() => setConfirmRegen(true)} />

          {canExportQr ? (
            <>
              <PrimaryButton title="Download PNG" icon="download-outline" variant="gold" disabled={!png || !office.qrActive} style={{ marginTop: spacing.sm }}
                onPress={() => downloadPng(png, `${office.id}-queue-qr.png`)} />
              <PrimaryButton title="Print" icon="print-outline" variant="gold" disabled={!png || !office.qrActive} style={{ marginTop: spacing.sm }}
                onPress={() => { try { printPng(png, office.name, "Scan to get your queue number"); } catch (e) { setMsg(e.message); } }} />
            </>
          ) : (
            <Text style={styles.hint}>Download and print are available when you open the admin side in a web browser.</Text>
          )}
        </ScrollView>
      )}

      <ConfirmModal
        visible={confirmRegen}
        title="Regenerate QR code?"
        message="A new code is created and the old one stops working immediately. Reprint it if the old one is posted at the office."
        confirmLabel="Regenerate"
        onCancel={() => setConfirmRegen(false)}
        onConfirm={() => { setConfirmRegen(false); run(() => regenerateQr(office.id)); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingBottom: spacing.lg, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  hello: { fontSize: 13, color: colors.goldLight },
  title: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
  content: { padding: spacing.md, paddingBottom: spacing.lg * 2 },
  qrCard: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: "center", marginBottom: spacing.md },
  off: { width: 220, height: 220, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md },
  offText: { color: colors.muted, textAlign: "center", fontSize: 13 },
  pill: { marginTop: spacing.md, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill, fontSize: 12, fontWeight: "bold", color: "#ffffff", overflow: "hidden" },
  pillOn: { backgroundColor: colors.open },
  pillOff: { backgroundColor: colors.paused },
  caption: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: spacing.sm },
  hint: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: spacing.md },
});