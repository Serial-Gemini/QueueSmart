import { useState } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import Notice from "../components/Notice";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth, friendlyError } from "../context/AuthContext";
import { colors, spacing } from "../theme";

export default function RegisterScreen({ navigation }) {
  const { registerStudent } = useAuth();
  const [form, setForm] = useState({ fullName: "", studentNumber: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try {
      await registerStudent(form);
      setDone(true);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Verify your email" subtitle="One last step">
        <Notice type="success">
          We sent a verification link to {form.email.trim().toLowerCase()}. Open it, then come back and sign in.
          Check your spam folder if you don't see it.
        </Notice>
        <PrimaryButton title="Go to Sign In" onPress={() => navigation.navigate("Login")} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create student account" subtitle="Use your official CvSU email">
      <Notice>{error}</Notice>
      <Field label="Full Name" value={form.fullName} onChangeText={set("fullName")} placeholder="Juan Dela Cruz" autoCapitalize="words" />
      <Field label="Student Number" value={form.studentNumber} onChangeText={set("studentNumber")} placeholder="202012345" />
      <Field label="Institutional Email" value={form.email} onChangeText={set("email")} placeholder="juan.delacruz@cvsu.edu.ph" keyboardType="email-address" />
      <Field label="Password" value={form.password} onChangeText={set("password")} placeholder="At least 8 characters" secureTextEntry />
      <Field label="Confirm Password" value={form.confirm} onChangeText={set("confirm")} placeholder="Re-enter password" secureTextEntry />

      <PrimaryButton title="Create Account" onPress={submit} loading={submitting} />
      <Pressable onPress={() => navigation.goBack()} style={styles.bottom}>
        <Text style={styles.muted}>Already registered? <Text style={styles.link}>Sign in</Text></Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  bottom: { marginTop: spacing.lg, alignItems: "center" },
  muted: { color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: "bold" },
});