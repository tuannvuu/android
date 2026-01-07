import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { verified } = useLocalSearchParams<{ verified: string }>();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ❌ Chặn vào thẳng URL
  if (verified !== "true") {
    Alert.alert("Lỗi", "Bạn chưa xác thực OTP");
    router.replace("/login");
    return null;
  }

  const handleResetPassword = async () => {
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu tối thiểu 6 ký tự");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    /**
     * 👉 Ở ĐÂY:
     * - Nếu bạn dùng Firebase Auth Email/Password:
     *   updatePassword(user, password)
     *
     * - Nếu bạn dùng DB riêng:
     *   gọi API update mật khẩu
     */

    Alert.alert("✅ Thành công", "Đổi mật khẩu thành công", [
      {
        text: "Đăng nhập",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt mật khẩu mới 🔐</Text>

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>XÁC NHẬN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#764ba2",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
