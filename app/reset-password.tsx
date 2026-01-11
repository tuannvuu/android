import { useLocalSearchParams, useRouter } from "expo-router";
import {} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../config/firebase";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const handleResetPassword = async () => {
    if (!phone) {
      showError("Không xác định được số điện thoại");
      return;
    }

    if (!currentPassword) {
      showError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (password.length < 6) {
      showError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirm) {
      showError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (currentPassword === password) {
      showError("Mật khẩu mới không được trùng mật khẩu cũ");
      return;
    }

    setLoading(true);

    try {
      const q = query(collection(db, "users"), where("phone", "==", phone));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        showError("Tài khoản không tồn tại");
        return;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      // 🔐 so sánh với Firestore
      if (userData.password !== currentPassword) {
        showError("Mật khẩu hiện tại không đúng");
        return;
      }

      await updateDoc(userDoc.ref, {
        password,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("✅ Thành công", "Đổi mật khẩu thành công", [
        {
          text: "Đăng nhập",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (error) {
      console.error(error);
      showError("Không thể cập nhật mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Đặt mật khẩu mới</Text>
          <Text style={styles.subtitle}>
            Mật khẩu mới phải có ít nhất 6 ký tự
          </Text>
        </View>

        <View style={styles.form}>
          {/* Current Password */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Mật khẩu hiện tại</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#999"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <View style={styles.inputLine} />
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Mật khẩu mới</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <View style={styles.inputLine} />
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Xác nhận mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#999"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
                autoCapitalize="none"
                editable={!loading}
              />
              <View style={styles.inputLine} />
            </View>
          </View>

          {/* Error Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showErrorModal}
            onRequestClose={() => setShowErrorModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Lỗi</Text>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.modalMessage}>{errorMessage}</Text>
                </View>
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowErrorModal(false)}
                  >
                    <Text style={styles.modalButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>ĐỔI MẬT KHẨU</Text>
            )}
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    color: "#333",
  },
  inputLine: {
    height: 1,
    backgroundColor: "#ddd",
    width: "100%",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#764ba2",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#764ba2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  backButton: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "#764ba2",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d9534f",
    textAlign: "center",
  },
  modalBody: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
  },
  modalFooter: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButton: {
    backgroundColor: "#764ba2",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
