import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Khởi tạo Firebase
import { auth, db } from "../../config/firebase";

export default function ProfileScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [bookingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user từ Firestore
  const fetchUserData = async () => {
    try {
      setLoading(true);

      // 🔴 LẤY PHONE ĐÃ LƯU KHI LOGIN
      const phone = await AsyncStorage.getItem("phone");

      if (!phone) {
        Alert.alert("Lỗi", "Không xác định được số điện thoại");
        return;
      }

      // ✅ documentId = phone
      const userDocRef = doc(db, "users", phone);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
        return;
      }

      const userData = userDoc.data();

      setUserInfo({
        phone: userData.phone,
        fullName: userData.fullName,
        email: "", // bạn chưa lưu email trong Firestore
        role: userData.role,
      });

      // 🔹 (Nếu cần) load lịch sử booking ở đây
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      return () => {};
    }, [])
  );

  // Xử lý chuyển đến trang reset-password
  const handleChangePassword = () => {
    if (!userInfo?.phone) {
      Alert.alert("Lỗi", "Không xác định được số điện thoại");
      return;
    }

    router.push({
      pathname: "/reset-password",
      params: { phone: userInfo.phone },
    });
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            // Xóa token hoặc thông tin đăng nhập từ AsyncStorage
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userInfo");

            // Đăng xuất khỏi Firebase
            await signOut(auth);

            // Chuyển về màn hình home
            router.replace("/login");
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Lỗi", "Đăng xuất thất bại");
          }
        },
      },
    ]);
  };

  // Định dạng ngày tháng
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate();
      return (
        date.toLocaleDateString("vi-VN") +
        " " +
        date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      return "N/A";
    }
  };

  // Định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#666" />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {userInfo?.fullName || "Chưa cập nhật"}
            </Text>
            <View style={styles.userDetail}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.userPhone}>
                {userInfo?.phone || "Chưa cập nhật"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleChangePassword}
          >
            <Ionicons name="lock-closed" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Đổi mật khẩu</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tab)")}
          >
            <Ionicons name="home" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Quay lại trang chủ</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.logoutText]}>
              Đăng xuất
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Booking History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={24} color="#333" />
            <Text style={styles.sectionTitle}>Lịch sử đơn hàng</Text>
          </View>

          {bookingHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Chưa có đơn hàng nào</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push("/(tab)")}
              >
                <Text style={styles.exploreButtonText}>Khám phá phim</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bookingHistory.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() =>
                  router.push(`/movie-details?id=${booking.movieId}`)
                }
              >
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingMovie}>
                    {booking.movieTitle || "Unknown Movie"}
                  </Text>
                  <Text
                    style={[
                      styles.bookingStatus,
                      booking.status === "confirmed"
                        ? styles.statusConfirmed
                        : styles.statusPending,
                    ]}
                  >
                    {booking.status === "confirmed"
                      ? "Đã xác nhận"
                      : "Chờ xử lý"}
                  </Text>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {formatDate(booking.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="film" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {booking.cinemaName || "Unknown Cinema"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {booking.showtime || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="ticket" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {booking.seats?.join(", ") || "N/A"}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingFooter}>
                  <Text style={styles.bookingTotal}>
                    Tổng tiền: {formatCurrency(booking.totalAmount || 0)}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  userCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  userDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
  },
  actionsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#FF3B30",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bookingCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bookingMovie: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  bookingStatus: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusConfirmed: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  statusPending: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  bookingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  bookingTotal: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
  },
});
