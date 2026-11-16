import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
} from "react-native";
import OfficeCard from "../components/OfficeCard";
import useOffices from "../hooks/useOffices";
import { colors, spacing } from "../theme";

export default function HomeScreen({ onSelectOffice }) {
  const { offices, loading, source, error } = useOffices();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QueueSmart</Text>
      <Text style={styles.subtitle}>Choose an office to see details</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {source === "firebase"
            ? "Live data from Firebase"
            : "Showing sample data (Firebase not connected yet)"}
        </Text>
      </View>
      {error ? <Text style={styles.error}>Firebase error: {error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={offices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OfficeCard office={item} onPress={() => onSelectOffice(item)} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
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
  title: { fontSize: 28, fontWeight: "bold", color: colors.primary },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: spacing.md },
  banner: {
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  bannerText: { fontSize: 12, color: colors.primary },
  error: { color: colors.closed, fontSize: 12, marginBottom: spacing.sm },
  list: { paddingBottom: spacing.lg },
});
