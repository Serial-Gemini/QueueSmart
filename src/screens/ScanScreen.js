import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing } from "../theme";

export default function ScanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color={colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <View style={styles.center}>
        <Ionicons name="qr-code-outline" size={72} color={colors.primary} />
        <Text style={styles.title}>QR scanner</Text>
        <Text style={styles.text}>The camera scanner arrives in the next update. This screen will be replaced by it.</Text>
        <PrimaryButton title="Go Back" variant="outline" onPress={() => navigation.goBack()} style={{ alignSelf: "stretch", marginTop: spacing.lg }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  back: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start" },
  backText: { color: colors.primary, fontSize: 15, fontWeight: "bold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  title: { fontSize: 22, fontWeight: "bold", color: colors.primaryDark, marginTop: spacing.md },
  text: { fontSize: 14, color: colors.muted, textAlign: "center", marginTop: spacing.sm },
});