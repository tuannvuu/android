import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  Check,
  Eye,
  EyeOff,
  Film,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { db } from "../config/firebase";

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

export default function RegisterScreen() {
  // Đồng bộ tên biến: Dùng 'fullName' thay cho 'name'
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = async () => {
    // Kiểm tra các điều kiện cơ bản
    if (!phone || !password || !fullName) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert("Lỗi", "Số điện thoại phải đủ 10 chữ số");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (!termsAccepted) {
      Alert.alert("Lỗi", "Bạn phải đồng ý với điều khoản sử dụng");
      return;
    }

    try {
      setLoading(true);

      // 1. Kiểm tra xem số điện thoại đã tồn tại chưa
      const userRef = doc(db, "users", phone.trim());
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        Alert.alert("Lỗi", "Số điện thoại này đã được đăng ký!");
        return;
      }

      // 2. Tạo tài khoản mới trong Firestore
      await setDoc(userRef, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        password: password,
        createdAt: serverTimestamp(),
        role: "user",
      });

      Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      console.error("Register Error:", error.message);
      Alert.alert("Lỗi", "Không thể đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  const handlePhoneChange = (text: string) => {
    // chỉ cho nhập số
    const onlyNumbers = text.replace(/[^0-9]/g, "");

    // giới hạn 10 số
    if (onlyNumbers.length <= 10) {
      setPhone(onlyNumbers);
    }
  };

  // Cập nhật hàm kiểm tra valid
  const isFormValid = () => {
    return fullName && phone && password && confirmPassword && termsAccepted;
  };

  return (
    <LinearGradient
      colors={["#4facfe", "#00f2fe", "#667eea"]}
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
              colors={["#4facfe", "#00f2fe"]}
              style={styles.logoContainer}
            >
              <Film size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.logoText}>LiDoRa</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Đăng Ký Tài Khoản</Text>
            <Text style={styles.welcomeSubtitle}>
              Hãy bắt đầu hành trình điện ảnh của bạn cùng chúng tôi!
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <User size={18} color="#4facfe" />
                <Text style={styles.labelText}>Họ và tên</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Tuấn Vũ"
                placeholderTextColor="#a78bfa"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Mail size={18} color="#4facfe" />
                <Text style={styles.labelText}>Số điện thoại</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="0xxxxxxxxx"
                placeholderTextColor="#a78bfa"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Lock size={18} color="#4facfe" />
                <Text style={styles.labelText}>Mật khẩu</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholderTextColor="#a78bfa"
                  placeholder="••••••••"
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
                    <EyeOff size={20} color="#4facfe" />
                  ) : (
                    <Eye size={20} color="#4facfe" />
                  )}
                </TouchableOpacity>
              </View>
              {password.length > 0 && password.length < 6 && (
                <Text style={styles.errorText}>
                  Mật khẩu phải có ít nhất 6 ký tự
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Lock size={18} color="#4facfe" />
                <Text style={styles.labelText}>Xác nhận mật khẩu</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#a78bfa"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#4facfe" />
                  ) : (
                    <Eye size={20} color="#4facfe" />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>Mật khẩu không khớp</Text>
              )}
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checked]}>
                {termsAccepted && <Check size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                Tôi đồng ý với{" "}
                <Text style={styles.termsLink}>Điều khoản & Điều kiện</Text> và{" "}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (!isFormValid() || loading) && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={!isFormValid() || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isFormValid() ? ["#4facfe", "#00f2fe"] : ["#ccc", "#999"]
                }
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? "Đăng Ký..." : "Đăng Ký"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Đã có tài khoản?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
              <Link href="/login" asChild>
                <TouchableOpacity style={styles.signinButton}>
                  <LinearGradient
                    colors={["transparent", "transparent"]}
                    style={styles.signinGradient}
                  >
                    <Text style={styles.signinButtonText}>Đăng nhập ngay</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            </View>
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
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -width * 0.15,
    right: -width * 0.1,
  },
  circle2: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: width * 0.5,
    left: -width * 0.1,
  },
  circle3: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -width * 0.2,
    right: -width * 0.1,
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
    marginTop: 10,
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
    color: "#4facfe",
    marginLeft: 8,
  },
  input: {
    height: 58,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "rgba(79, 172, 254, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    shadowColor: "#4facfe",
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
    borderColor: "rgba(79, 172, 254, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingRight: 60,
    fontSize: 16,
    color: "#333",
    shadowColor: "#4facfe",
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
  errorText: {
    fontSize: 12,
    color: "#ff6b6b",
    marginTop: 6,
    marginLeft: 4,
  },
  // Terms and Conditions
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
    marginTop: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4facfe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checked: {
    backgroundColor: "#4facfe",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  termsLink: {
    color: "#4facfe",
    fontWeight: "600",
  },
  // Register Button
  registerButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(79, 172, 254, 0.2)",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#4facfe",
    fontWeight: "500",
  },
  // Sign In
  signinContainer: {
    alignItems: "center",
  },
  signinButton: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#4facfe",
    width: "100%",
  },
  signinGradient: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  signinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4facfe",
  },
});
