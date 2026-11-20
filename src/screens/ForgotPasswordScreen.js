import { useState } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import Notice from "../components/Notice";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.trim()) { setError("Enter your email address."); return; }
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (e) {
      if (e.code === "auth/invalid-email") setError("That email address isn't valid.");
      else if (e.code === "auth/network-request-failed") setError("No internet connection. Please try again.");
      else setSent(true); // don't reveal whether an account exists
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll email you a reset link">
      {sent ? (
        <Notice type="success">If an account exists for that email, a reset link is on its way.</Notice>
      ) : (
        <>
          <Notice>{error}</Notice>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@cvsu.edu.ph" keyboardType="email-address" />
          <PrimaryButton title="Send Reset Link" onPress={submit} loading={submitting} />
        </>
      )}
      <Pressable onPress={() => navigation.goBack()} style={styles.bottom}>
        <Text style={styles.link}>Back to sign in</Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  bottom: { marginTop: spacing.lg, alignItems: "center" },
  link: { color: colors.primary, fontWeight: "bold", fontSize: 14 },
});