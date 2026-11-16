import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
} from "react-native";
import StatusBadge from "../components/StatusBadge";
import { colors, radius, spacing } from "../theme";

export default function OfficeDetailScreen({ office, onBack }) {
  const handleGetNumber = () => {
    // Placeholder: ticket creation (saving to Firestore) is the next feature.
    Alert.alert(
      "Coming soon",
      "Getting a queue number will be added in the next update."
    );
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>{"< Back to offices"}</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{office.name}</Text>
        <StatusBadge status={office.status} />
        <Text style={styles.hours}>Hours: {office.hours}</Text>

        <Text style={styles.heading}>Requirements</Text>
        {(office.requirements || []).map((item, index) => (
          <Text key={index} style={styles.item}>
            • {item}
          </Text>
        ))}

        <Text style={styles.heading}>Services</Text>
        {(office.services || []).map((item, index) => (
          <View key={index} style={styles.service}>
            <Text style={styles.serviceText}>{item}</Text>
          </View>
        ))}

        <Pressable style={styles.button} onPress={handleGetNumber}>
          <Text style={styles.buttonText}>Get Queue Number</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const topPadding =
  Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 12 : 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: topPadding,
    paddingHorizontal: spacing.md,
  },
  back: { paddingVertical: spacing.sm },
  backText: { color: colors.primary, fontSize: 15, fontWeight: "bold" },
  content: { paddingBottom: spacing.lg },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  hours: { fontSize: 14, color: colors.muted, marginTop: spacing.sm },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  item: { fontSize: 14, color: colors.text, marginBottom: spacing.xs },
  service: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  serviceText: { fontSize: 15, color: colors.text },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
