import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme";

export default function ConfirmModal({ visible, title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.cancel]} onPress={onCancel}>
              <Text style={styles.cancelText}>Keep</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.confirm]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: spacing.lg },
  box: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, width: "100%", maxWidth: 400 },
  title: { fontSize: 18, fontWeight: "bold", color: colors.primaryDark },
  message: { fontSize: 14, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.lg },
  row: { flexDirection: "row", gap: spacing.sm },
  btn: { flex: 1, padding: spacing.md, borderRadius: radius.md, alignItems: "center" },
  cancel: { borderWidth: 1.5, borderColor: colors.primary },
  cancelText: { color: colors.primary, fontWeight: "bold" },
  confirm: { backgroundColor: colors.closed },
  confirmText: { color: "#ffffff", fontWeight: "bold" },
});