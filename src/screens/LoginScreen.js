import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import Notice from "../components/Notice";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth, friendlyError } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setSubmitting(true);
    try {
      await login(email, password, role);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue">
      <View style={styles.segment}>
        {[["student", "Student"], ["admin", "Office Admin"]].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => { setRole(key); setError(""); }}
            style={[styles.segBtn, role === key && styles.segActive]}
          >
            <Text style={[styles.segText, role === key && styles.segTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Notice>{error}</Notice>
      <Field
        label={role === "student" ? "CvSU Email" : "Admin Email"}
        value={email}
        onChangeText={setEmail}
        placeholder={role === "student" ? "juan.delacruz@cvsu.edu.ph" : "office@cvsu.edu.ph"}
        keyboardType="email-address"
      />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />

      <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgot}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      <PrimaryButton title="Sign In" onPress={submit} loading={submitting} />

      {role === "student" ? (
        <Pressable onPress={() => navigation.navigate("Register")} style={styles.bottom}>
          <Text style={styles.muted}>
            New student? <Text style={styles.link}>Create an account</Text>
          </Text>
        </Pressable>
      ) : (
        <Text style={[styles.muted, styles.bottom]}>
          Office admin accounts are issued by the university's system administrator.
        </Text>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row", backgroundColor: colors.background, borderRadius: radius.md,
    padding: 4, marginBottom: spacing.lg,
  },
  segBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  segActive: { backgroundColor: colors.primary },
  segText: { fontSize: 14, fontWeight: "bold", color: colors.muted },
  segTextActive: { color: "#ffffff" },
  forgot: { alignSelf: "flex-end", marginBottom: spacing.md },
  link: { color: colors.primary, fontWeight: "bold", fontSize: 14 },
  bottom: { marginTop: spacing.lg, alignItems: "center", textAlign: "center" },
  muted: { color: colors.muted, fontSize: 14, textAlign: "center" },
});