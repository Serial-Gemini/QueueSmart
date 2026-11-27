import { useCallback, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator, Linking, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTicket } from "../context/TicketContext";
import PrimaryButton from "../components/PrimaryButton";
import Notice from "../components/Notice";
import StatusBadge from "../components/StatusBadge";
import { parseQr, joinQueue } from "../services/queueService";
import { notify, setupNotifications } from "../utils/notify";
import { effectiveStatus, acceptingQueue, queueSummary } from "../utils/office";
import { colors, radius, spacing } from "../theme";

export default function ScanScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { track } = useTicket() || {};
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState("scan"); // scan | checking | confirm
  const [found, setFound] = useState(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [manual, setManual] = useState("");
  const lock = useRef(false);
  const hint = route.params?.officeId;

  const reset = () => { lock.current = false; setFound(null); setError(""); setStage("scan"); };

  const handleCode = useCallback(async (raw) => {
    if (lock.current) return;
    lock.current = true;
    setError("");
    const parsed = parseQr(raw);
    if (!parsed) {
      setError("That isn't a QueueSmart QR code. Please scan the code posted at the office.");
      lock.current = false;
      return;
    }
    setStage("checking");
    try {
      const snap = await getDoc(doc(db, "offices", parsed.officeId));
      if (!snap.exists()) throw new Error("This QR code doesn't match any office.");
      const office = { id: snap.id, ...snap.data() };
      if (!office.qrActive || office.qrToken !== parsed.token) {
        throw new Error("This QR code is expired or inactive. Ask the office for the current one.");
      }
      setFound({ office, token: parsed.token });
      setStage("confirm");
    } catch (e) {
      setError(e.code === "permission-denied" ? "Couldn't check this QR code. Please try again." : e.message);
      setStage("scan");
      lock.current = false;
    }
  }, []);

  const confirmJoin = async () => {
    setJoining(true);
    setError("");
    try {
      await setupNotifications();
      const { ticketId, number } = await joinQueue({
        officeId: found.office.id, token: found.token, uid: user.uid, profile,
      });
      track && track({ officeId: found.office.id, ticketId });
      notify("Queue number secured", `Your number is ${number} at ${found.office.name}.`);
      navigation.replace("Ticket", { officeId: found.office.id, ticketId });
    } catch (e) {
      console.warn("joinQueue failed:", e);
      setError(e.code === "permission-denied" ? "Couldn't get a queue number. Please try again." : e.message || "Something went wrong.");
    } finally {
      setJoining(false);
    }
  };

  const openSettings = () => { try { Linking.openSettings(); } catch {} };

  const back = (
    <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
      <Ionicons name="chevron-back" size={22} color="#ffffff" />
      <Text style={styles.backText}>Back</Text>
    </Pressable>
  );
  const header = (title) => (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      {back}
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  /* ---------- Confirm ---------- */
  if (stage === "confirm" && found) {
    const o = found.office;
    const { serving, waiting } = queueSummary(o);
    const accepting = acceptingQueue(o);
    const mismatch = hint && hint !== o.id;
    return (
      <View style={styles.container}>
        {header("Confirm your queue")}
        <ScrollView contentContainerStyle={styles.content}>
          {mismatch ? <Notice>This QR code belongs to a different office than the one you opened.</Notice> : null}
          <Notice>{error}</Notice>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.officeName}>{o.name}</Text>
              <StatusBadge status={effectiveStatus(o)} />
            </View>
            <Text style={styles.body}>{o.description}</Text>
            <View style={styles.meta}><Ionicons name="location-outline" size={15} color={colors.muted} /><Text style={styles.metaText}>{o.location}</Text></View>
            <View style={styles.meta}><Ionicons name="time-outline" size={15} color={colors.muted} /><Text style={styles.metaText}>{o.hours}</Text></View>
            <View style={styles.strip}>
              <View style={{ flex: 1 }}><Text style={styles.stripLabel}>Now Serving</Text><Text style={styles.stripValue}>{serving || "—"}</Text></View>
              <View style={{ flex: 1 }}><Text style={styles.stripLabel}>Waiting</Text><Text style={styles.stripValue}>{waiting}</Text></View>
            </View>
          </View>
          {!accepting ? <Notice>This office isn't accepting queue numbers right now.</Notice> : null}
          <PrimaryButton title="Get Queue Number" icon="ticket-outline" onPress={confirmJoin} loading={joining} disabled={!accepting} />
          <PrimaryButton title="Cancel" variant="outline" onPress={reset} disabled={joining} style={{ marginTop: spacing.sm }} />
        </ScrollView>
      </View>
    );
  }

  /* ---------- Scan ---------- */
  const granted = permission?.granted;
  return (
    <View style={styles.container}>
      {header("Scan QR Code")}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.body}>Point your camera at the QR code posted at the office.</Text>
        <Notice>{error}</Notice>

        {!permission ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : !granted ? (
          <View style={styles.card}>
            <Ionicons name="camera-outline" size={40} color={colors.primary} />
            <Text style={styles.officeName}>Camera access needed</Text>
            <Text style={styles.body}>QueueSmart uses your camera only to read office QR codes.</Text>
            {permission.canAskAgain ? (
              <PrimaryButton title="Allow Camera" onPress={requestPermission} />
            ) : (
              <PrimaryButton title="Open Settings" onPress={openSettings} />
            )}
          </View>
        ) : (
          <View style={styles.cameraBox}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={stage === "scan" && !error ? (r) => handleCode(r.data) : undefined}
            />
            <View pointerEvents="none" style={styles.frame} />
            {stage === "checking" ? (
              <View style={styles.checking}><ActivityIndicator color="#ffffff" size="large" /><Text style={styles.checkingText}>Checking code…</Text></View>
            ) : null}
          </View>
        )}

        {error ? <PrimaryButton title="Scan Again" icon="refresh" onPress={reset} style={{ marginTop: spacing.md }} /> : null}

        <Text style={styles.heading}>Can't scan?</Text>
        <Text style={styles.hint}>Paste the QR link instead (it starts with queuesmart://).</Text>
        <TextInput
          value={manual}
          onChangeText={setManual}
          placeholder="queuesmart://join?o=..."
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <PrimaryButton title="Use This Code" variant="outline" disabled={!manual.trim() || stage === "checking"} onPress={() => { lock.current = false; handleCode(manual); }} />
      </ScrollView>
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
  body: { fontSize: 14, color: colors.text, marginBottom: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  officeName: { fontSize: 20, fontWeight: "bold", color: colors.primaryDark, flex: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: colors.muted, flexShrink: 1 },
  strip: { flexDirection: "row", backgroundColor: colors.primaryLight, borderRadius: 10, padding: spacing.sm + 2, marginTop: spacing.sm },
  stripLabel: { fontSize: 11, color: colors.muted, textTransform: "uppercase" },
  stripValue: { fontSize: 20, fontWeight: "bold", color: colors.primaryDark },
  cameraBox: { height: 340, borderRadius: radius.md, overflow: "hidden", backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  frame: { width: 220, height: 220, borderRadius: 20, borderWidth: 3, borderColor: colors.gold },
  checking: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  checkingText: { color: "#ffffff", fontWeight: "bold" },
  heading: { fontSize: 16, fontWeight: "bold", color: colors.primaryDark, marginTop: spacing.lg },
  hint: { fontSize: 12, color: colors.muted, marginVertical: spacing.sm },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: 14, color: colors.text, marginBottom: spacing.sm },
});