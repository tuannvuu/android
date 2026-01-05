import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../config/firebase";

const { width } = Dimensions.get("window");

// Constants
const SEAT_PRICES = {
  A: 75000, // Standard
  B: 75000, // Standard
  C: 85000, // Premium
};

const SEATS_PER_ROW = 10;
const ROWS = ["A", "B", "C"];

export default function SelectSeatScreen() {
  const { movieId, showtimeId, cinemaId } = useLocalSearchParams<{
    movieId: string;
    showtimeId: string;
    cinemaId: string;
  }>();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Tính tổng tiền dựa trên hàng ghế
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seat) => {
      const row = seat[0];
      // SEAT_PRICES cần được định nghĩa ở ngoài hoặc trong component này
      const price = row === "C" ? 85000 : 75000;
      return total + price;
    }, 0);
  }, [selectedSeats]);

  // 3. Hàm xử lý logic đặt vé
  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một ghế");
      return;
    }

    // ❗ CHẶN NGAY NẾU THIẾU ID
    if (!movieId || !showtimeId || !cinemaId) {
      Alert.alert(
        "Lỗi",
        "Thiếu thông tin phim hoặc suất chiếu. Vui lòng chọn lại."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingRef = await addDoc(collection(db, "bookings"), {
        movieId: movieId, // ✅ ID thật movies
        showtimeId: showtimeId, // ✅ ID thật showtimes
        cinemaId: cinemaId, // ✅ ID thật cinemas

        seats: selectedSeats,
        totalPrice: totalPrice,
        status: "PENDING",
        userId: auth.currentUser?.uid || "guest",
        createdAt: serverTimestamp(),
      });

      router.push({
        pathname: "/payment",
        params: { bookingId: bookingRef.id },
      });
    } catch (error) {
      console.error("Lỗi tạo booking:", error);
      Alert.alert("Lỗi", "Không thể khởi tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeat = (row: string, seatNum: number) => {
    const seatId = `${row}${seatNum}`;
    const isSelected = selectedSeats.includes(seatId);
    const isPremium = row === "C";

    return (
      <TouchableOpacity
        key={seatId}
        onPress={() => toggleSeat(seatId)}
        style={[
          styles.seat,
          isSelected && styles.selectedSeat,
          isPremium && styles.premiumSeat,
        ]}
        activeOpacity={0.7}
        disabled={isSubmitting} // Khóa ghế khi đang xử lý
      >
        {isSelected ? (
          <Ionicons name="checkmark" size={14} color="#FFF" />
        ) : (
          <Text
            style={[
              styles.seatNumber,
              isSelected && styles.selectedSeatNumber,
              isPremium && styles.premiumSeatNumber,
            ]}
          >
            {seatNum}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderRow = (row: string) => {
    const price = SEAT_PRICES[row as keyof typeof SEAT_PRICES];
    const isPremium = row === "C";
    const rowType = row === "C" ? "PREMIUM" : "STANDARD";

    return (
      <View key={row} style={styles.rowContainer}>
        {/* Row Header */}
        <View style={styles.rowHeader}>
          <Text style={styles.rowLetter}>{row}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {price.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        </View>

        {/* Seats */}
        <View style={styles.seatsRow}>
          {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map((num) => (
            <React.Fragment key={num}>
              {renderSeat(row, num)}
              {num === 5 && <View style={styles.aisle} />}
            </React.Fragment>
          ))}
        </View>

        {/* Row Type Label */}
        <Text style={[styles.rowTypeLabel, isPremium && styles.premiumLabel]}>
          {rowType}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.timeContainer}>
          <Text>Showtime: {showtimeId}</Text>
          <Text style={styles.formatText}>• 2D Phụ đề</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Screen Section */}
        <View style={styles.screenSection}>
          <View style={styles.screen}>
            <Text style={styles.screenText}>MÀN HÌNH</Text>
          </View>
          <Text style={styles.screenHint}>Tất cả ghế đều trống</Text>
        </View>

        {/* Seat Map */}
        <View style={styles.seatMap}>{ROWS.map(renderRow)}</View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, styles.availableIcon]} />
            <Text style={styles.legendText}>Có sẵn</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, styles.selectedIcon]} />
            <Text style={styles.legendText}>Đã chọn</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, styles.premiumIcon]} />
            <Text style={styles.legendText}>Premium</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.selectionInfo}>
            <View style={styles.seatCountBadge}>
              <Text style={styles.seatCount}>{selectedSeats.length}</Text>
              <Text style={styles.seatCountLabel}>ghế</Text>
            </View>
            <View style={styles.seatDetails}>
              <Text style={styles.seatNumbers}>
                {selectedSeats.sort().join(", ") || "Chưa chọn ghế"}
              </Text>
              <Text style={styles.totalPrice}>
                {totalPrice.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              // Vô hiệu hóa nút nếu chưa chọn ghế hoặc đang xử lý gửi dữ liệu
              (selectedSeats.length === 0 || isSubmitting) &&
                styles.disabledButton,
            ]}
            disabled={selectedSeats.length === 0 || isSubmitting}
            // ✅ THAY ĐỔI TẠI ĐÂY: Gọi hàm handleContinue để lưu vào Firestore
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedSeats.length === 0
                  ? ["#666", "#444"]
                  : ["#FF6B6B", "#FF8E53"]
              }
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {/* ✅ HIỂN THỊ LOADING: Nếu đang xử lý thì hiện vòng xoay, không thì hiện chữ */}
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.continueText}>TIẾP TỤC</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    backgroundColor: "#1A1A1A",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  timeContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  timeText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  formatText: {
    color: "#999",
    fontSize: 16,
    marginLeft: 8,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  screenSection: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  screen: {
    width: width * 0.85,
    height: 30,
    backgroundColor: "#333",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  screenText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
  },
  screenHint: {
    color: "#999",
    fontSize: 14,
  },
  seatMap: {
    paddingHorizontal: 20,
  },
  rowContainer: {
    marginBottom: 30,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  rowLetter: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    width: 30,
    textAlign: "center",
  },
  priceContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  priceText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  seatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  seat: {
    width: 35,
    height: 35,
    borderRadius: 6,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  seatNumber: {
    color: "#CCC",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedSeat: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF5252",
    transform: [{ scale: 1.1 }],
  },
  selectedSeatNumber: {
    color: "#FFF",
  },
  premiumSeat: {
    backgroundColor: "rgba(106, 13, 173, 0.2)",
    borderColor: "#6A0DAD",
  },
  premiumSeatNumber: {
    color: "#BA55D3",
  },
  aisle: {
    width: 20,
  },
  rowTypeLabel: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  premiumLabel: {
    color: "#BA55D3",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    gap: 30,
    paddingHorizontal: 20,
  },
  legendItem: {
    alignItems: "center",
    width: 80,
  },
  legendIcon: {
    width: 25,
    height: 25,
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 6,
  },
  availableIcon: {
    backgroundColor: "#333",
    borderColor: "#444",
  },
  selectedIcon: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF5252",
  },
  premiumIcon: {
    backgroundColor: "rgba(106, 13, 173, 0.2)",
    borderColor: "#6A0DAD",
  },
  legendText: {
    color: "#CCC",
    fontSize: 12,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1A1A1A",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    paddingTop: 15,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 15,
  },
  selectionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  seatCountBadge: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  seatCount: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
  },
  seatCountLabel: {
    color: "#FF6B6B",
    fontSize: 10,
    fontWeight: "600",
    marginTop: -3,
  },
  seatDetails: {
    flex: 1,
  },
  seatNumbers: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  totalPrice: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
  },
  continueButton: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 130,
  },
  disabledButton: {
    opacity: 0.6,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 14,
    gap: 8,
  },
  continueText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
