import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import {
  Eye,
  EyeOff,
  Facebook,
  Film,
  Github,
  Lock,
  Mail,
  Smartphone,
} from "lucide-react-native";
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
import { db } from "../config/firebase";
const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod] = useState("phone");

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert(
        "Lỗi",
        `Vui lòng nhập ${
          loginMethod === "phone" ? "số điện thoại" : ""
        } và mật khẩu`
      );
      return;
    }

    try {
      setLoading(true);

      // Xác định trường để tìm user dựa trên phương thức đăng nhập
      const userRef = doc(db, "users", phone.trim());
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.data();

        // Kiểm tra xem trường password có tồn tại trong DB không
        if (!userData.password) {
          Alert.alert("Lỗi", "Tài khoản này chưa thiết lập mật khẩu.");
          return;
        }

        if (userData.password === password) {
          await AsyncStorage.setItem("phone", phone.trim());
          router.replace("/(tab)");
        } else {
          Alert.alert("Lỗi", "Mật khẩu không chính xác");
        }
      } else {
        Alert.alert(
          "Lỗi",
          `${
            loginMethod === "phone" ? "Số điện thoại" : "Email"
          } chưa được đăng ký`
        );
      }
    } catch (error: any) {
      console.error("Login Error:", error.message);
      Alert.alert("Lỗi", "Đã xảy ra lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push({
      pathname: "/forgot-password",
      params: {
        identifier: phone,
        method: loginMethod,
      },
    });
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert(
      "Thông báo",
      `Đăng nhập với ${provider} (Tính năng đang phát triển)`
    );
  };

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2", "#f093fb"]}
      style={styles.container}
    >
      {/* Decorative Circles */}
      <View style={styles.circle1} pointerEvents="none" />
      <View style={styles.circle2} pointerEvents="none" />
      <View style={styles.circle3} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.tagline}>Đặt vé phim dễ dàng</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Phone/Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                {loginMethod === "phone" ? (
                  <Smartphone size={18} color="#764ba2" />
                ) : (
                  <Mail size={18} color="#764ba2" />
                )}
                <Text style={styles.labelText}>
                  {loginMethod === "phone" ? "Số điện thoại" : "Email"}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={
                  loginMethod === "phone" ? "09xxxxxxxx" : "you@example.com"
                }
                placeholderTextColor="#a78bfa"
                value={phone}
                onChangeText={setPhone}
                keyboardType={
                  loginMethod === "phone" ? "phone-pad" : "email-address"
                }
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Lock size={18} color="#764ba2" />
                <Text style={styles.labelText}>Mật khẩu</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
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
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#f093fb", "#f5576c"]}
                style={styles.gradientButton}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin("Facebook")}
              >
                <LinearGradient
                  colors={["#1877F2", "#1877F2"]}
                  style={styles.socialIconContainer}
                >
                  <Facebook size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin("Google")}
              >
                <LinearGradient
                  colors={["#4285F4", "#34A853", "#FBBC05", "#EA4335"]}
                  style={styles.googleIconContainer}
                >
                  <Text style={styles.googleText}>G</Text>
                </LinearGradient>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin("GitHub")}
              >
                <View style={styles.githubIconContainer}>
                  <Github size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.socialButtonText}>GitHub</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Login Options */}
            <View style={styles.quickLoginContainer}>
              <Text style={styles.quickLoginTitle}>Đăng nhập nhanh:</Text>
              <View style={styles.quickLoginButtons}>
                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={() => {
                    setPhone("0901234567");
                    setPassword("123456");
                    Alert.alert("Thông tin demo", "Đã điền thông tin demo!");
                  }}
                >
                  <Text style={styles.quickLoginText}>Tài khoản demo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={() =>
                    Alert.alert(
                      "Vân tay",
                      "Đăng nhập bằng vân tay (Tính năng đang phát triển)"
                    )
                  }
                >
                  <Text style={styles.quickLoginText}>🔒 Vân tay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={() =>
                    Alert.alert(
                      "Face ID",
                      "Đăng nhập bằng Face ID (Tính năng đang phát triển)"
                    )
                  }
                >
                  <Text style={styles.quickLoginText}>👤 Face ID</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={{ color: "#FFF" }}>Chưa có tài khoản? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() => Alert.alert("Hỗ trợ", "Liên hệ hỗ trợ")}
            >
              <Text style={styles.footerLink}>Trợ giúp</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>•</Text>
            <TouchableOpacity
              onPress={() => Alert.alert("Điều khoản", "Điều khoản sử dụng")}
            >
              <Text style={styles.footerLink}>Điều khoản</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>•</Text>
            <TouchableOpacity
              onPress={() => Alert.alert("Bảo mật", "Chính sách bảo mật")}
            >
              <Text style={styles.footerLink}>Bảo mật</Text>
            </TouchableOpacity>
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
    paddingTop: 50,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
    letterSpacing: 1,
  },
  // Login Method Toggle
  loginMethodContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeMethodButton: {
    backgroundColor: "#764ba2",
  },
  methodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#764ba2",
    marginLeft: 8,
  },
  activeMethodText: {
    color: "#FFFFFF",
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
  },
  // Input Groups
  inputGroup: {
    marginBottom: 20,
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
    marginBottom: 24,
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
    marginBottom: 24,
    shadowColor: "#f5576c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(118, 75, 162, 0.2)",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "#764ba2",
    fontWeight: "500",
  },
  // Social Buttons
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(118, 75, 162, 0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  socialIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  googleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  githubIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  googleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  socialButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  // Quick Login
  quickLoginContainer: {
    backgroundColor: "rgba(118, 75, 162, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  quickLoginTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#764ba2",
    marginBottom: 10,
    textAlign: "center",
  },
  quickLoginButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickLoginButton: {
    flex: 1,
    backgroundColor: "rgba(118, 75, 162, 0.1)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  quickLoginText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#764ba2",
  },
  // Sign Up
  signupContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 20,
  },
  signupLink: {
    color: "#f5576c",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  // Footer Links
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLink: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 8,
  },
  footerSeparator: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
  },
});
