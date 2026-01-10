import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, RotateCw, Shield } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";

type InputRefsArray = (TextInput | null)[];

const { width } = Dimensions.get("window");

export default function VerifyOTPScreen() {
  const inputRefs = useRef<InputRefsArray>([]);
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [resetMethod] = useState("phone");
  const [attempts, setAttempts] = useState(0);
  const { phone } = useLocalSearchParams<{ phone: string }>();

  // Xử lý khi người dùng nhập OTP
  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1 || !/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Tự động focus đến ô tiếp theo
    if (text && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Tự động xác thực khi nhập đủ 6 số
    if (index === 5 && text) {
      const otpCode = newOtp.join("");
      if (otpCode.length === 6) {
        handleVerifyOTP(otpCode);
      }
    }
  };

  // Xử lý xóa ký tự
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Xác thực OTP (DEMO MODE)
  const handleVerifyOTP = async (otpCode: string | null = null) => {
    const code = otpCode !== null ? otpCode : otp.join("");

    // Kiểm tra đầu vào
    if (code.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setLoading(true);

    // Tăng số lần thử
    setAttempts((prev) => prev + 1);

    // DEMO: Chỉ chấp nhận mã 123456
    setTimeout(() => {
      setLoading(false);

      if (code === "123456") {
        Alert.alert(
          "🎉 Thành công!",
          "Xác thực OTP thành công! Vui lòng tạo mật khẩu mới.",
          [
            {
              text: "Tiếp tục",
              onPress: () =>
                router.push({
                  pathname: "/reset-password",
                  params: {
                    phone: phone, // ✅ TRUYỀN SĐT SANG RESET PASSWORD
                  },
                }),
            },
          ]
        );
      } else if (code === "000000") {
        Alert.alert(
          "Thông báo demo",
          "Mã 000000 là để demo lỗi. Hãy nhập 123456 để thành công."
        );
      } else {
        // Kiểm tra số lần thử
        if (attempts >= 3) {
          Alert.alert(
            "⚠️ Quá nhiều lần thử",
            "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã OTP mới.",
            [
              {
                text: "Gửi lại mã",
                onPress: handleResendOTP,
              },
            ]
          );
          return;
        }

        Alert.alert(
          "❌ Mã OTP không chính xác",
          `Mã bạn nhập không đúng. (Thử lần ${attempts}/3)\n\nHãy nhập: 123456`
        );
      }
    }, 1000);
  };

  // Gửi lại OTP (DEMO)
  const handleResendOTP = () => {
    if (!isResendEnabled) return;

    setLoading(true);
    console.log("📨 [DEMO] Đang gửi lại OTP...");

    // Reset timer
    setResendTimer(60);
    setIsResendEnabled(false);

    // Reset số lần thử
    setAttempts(0);

    // Reset OTP fields
    setOtp(["", "", "", "", "", ""]);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "📨 Đã gửi lại mã OTP",
        "Mã OTP mới (123456) đã được gửi đến bạn.\n\nVui lòng nhập mã 123456 để tiếp tục.",
        [
          {
            text: "Đã hiểu",
            onPress: () => {
              // Focus vào ô đầu tiên
              const firstInput = inputRefs.current[0];
              if (firstInput) {
                firstInput.focus();
              }
            },
          },
        ]
      );
      startResendTimer();
    }, 1000);
  };

  // Timer đếm ngược
  const startResendTimer = () => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  };

  useEffect(() => {
    startResendTimer();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  // Nhập OTP thủ công
  const handleManualEntry = () => {
    Alert.prompt(
      "Nhập OTP thủ công",
      `Nhập đầy đủ 6 số OTP đã được gửi đến ${
        resetMethod === "phone" ? "số điện thoại" : "email"
      } của bạn:\n\n(Demo: 123456)`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: (code?: string) => {
            if (code && code.length === 6 && /^\d{6}$/.test(code)) {
              setOtp(code.split(""));
              handleVerifyOTP(code);
            } else if (code && code.length !== 6) {
              Alert.alert("Lỗi", "OTP phải có đúng 6 chữ số.");
            }
          },
        },
      ],
      "plain-text",
      "123456",
      "numeric"
    );
  };

  // Tự động điền mã demo
  const fillDemoOTP = () => {
    const demoOTP = "123456".split("");
    setOtp(demoOTP);

    // Focus vào ô cuối cùng
    const lastInput = inputRefs.current[5];
    if (lastInput) {
      lastInput.focus();
    }

    Alert.alert("✅ Đã điền mã demo", "Nhấn 'XÁC THỰC OTP' để tiếp tục.");
  };

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2", "#f093fb"]}
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
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={["#f093fb", "#f5576c"]}
              style={styles.logoContainer}
            >
              <Shield size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.logoText}>LiDoRa</Text>
            <Text style={styles.tagline}>Xác thực OTP (Chế độ Demo)</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Xác Thực Mã OTP 🔐</Text>
            <Text style={styles.welcomeSubtitle}>
              Đây là chế độ DEMO. Hãy nhập mã:{" "}
              <Text style={{ fontWeight: "bold", color: "#f5576c" }}>
                123456
              </Text>
            </Text>
          </View>

          {/* Demo Banner */}
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>
              🎬 CHẾ ĐỘ DEMO - Nhập mã: 123456
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Nhập mã OTP 6 số</Text>

              <View style={styles.otpInputsContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TextInput
                    key={index}
                    ref={(ref: TextInput | null) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      otp[index] && styles.otpInputFilled,
                    ]}
                    value={otp[index]}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    editable={!loading}
                    selectTextOnFocus
                    textAlign="center"
                  />
                ))}
              </View>

              {/* OTP Hint */}
              <Text style={styles.otpHint}>
                ⏱️ Mã OTP có hiệu lực trong 5 phút
              </Text>
            </View>

            {/* Auto-fill Demo Button */}
            <TouchableOpacity
              style={styles.demoFillButton}
              onPress={fillDemoOTP}
              disabled={loading}
            >
              <Text style={styles.demoFillButtonText}>
                ⚡ Tự động điền mã demo (123456)
              </Text>
            </TouchableOpacity>

            {/* Resend OTP Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                {isResendEnabled
                  ? "Không nhận được mã? "
                  : `Gửi lại mã sau ${resendTimer} giây`}
              </Text>
              {isResendEnabled && (
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  disabled={loading}
                >
                  <RotateCw size={16} color="#f5576c" />
                  <Text style={styles.resendLink}> Gửi lại mã</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                loading && styles.verifyButtonDisabled,
              ]}
              onPress={() => handleVerifyOTP()}
              disabled={loading || otp.join("").length !== 6}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  otp.join("").length === 6
                    ? ["#f093fb", "#f5576c"]
                    : ["#ccc", "#999"]
                }
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? "⏳ Đang xác thực..." : "XÁC THỰC OTP"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Alternative Options */}
            <View style={styles.alternativeOptions}>
              <TouchableOpacity
                style={styles.alternativeButton}
                onPress={handleManualEntry}
              >
                <Text style={styles.alternativeButtonText}>
                  📝 Nhập OTP thủ công
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.alternativeButton}
                onPress={() => {
                  Alert.alert(
                    "Demo Mode",
                    "Đây là chế độ demo. Tính năng đổi phương thức sẽ hoạt động trong môi trường thực tế."
                  );
                }}
              >
                <Text style={styles.alternativeButtonText}>
                  🔄 Đổi phương thức (Demo)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Instructions */}
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>📋 Hướng dẫn sử dụng DEMO:</Text>
              <Text style={styles.demoText}>
                • Nhập <Text style={styles.demoCode}>123456</Text> để thành công
              </Text>
              <Text style={styles.demoText}>
                • Nhập <Text style={styles.demoCode}>000000</Text> để xem lỗi
                demo
              </Text>
              <Text style={styles.demoText}>
                • Các mã khác: Hiển thị thông báo lỗi
              </Text>
              <Text style={styles.demoText}>
                • Số lần thử: {attempts}/3 (Reset khi gửi lại mã)
              </Text>
            </View>
          </View>

          {/* Need Help Section */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Cần hỗ trợ?{" "}
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Hỗ trợ DEMO",
                    "Đây là ứng dụng demo. Trong môi trường thực tế, hãy liên hệ bộ phận hỗ trợ."
                  )
                }
              >
                <Text style={styles.helpLink}>Thông tin demo</Text>
              </TouchableOpacity>
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
    paddingBottom: 20,
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
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
    letterSpacing: 1,
  },
  // Welcome Section
  welcomeSection: {
    alignItems: "center",
    marginBottom: 15,
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
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  // Demo Banner
  demoBanner: {
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  demoBannerText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFC107",
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
  // OTP Container
  otpContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#764ba2",
    marginBottom: 20,
    textAlign: "center",
  },
  otpInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  otpInput: {
    width: 50,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
    borderWidth: 2,
    borderColor: "rgba(118, 75, 162, 0.2)",
  },
  otpInputFilled: {
    borderColor: "#f5576c",
    backgroundColor: "#fff5f7",
    shadowColor: "#f5576c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  otpHint: {
    fontSize: 14,
    color: "#764ba2",
    textAlign: "center",
    marginTop: 10,
  },
  // Demo Fill Button
  demoFillButton: {
    backgroundColor: "rgba(118, 75, 162, 0.15)",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(118, 75, 162, 0.3)",
  },
  demoFillButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#764ba2",
  },
  // Resend Container
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  resendText: {
    fontSize: 15,
    color: "#666",
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  resendLink: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f5576c",
    textDecorationLine: "underline",
  },
  // Verify Button
  verifyButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#f5576c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Alternative Options
  alternativeOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  alternativeButton: {
    flex: 1,
    backgroundColor: "rgba(118, 75, 162, 0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(118, 75, 162, 0.2)",
  },
  alternativeButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#764ba2",
    textAlign: "center",
  },
  // Demo Container
  demoContainer: {
    backgroundColor: "rgba(118, 75, 162, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#764ba2",
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: "#764ba2",
    marginBottom: 6,
    lineHeight: 20,
  },
  demoCode: {
    fontWeight: "bold",
    color: "#f5576c",
  },
  // Help Container
  helpContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  helpText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  helpLink: {
    color: "#00f2fe",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
