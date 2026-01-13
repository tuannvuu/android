import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
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
import { db } from "../config/firebase";

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
  const currentUserId = "USER_TEST_1";

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [seatLocks, setSeatLocks] = useState<any>({});

  const [loading, setLoading] = useState(true);
  const [isSubmitting] = useState(false);

  // 🔹 Load ghế đã bị giữ
  useEffect(() => {
    const loadSeats = async () => {
      try {
        const ref = doc(db, "showtimes", showtimeId);
        const snap = await getDoc(ref);

        const data = snap.data() || {};
        const locks = data.seatLocks || {};
        const now = Date.now();

        // 🔥 Clean lock quá 5 phút
        Object.keys(locks).forEach((seat) => {
          if (now - locks[seat].lockedAt > 5 * 60 * 1000) {
            delete locks[seat];
          }
        });

        await updateDoc(ref, { seatLocks: locks });

        setReservedSeats(data.reservedSeats || []);
        setSeatLocks(locks);
      } catch {
        Alert.alert("Lỗi", "Không thể tải trạng thái ghế");
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [showtimeId]);

  const isValidSeatSelection = (
    selectedSeats: string[],
    reservedSeats: string[]
  ) => {
    const rows = new Set([...selectedSeats, ...reservedSeats].map((s) => s[0]));

    for (const row of rows) {
      const selected = selectedSeats
        .filter((s) => s[0] === row)
        .map((s) => Number(s.slice(1)));

      const reserved = reservedSeats
        .filter((s) => s[0] === row)
        .map((s) => Number(s.slice(1)));

      // Không chọn ghế nào ở hàng này → bỏ qua
      if (selected.length === 0) continue;

      // Tạo map trạng thái ghế
      const seats: ("X" | "R" | "_")[] = [];

      for (let i = 1; i <= SEATS_PER_ROW; i++) {
        if (selected.includes(i)) seats.push("X");
        else if (reserved.includes(i)) seats.push("R");
        else seats.push("_");
      }

      // Quét tìm đoạn "_" dài đúng 1
      let emptyCount = 0;
      for (let i = 0; i < seats.length; i++) {
        if (seats[i] === "_") {
          emptyCount++;
        } else {
          if (emptyCount === 1) {
            return {
              valid: false,
              message: "Không được bỏ trống 1 ghế.",
            };
          }
          emptyCount = 0;
        }
      }

      // Check cuối hàng
      if (emptyCount === 1) {
        return {
          valid: false,
          message: "Không được bỏ trống 1 ghế.",
        };
      }
    }

    return { valid: true };
  };

  // Tính tổng tiền dựa trên hàng ghế
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seat) => {
      const row = seat[0];
      const price = SEAT_PRICES[row as keyof typeof SEAT_PRICES] || 75000;
      return total + price;
    }, 0);
  }, [selectedSeats]);

  const toggleSeat = (seatId: string) => {
    if (reservedSeats.includes(seatId)) return;

    setSelectedSeats((prev) => {
      const next = prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId];

      const check = isValidSeatSelection(next, reservedSeats);

      if (!check.valid) {
        Alert.alert("Thông báo", check.message);
        return prev; // ❌ rollback
      }

      return next; // ✅ hợp lệ
    });
  };

  // Hàm xử lý logic đặt vé
  const handleContinue = async () => {
    const ref = doc(db, "showtimes", showtimeId);
    const snap = await getDoc(ref);

    const seatLocks = snap.data()?.seatLocks || {};
    const now = Date.now();
    const userId = "CURRENT_USER_ID";

    selectedSeats.forEach((seat) => {
      seatLocks[seat] = {
        userId,
        lockedAt: now,
      };
    });

    await updateDoc(ref, { seatLocks });

    router.push({
      pathname: "/payment",
      params: {
        movieId,
        showtimeId,
        cinemaId,
        seats: JSON.stringify(selectedSeats),
        totalPrice: String(totalPrice),
      },
    });
  };

  // 🔹 Render ghế với 4 màu khác nhau
  const renderSeat = (row: string, num: number) => {
    const id = `${row}${num}`;
    const isSelected = selectedSeats.includes(id);
    const isReserved = reservedSeats.includes(id);
    const isPremium = row === "C";
    const isLocked = seatLocks[id] && seatLocks[id].userId !== currentUserId;

    // Xác định style dựa trên trạng thái
    let seatStyle;
    let textStyle;

    if (isReserved) {
      seatStyle = styles.reservedSeat; // Màu đỏ cho ghế đã đặt
      textStyle = styles.reservedSeatText;
    } else if (isSelected) {
      seatStyle = styles.selectedSeat; // Màu xanh dương cho ghế đã chọn
      textStyle = styles.selectedSeatText;
    } else if (isPremium) {
      seatStyle = styles.premiumSeat; // Màu vàng cho ghế premium
      textStyle = styles.premiumSeatText;
    } else {
      seatStyle = styles.availableSeat; // Màu xám cho ghế có sẵn
      textStyle = styles.availableSeatText;
    }

    return (
      <TouchableOpacity
        key={id}
        disabled={isReserved || isLocked}
        onPress={() => toggleSeat(id)}
        style={[seatStyle, (isReserved || isLocked) && styles.disabledSeat]}
      >
        <Text style={textStyle}>{num}</Text>
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

  // Hiển thị loading khi đang tải
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Đang tải thông tin ghế...</Text>
      </View>
    );
  }

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
          <Text style={styles.showtimeText}>Suất chiếu: {showtimeId}</Text>
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
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, styles.reservedIcon]} />
            <Text style={styles.legendText}>Đã đặt</Text>
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
              <Text style={styles.seatNumbers} numberOfLines={1}>
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
              (selectedSeats.length === 0 || isSubmitting) &&
                styles.disabledButton,
            ]}
            disabled={selectedSeats.length === 0 || isSubmitting}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedSeats.length === 0 || isSubmitting
                  ? ["#666", "#444"]
                  : ["#FF6B6B", "#FF8E53"]
              }
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E1E",
  },
  backButton: {
    padding: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  showtimeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  formatText: {
    color: "#999",
    fontSize: 12,
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
    marginTop: 24,
    marginBottom: 32,
  },
  screen: {
    width: width * 0.7,
    height: 20,
    backgroundColor: "#2C2C2C",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  screenText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "600",
  },
  screenHint: {
    color: "#666",
    fontSize: 12,
  },
  seatMap: {
    paddingHorizontal: 16,
  },
  rowContainer: {
    marginBottom: 24,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  rowLetter: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    width: 30,
  },
  priceContainer: {
    backgroundColor: "#2C2C2C",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  seatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  // Ghế có sẵn - Màu xám
  availableSeat: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#4A5568", // Xám đậm
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  availableSeatText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600",
  },

  // Ghế đã chọn - Màu xanh dương
  selectedSeat: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#4299E1", // Xanh dương sáng
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  selectedSeatText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Ghế premium - Màu vàng/vàng cam
  premiumSeat: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#ECC94B", // Vàng cam
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  premiumSeatText: {
    color: "#000000", // Đen cho dễ đọc trên nền vàng
    fontSize: 12,
    fontWeight: "700",
  },

  // Ghế đã đặt - Màu đỏ
  reservedSeat: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#F56565", // Đỏ sáng
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  reservedSeatText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  disabledSeat: {
    opacity: 0.7,
  },

  aisle: {
    width: 20,
  },
  rowTypeLabel: {
    textAlign: "center",
    color: "#718096",
    fontSize: 12,
    marginTop: 8,
  },
  premiumLabel: {
    color: "#ECC94B",
    fontWeight: "600",
  },

  // Legend
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 32,
    paddingHorizontal: 16,
  },
  legendItem: {
    alignItems: "center",
  },
  legendIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginBottom: 4,
  },
  availableIcon: {
    backgroundColor: "#4A5568", // Xám đậm
  },
  selectedIcon: {
    backgroundColor: "#4299E1", // Xanh dương
  },
  premiumIcon: {
    backgroundColor: "#ECC94B", // Vàng cam
  },
  reservedIcon: {
    backgroundColor: "#F56565", // Đỏ
  },
  legendText: {
    color: "#CBD5E0",
    fontSize: 12,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1A1A1A",
    borderTopWidth: 1,
    borderTopColor: "#2D3748",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  seatCountBadge: {
    backgroundColor: "#2D3748",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    marginRight: 12,
  },
  seatCount: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  seatCountLabel: {
    color: "#A0AEC0",
    fontSize: 10,
  },
  seatDetails: {
    flex: 1,
  },
  seatNumbers: {
    color: "#E2E8F0",
    fontSize: 14,
    marginBottom: 4,
  },
  totalPrice: {
    color: "#4299E1",
    fontSize: 18,
    fontWeight: "700",
  },
  continueButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.7,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  continueText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
});
