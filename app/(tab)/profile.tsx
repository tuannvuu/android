import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { get, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebase"; // Đảm bảo đường dẫn đúng

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const userPhone = "0796573363"; // Thực tế sẽ lấy từ AsyncStorage sau khi login

  useEffect(() => {
    // Lấy thông tin từ Database dựa trên SĐT
    const fetchUserData = async () => {
      try {
        const userRef = ref(db, "users/" + userPhone);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn thoát?", [
      { text: "Hủy", style: "cancel" },
      { text: "Thoát", onPress: () => router.replace("/login") },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header Profile */}
      <LinearGradient
        colors={["#1a2a6c", "#b21f1f", "#fdbb2d"]}
        style={styles.headerCard}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-alt" size={40} color="#FFF" />
          </View>
          <TouchableOpacity style={styles.editBadge}>
            <MaterialIcons name="edit" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>
          {userData?.fullName || "Đang tải..."}
        </Text>
        <Text style={styles.userPhone}>{userData?.phone || userPhone}</Text>
      </LinearGradient>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="receipt-outline" size={24} color="#fdbb2d" />
          <Text style={styles.menuText}>Lịch sử đặt vé</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={24} color="#4facfe" />
          <Text style={styles.menuText}>Phương thức thanh toán</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <Ionicons name="settings-outline" size={24} color="#00f2fe" />
          <Text style={styles.menuText}>Cài đặt</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LinearGradient
          colors={["#f5576c", "#f093fb"]}
          style={styles.logoutGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.logoutText}>ĐĂNG XUẤT</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0F" },
  headerCard: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatarContainer: { position: "relative", marginBottom: 15 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4facfe",
    padding: 6,
    borderRadius: 15,
  },
  userName: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  userPhone: { color: "rgba(255,255,255,0.8)", fontSize: 16, marginTop: 5 },
  menuSection: {
    backgroundColor: "#161622",
    margin: 20,
    borderRadius: 20,
    padding: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  menuText: { flex: 1, color: "#FFF", fontSize: 16, marginLeft: 15 },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
  logoutGradient: { paddingVertical: 15, alignItems: "center" },
  logoutText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
