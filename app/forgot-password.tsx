import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Key, Mail, Smartphone } from "lucide-react-native";
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

// Màn hình Quên Mật khẩu
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMethod] = useState("phone");

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(
        "Lỗi",
        `Vui lòng nhập ${
          resetMethod === "phone" ? "số điện thoại" : "email"
        } để đặt lại mật khẩu.`
      );
      return;
    }

    setLoading(true);

    console.log(`Đang gửi liên kết đặt lại mật khẩu đến: ${email}`);

    // Mô phỏng gửi email/SMS
    setTimeout(() => {
      setLoading(false);
      // ✅ Đã bỏ Alert, điều hướng trực tiếp sang trang nhập OTP
      router.push("/verify-otp");
    }, 1000);
  };

  // Hàm điều hướng quay lại Login
  const handleGoBackToLogin = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={["#4facfe", "#00f2fe", "#667eea"]}
      style={styles.container}
    >
      {/* Decorative Circles */}
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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBackToLogin}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              style={styles.logoContainer}
            >
              <Key size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.logoText}>LiDoRa</Text>
            <Text style={styles.tagline}>Đặt lại mật khẩu</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Quên Mật Khẩu? 🔐</Text>
            <Text style={styles.welcomeSubtitle}>
              Nhập {resetMethod === "phone" ? "số điện thoại" : "email"} của
              bạn. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email/Phone Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                {resetMethod === "phone" ? (
                  <Smartphone size={20} color="#4facfe" />
                ) : (
                  <Mail size={20} color="#4facfe" />
                )}
                <Text style={styles.labelText}>
                  {resetMethod === "phone" ? "Số điện thoại" : "Email"}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={
                  resetMethod === "phone" ? "09xxxxxxxx" : "you@example.com"
                }
                placeholderTextColor="#a78bfa"
                value={email}
                onChangeText={setEmail}
                keyboardType={
                  resetMethod === "phone" ? "phone-pad" : "email-address"
                }
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                📱 Mã OTP sẽ được gửi qua SMS hoặc email trong vòng 60 giây.
              </Text>
              <Text style={styles.instructionsText}>
                ⏳ Mã có hiệu lực trong 5 phút.
              </Text>
              <Text style={styles.instructionsText}>
                🔒 Đảm bảo thông tin của bạn chính xác.
              </Text>
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                loading && styles.resetButtonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={email ? ["#4facfe", "#00f2fe"] : ["#ccc", "#999"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.resetButtonText}>
                  {loading ? "⏳ Đang gửi..." : "GỬI MÃ XÁC NHẬN"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Alternative Options */}
            <View style={styles.alternativeOptions}>
              <TouchableOpacity
                style={styles.alternativeButton}
                onPress={() =>
                  Alert.alert(
                    "Liên hệ hỗ trợ",
                    "Vui lòng gọi 1900 1234 để được hỗ trợ trực tiếp."
                  )
                }
              >
                <Text style={styles.alternativeButtonText}>
                  📞 Liên hệ hỗ trợ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.alternativeButton}
                onPress={() =>
                  Alert.alert(
                    "Câu hỏi bảo mật",
                    "Vui lòng liên hệ bộ phận CSKH để đặt lại câu hỏi bảo mật."
                  )
                }
              >
                <Text style={styles.alternativeButtonText}>
                  🔐 Câu hỏi bảo mật
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Back to Login Link */}
          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>
              Nhớ mật khẩu rồi?{" "}
              <TouchableOpacity onPress={handleGoBackToLogin}>
                <Text style={styles.backToLoginLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </Text>
          </View>

          {/* Security Tips */}
          <View style={styles.securityTips}>
            <Text style={styles.securityTipsTitle}>💡 Mẹo bảo mật:</Text>
            <Text style={styles.securityTipsText}>
              • Không chia sẻ mật khẩu với bất kỳ ai
            </Text>
            <Text style={styles.securityTipsText}>
              • Sử dụng mật khẩu mạnh (chữ hoa, số, ký tự đặc biệt)
            </Text>
            <Text style={styles.securityTipsText}>
              • Đổi mật khẩu định kỳ 3 tháng/lần
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
  // Back Button
  backButton: {
    position: "absolute",
    top: 50,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Header
  header: {
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 25,
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
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    letterSpacing: 1,
  },
  // Welcome Section
  welcomeSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  // Method Toggle
  methodContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 25,
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
    backgroundColor: "#4facfe",
  },
  methodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4facfe",
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
    marginBottom: 25,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4facfe",
    marginLeft: 10,
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
  // Instructions
  instructionsContainer: {
    backgroundColor: "rgba(79, 172, 254, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
  },
  instructionsText: {
    fontSize: 14,
    color: "#4facfe",
    marginBottom: 8,
    lineHeight: 20,
  },
  // Reset Button
  resetButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  // Alternative Options
  alternativeOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  alternativeButton: {
    flex: 1,
    backgroundColor: "rgba(79, 172, 254, 0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(79, 172, 254, 0.2)",
  },
  alternativeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4facfe",
  },
  // Back to Login
  backToLoginContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 20,
  },
  backToLoginText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  backToLoginLink: {
    color: "#00f2fe",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  // Security Tips
  securityTips: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  securityTipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  securityTipsText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 6,
    lineHeight: 20,
  },
});
