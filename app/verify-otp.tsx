import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
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

// Sửa cảnh báo ESLint: Sử dụng cú pháp mảng T[]
type InputRefsArray = (TextInput | null)[];

export default function VerifyOTPScreen() {
  const inputRefs = useRef<InputRefsArray>([]);

  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  // Hàm xử lý khi người dùng nhập OTP
  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1 || !/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Tự động focus đến ô tiếp theo khi nhập xong
    if (text && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Tự động xử lý verify khi nhập đủ 6 số
    if (index === 5 && text) {
      const otpCode = newOtp.join("");
      if (otpCode.length === 6) {
        handleVerifyOTP(otpCode);
      }
    }
  };

  // Hàm xử lý xóa ký tự
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

  // Hàm xác thực OTP
  const handleVerifyOTP = async (otpCode: string | null = null) => {
    const code = otpCode !== null ? otpCode : otp.join("");

    if (code.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setLoading(true);
    console.log("Verifying OTP:", code);

    // Giả lập gửi OTP lên server
    setTimeout(() => {
      setLoading(false);

      if (code === "123456") {
        Alert.alert("Thành công", "Xác thực OTP thành công!", [
          {
            text: "OK",
            // ✨ ĐIỀU CHỈNH LỚN: CHUYỂN HƯỚNG VỀ TRANG LOGIN
            onPress: () => router.push("/login"),
          },
        ]);
      } else {
        Alert.alert("Lỗi", "Mã OTP không đúng. Vui lòng thử lại.");
      }
    }, 1000);
  };

  // Hàm gửi lại OTP
  const handleResendOTP = () => {
    if (!isResendEnabled) return;

    setLoading(true);
    console.log("Resending OTP...");

    // Reset timer
    setResendTimer(60);
    setIsResendEnabled(false);

    // Giả lập gửi lại OTP
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Thành công", "Đã gửi lại mã OTP mới");

      // Bắt đầu đếm ngược
      startResendTimer();
    }, 1000);
  };

  // Timer đếm ngược để gửi lại OTP
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

  // Khởi động timer khi component mount
  useEffect(() => {
    startResendTimer();
  }, []);

  // Hàm điều hướng quay lại Login
  const handleGoToLogin = () => {
    router.push("/login");
  };

  // Hàm điều hướng quay lại Forgot Password
  const handleGoToForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <View style={[styles.container, { backgroundColor: "#667eea" }]}>
      <View style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[styles.logoContainer, { backgroundColor: "#f5576c" }]}
            >
              <Text style={{ fontSize: 28, color: "#FFFFFF" }}>🔐</Text>
            </View>
            <Text style={styles.logoText}>LiDoRa</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Verify OTP</Text>
            <Text style={styles.welcomeSubtitle}>
              We have sent a 6-digit OTP code to your phone number. (Code:
              123456)
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Enter OTP Code</Text>

              <View style={styles.otpInputsContainer}>
                {/* Render 6 ô TextInput */}
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
                  />
                ))}
              </View>
            </View>

            {/* Resend OTP Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                {isResendEnabled
                  ? "Didn't receive code? "
                  : `Resend code in ${resendTimer}s`}
              </Text>
              {isResendEnabled && (
                <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                { backgroundColor: "#f5576c" },
                loading && styles.verifyButtonDisabled,
              ]}
              onPress={() => handleVerifyOTP()}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.gradientButton}>
                <Text style={styles.verifyButtonText}>
                  {loading ? "⏳ Verifying..." : "Verify OTP"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Manual Entry Option */}
            <TouchableOpacity
              style={styles.manualEntryContainer}
              onPress={() => {
                Alert.prompt(
                  "Nhập OTP",
                  "Vui lòng nhập đầy đủ 6 số OTP:",
                  [
                    { text: "Hủy", style: "cancel" },
                    {
                      text: "Xác nhận",
                      onPress: (code?: string) => {
                        if (code && code.length === 6 && /^\d*$/.test(code)) {
                          setOtp(code.split(""));
                          handleVerifyOTP(code);
                        } else if (code && code.length !== 6) {
                          Alert.alert("Lỗi", "OTP phải có 6 chữ số.");
                        }
                      },
                    },
                  ],
                  "plain-text",
                  "",
                  Platform.OS === "ios" ? "numeric" : undefined
                );
              }}
            ></TouchableOpacity>
          </View>

          {/* Back Link Section */}
          <View style={styles.backContainer}>
            <Text style={styles.backText}>
              {`Want to `}
              {/* Link Forgot Password */}
              <TouchableOpacity onPress={handleGoToForgotPassword}>
                <Text style={styles.backLink}>Go Back to Forgot Password</Text>
              </TouchableOpacity>
              {/* Dấu phân cách và Link Login */}
              <Text style={styles.backText}>{" or "}</Text>
              <TouchableOpacity onPress={handleGoToLogin}>
                <Text style={styles.backLink}>Login</Text>
              </TouchableOpacity>
              <Text style={styles.backText}>?</Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    justifyContent: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingBottom: 50,
    justifyContent: "center",
    minHeight: Dimensions.get("window").height,
  },
  // Header styles
  header: {
    alignItems: "center",
    marginBottom: 50,
    marginTop: 50,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#f5576c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Welcome styles
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 15,
    lineHeight: 22,
  },
  // Form Card styles
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  // OTP styles
  otpContainer: {
    marginBottom: 25,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#764ba2",
    marginBottom: 15,
    textAlign: "center",
  },
  otpInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    backgroundColor: "#f9f5ff",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#4c1d95",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  otpInputFilled: {
    borderColor: "#f5576c",
    backgroundColor: "#fff5f7",
  },
  // Resend styles
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  resendText: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f5576c",
    textDecorationLine: "underline",
  },
  // Verify Button styles
  verifyButton: {
    width: "100%",
    borderRadius: 15,
    marginBottom: 15,
    height: 55,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Manual Entry
  manualEntryContainer: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  manualEntryText: {
    fontSize: 14,
    color: "#764ba2",
    textDecorationLine: "underline",
  },
  // Back Link styles
  backContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    flexWrap: "wrap", // Cho phép xuống dòng nếu màn hình nhỏ
  },
  backText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  backLink: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f093fb",
    textDecorationLine: "underline",
  },
});
