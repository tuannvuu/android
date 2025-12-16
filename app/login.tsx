import { auth } from "@/app/config/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Film, Lock, Smartphone } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter phone number and password");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Login success:", userCredential.user.uid);

      router.replace("/"); // vào trang chính
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2", "#f093fb"]}
      style={styles.container}
    >
      {/* Decorative elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={["#f093fb", "#f5576c"]}
              style={styles.logoContainer}
            >
              <Film size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.logoText}>LiDoRa</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your cinematic journey
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Smartphone size={18} color="#764ba2" />
                <Text style={styles.labelText}>Your Phone</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor="#a78bfa"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Lock size={18} color="#764ba2" />
                <Text style={styles.labelText}>Password</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholderTextColor="#a78bfa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#764ba2" />
                  ) : (
                    <Eye size={20} color="#764ba2" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#f093fb", "#f5576c"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Signing In..." : "Sign In"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <View style={styles.socialIconContainer}>
                  <Smartphone size={20} color="#667eea" />
                </View>
                <Text style={styles.socialButtonText}>Phone</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <LinearGradient
                  colors={["#4285F4", "#34A853", "#FBBC05", "#EA4335"]}
                  style={styles.googleIconContainer}
                >
                  <Text style={styles.googleText}>G</Text>
                </LinearGradient>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              {`Don't have an account? `}
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // Decorative Circles
  circle1: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -width * 0.2,
    left: -width * 0.15,
  },
  circle2: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: width * 0.4,
    right: -width * 0.1,
  },
  circle3: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -width * 0.2,
    left: -width * 0.1,
  },
  // Header
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
    letterSpacing: 2,
  },
  // Welcome Section
  welcomeSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  // Form Card
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    padding: 28,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(10px)",
  },
  // Input Groups
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  labelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#764ba2",
    marginLeft: 8,
  },
  input: {
    height: 58,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "rgba(118, 75, 162, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    shadowColor: "#764ba2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    height: 58,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "rgba(118, 75, 162, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingRight: 60,
    fontSize: 16,
    color: "#333",
    shadowColor: "#764ba2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eyeButton: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 8,
  },
  // Forgot Password
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 28,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#f5576c",
    fontWeight: "600",
  },
  // Login Button
  loginButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 28,
    shadowColor: "#f5576c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(118, 75, 162, 0.2)",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#764ba2",
    fontWeight: "500",
  },
  // Social Buttons
  socialButtons: {
    flexDirection: "row",
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "rgba(118, 75, 162, 0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  // Sign Up
  signupContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(10px)",
  },
  signupText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  signupLink: {
    color: "#f5576c",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
