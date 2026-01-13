import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../config/firebase";

// Define types
type RootStackParamList = {
  Payment: { bookingId: string };
  Home: undefined;
};

type PaymentScreenRouteProp = RouteProp<RootStackParamList, "Payment">;
type PaymentScreenNavigationProp = NavigationProp<
  RootStackParamList,
  "Payment"
>;

interface PaymentProps {
  route: PaymentScreenRouteProp;
  navigation: PaymentScreenNavigationProp;
}

interface MovieData {
  id: string;
  title: string;
  posterUrl?: string;
  type?: string;
}

interface ShowtimeData {
  id: string;
  startTime: any;
  endTime: any;
  room?: string;
}

interface CinemaData {
  id: string;
  name: string;
  address?: string;
}

export default function Payment({ route, navigation }: PaymentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("creditCard");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // State cho dữ liệu phim, suất chiếu, rạp
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [showtimeData, setShowtimeData] = useState<ShowtimeData | null>(null);
  const [cinemaData, setCinemaData] = useState<CinemaData | null>(null);

  // State cho tổng tiền
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [serviceFee] = useState(10000);

  const { movieId, showtimeId, cinemaId, seats, totalPrice } =
    useLocalSearchParams<{
      movieId: string;
      showtimeId: string;
      cinemaId: string;
      seats: string;
      totalPrice: string;
    }>();

  const selectedSeats: string[] = useMemo(() => {
    return seats ? JSON.parse(seats) : [];
  }, [seats]);

  const finalTotal: number = totalPrice ? Number(totalPrice) : 0;

  // Fetch thông tin phim, suất chiếu, rạp từ Firestore
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch movie data
        if (movieId) {
          const movieRef = doc(db, "movies", movieId as string);
          const movieSnap = await getDoc(movieRef);
          if (movieSnap.exists()) {
            setMovieData({
              id: movieSnap.id,
              ...movieSnap.data(),
            } as MovieData);
          }
        }

        // Fetch showtime data
        if (showtimeId) {
          const showtimeRef = doc(db, "showtimes", showtimeId as string);
          const showtimeSnap = await getDoc(showtimeRef);
          if (showtimeSnap.exists()) {
            setShowtimeData({
              id: showtimeSnap.id,
              ...showtimeSnap.data(),
            } as ShowtimeData);
          }
        }

        // Fetch cinema data
        if (cinemaId) {
          const cinemaRef = doc(db, "cinemas", cinemaId as string);
          const cinemaSnap = await getDoc(cinemaRef);
          if (cinemaSnap.exists()) {
            setCinemaData({
              id: cinemaSnap.id,
              ...cinemaSnap.data(),
            } as CinemaData);
          }
        }

        // Tính toán tổng tiền
        setSubtotal(finalTotal);
        setTotalAmount(finalTotal + serviceFee);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin đặt vé");
      } finally {
        setLoading(false);
      }
    };

    if (movieId || showtimeId || cinemaId) {
      fetchData();
    }
  }, [movieId, showtimeId, cinemaId, finalTotal, serviceFee]);

  // Format ngày giờ
  const formatDateTime = (timestamp: any): string => {
    if (!timestamp) return "N/A";

    try {
      let date: Date;

      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else {
        return "N/A";
      }

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Xử lý áp dụng mã giảm giá
  const handleApplyPromoCode = async () => {
    if (promoCode.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      // Kiểm tra mã giảm giá
      const validPromoCodes = ["MOVIE50K", "CGV30K", "FILMFAN"];

      if (validPromoCodes.includes(promoCode.toUpperCase())) {
        // Tính toán discount dựa trên mã
        let discount = 0;
        switch (promoCode.toUpperCase()) {
          case "MOVIE50K":
            discount = 50000;
            break;
          case "CGV30K":
            discount = 30000;
            break;
          case "FILMFAN":
            discount = subtotal * 0.1; // 10% discount
            break;
          default:
            discount = 0;
        }

        setDiscountAmount(discount);
        setPromoApplied(true);

        // Cập nhật tổng tiền mới
        const newTotal = subtotal + serviceFee - discount;
        setTotalAmount(newTotal > 0 ? newTotal : 0);

        Alert.alert("Thành công", "Áp dụng mã giảm giá thành công!");
      } else {
        Alert.alert("Lỗi", "Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng mã giảm giá:", error);
      Alert.alert("Lỗi", "Không thể áp dụng mã giảm giá");
    }
  };

  // Xử lý thanh toán
  const handlePayment = async () => {
    if (!agreeToTerms) {
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản");
      return;
    }

    // 🔥 MOMO → THANH TOÁN NGAY
    if (selectedPaymentMethod === "momo") {
      Alert.alert("MoMo", "Thanh toán thành công!", [
        {
          text: "OK",
          onPress: completeMomoPayment,
        },
      ]);
      return;
    }

    // Các phương thức khác
    Alert.alert(
      "Xác nhận thanh toán",
      `Thanh toán ${totalAmount.toLocaleString()} VND?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thanh toán",
          onPress: processPayment,
        },
      ]
    );
  };
  const completeMomoPayment = async () => {
    try {
      setProcessingPayment(true);

      // 1️⃣ Update booking → PAID
      // 🔥 Sinh bookingId dạng BK0001
      const bookingId = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, "counters", "bookings");
        const counterSnap = await transaction.get(counterRef);

        let nextNumber = 1;

        if (counterSnap.exists()) {
          nextNumber = counterSnap.data().value + 1;
          transaction.update(counterRef, { value: nextNumber });
        } else {
          transaction.set(counterRef, { value: 1 });
        }

        return `BK${nextNumber.toString().padStart(4, "0")}`;
      });

      // 👉 Dùng bookingId làm document ID
      const bookingRef = doc(db, "bookings", bookingId);

      await setDoc(bookingRef, {
        bookingId,
        movieId,
        showtimeId,
        cinemaId,
        seats: selectedSeats,
        totalPrice: totalAmount,
        paymentMethod: "MOMO",
        status: "PAID",
        createdAt: serverTimestamp(),
      });

      // 2️⃣ Chuyển ghế LOCK → RESERVED
      const showtimeRef = doc(db, "showtimes", showtimeId as string);
      const snap = await getDoc(showtimeRef);

      const data = snap.data();
      const seatLocks = data?.seatLocks || {};
      const reservedSeats = data?.reservedSeats || [];

      selectedSeats.forEach((seat) => {
        reservedSeats.push(seat);
        delete seatLocks[seat];
      });

      await updateDoc(showtimeRef, {
        reservedSeats,
        seatLocks,
      });

      // 3️⃣ Điều hướng sang màn thành công
      Alert.alert(
        "Thanh toán thành công 🎉",
        "Bạn đã thanh toán vé bằng MoMo thành công.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/cinema-movies");
            },
          },
        ]
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi", "Thanh toán MoMo thất bại");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Xử lý thanh toán và lưu vào Firestore
  const processPayment = async () => {
    if (selectedPaymentMethod !== "zalopay") {
      Alert.alert("Thông báo", "Vui lòng chọn ZaloPay");
      return;
    }

    setProcessingPayment(true);

    try {
      console.log("🔥 processPayment START");

      // 1️⃣ Tạo booking PENDING
      const bookingRef = doc(collection(db, "bookings"));
      const bookingId = bookingRef.id;

      await setDoc(bookingRef, {
        bookingId,
        movieId,
        showtimeId,
        cinemaId,
        seats: selectedSeats,
        totalPrice: totalAmount,
        status: "PENDING",
        createdAt: serverTimestamp(),
      });

      console.log("✅ Booking created:", bookingId);

      // 2️⃣ Gọi backend (có timeout)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s

      console.log("🌐 Calling backend...");

      const res = await fetch("http://10.41.124.71:8080/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: totalAmount,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      console.log("📡 Backend status:", res.status);

      const text = await res.text();
      console.log("👉 RAW RESPONSE:", text);

      if (!res.ok || !text) {
        throw new Error("Backend trả lỗi hoặc rỗng");
      }

      const data = JSON.parse(text);

      if (!data.order_url) throw new Error("Thiếu order_url");

      // 3️⃣ Sang màn QR
      console.log("➡️ Go to payment-qr");

      router.push({
        pathname: "/payment-qr",
        params: {
          bookingId,
          orderUrl: data.order_url,
          orderToken: data.order_token,
        },
      });
    } catch (err: any) {
      console.error("❌ processPayment ERROR:", err);

      if (err.name === "AbortError") {
        Alert.alert("Lỗi", "Backend không phản hồi (timeout)");
      } else {
        Alert.alert("Lỗi", err.message || "Không tạo được QR");
      }
    } finally {
      setProcessingPayment(false);
      console.log("🔚 processPayment END");
    }
  };

  const unlockSeats = useCallback(async () => {
    try {
      if (!showtimeId || selectedSeats.length === 0) return;

      const ref = doc(db, "showtimes", showtimeId as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const seatLocks = snap.data().seatLocks || {};

      selectedSeats.forEach((seat) => {
        delete seatLocks[seat];
      });

      await updateDoc(ref, { seatLocks });

      console.log("🔓 Seats unlocked:", selectedSeats);
    } catch (e) {
      console.log("❌ Unlock seats error:", e);
    }
  }, [showtimeId, selectedSeats]);

  useEffect(() => {
    return () => {
      unlockSeats();
    };
  }, [unlockSeats]);

  // Định dạng số thẻ
  const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = cleaned.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return text;
    }
  };

  // Xử lý khi người dùng nhập số thẻ
  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  // Xử lý khi người dùng nhập ngày hết hạn
  const handleExpiryDateChange = (text: string) => {
    let formattedText = text.replace(/[^0-9]/g, "");

    if (formattedText.length >= 2) {
      formattedText =
        formattedText.substring(0, 2) + "/" + formattedText.substring(2, 4);
    }

    setExpiryDate(formattedText);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Đang tải thông tin thanh toán...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* --- Header --- */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Thanh Toán</Text>
            <Text style={styles.headerSubtitle}>Hoàn tất đặt vé của bạn</Text>
            {movieData && (
              <Text style={styles.bookingId}>Phim: {movieData.title}</Text>
            )}
          </View>

          {/* --- Thông tin phim và vé --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông Tin Vé</Text>

            {/* Thông tin chi tiết vé */}
            <View style={styles.orderInfo}>
              <View style={styles.movieInfo}>
                <View style={styles.moviePoster}>
                  {movieData?.posterUrl ? (
                    <Text style={styles.moviePosterText}>🎬</Text>
                  ) : (
                    <Text style={styles.moviePosterText}>🎬</Text>
                  )}
                </View>
                <View style={styles.movieDetails}>
                  <Text style={styles.movieTitle}>
                    {movieData?.title || "Đang tải..."}
                  </Text>
                  <Text style={styles.cinemaName}>
                    {cinemaData?.name || "Đang tải..."}
                    {cinemaData?.address && ` - ${cinemaData.address}`}
                  </Text>
                  <View style={styles.showtimeContainer}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.showtimeText}>
                      {showtimeData
                        ? formatDateTime(showtimeData.startTime)
                        : "Đang tải..."}
                    </Text>
                  </View>
                  {showtimeData?.room && (
                    <View style={styles.seatsContainer}>
                      <Ionicons
                        name="videocam-outline"
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.seatsText}>
                        Phòng chiếu: {showtimeData.room}
                      </Text>
                    </View>
                  )}
                  <View style={styles.seatsContainer}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.seatsText}>
                      Ghế: {selectedSeats.join(", ")} ({selectedSeats.length}{" "}
                      vé)
                    </Text>
                  </View>
                </View>
              </View>

              {/* --- Tóm tắt chi phí --- */}
              <View style={styles.ticketSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Vé {movieData?.type || "Standard"} x{selectedSeats.length}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {subtotal.toLocaleString()} VND
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Phí dịch vụ</Text>
                  <Text style={styles.summaryValue}>
                    {serviceFee.toLocaleString()} VND
                  </Text>
                </View>

                {promoApplied && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, styles.discountText]}>
                      Giảm giá
                    </Text>
                    <Text style={[styles.summaryValue, styles.discountText]}>
                      -{discountAmount.toLocaleString()} VND
                    </Text>
                  </View>
                )}

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Tổng cộng</Text>
                  <Text style={styles.totalValue}>
                    {totalAmount.toLocaleString()} VND
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Phương thức thanh toán */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương Thức Thanh Toán</Text>
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === "creditCard" &&
                    styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedPaymentMethod("creditCard")}
              >
                <Ionicons
                  name={
                    selectedPaymentMethod === "creditCard"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color={
                    selectedPaymentMethod === "creditCard" ? "#FF6B6B" : "#999"
                  }
                />
                <Ionicons
                  name="card-outline"
                  size={24}
                  color="#333"
                  style={styles.paymentIcon}
                />
                <Text style={styles.paymentMethodText}>
                  Thẻ tín dụng/ghi nợ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === "momo" &&
                    styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedPaymentMethod("momo")}
              >
                <Ionicons
                  name={
                    selectedPaymentMethod === "momo"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color={selectedPaymentMethod === "momo" ? "#FF6B6B" : "#999"}
                />
                <Text style={[styles.paymentIcon, styles.momoIcon]}>MoMo</Text>
                <Text style={styles.paymentMethodText}>Ví MoMo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === "zalopay" &&
                    styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedPaymentMethod("zalopay")}
              >
                <Ionicons
                  name={
                    selectedPaymentMethod === "zalopay"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color={
                    selectedPaymentMethod === "zalopay" ? "#FF6B6B" : "#999"
                  }
                />
                <Text style={[styles.paymentIcon, styles.zalopayIcon]}>
                  ZaloPay
                </Text>
                <Text style={styles.paymentMethodText}>Ví ZaloPay</Text>
              </TouchableOpacity>
            </View>

            {/* Form thẻ tín dụng */}
            {selectedPaymentMethod === "creditCard" && (
              <View style={styles.cardForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Số thẻ</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tên chủ thẻ</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="NGUYEN VAN A"
                    value={cardHolder}
                    onChangeText={setCardHolder}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.inputLabel}>Ngày hết hạn (MM/YY)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChangeText={handleExpiryDateChange}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>

                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Thông báo khi chọn ví điện tử */}
            {(selectedPaymentMethod === "momo" ||
              selectedPaymentMethod === "zalopay") && (
              <View style={styles.eWalletNotice}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#4A90E2"
                />
                <Text style={styles.eWalletText}>
                  Bạn sẽ được chuyển hướng đến ứng dụng{" "}
                  {selectedPaymentMethod === "momo" ? "MoMo" : "ZaloPay"} để
                  hoàn tất thanh toán
                </Text>
              </View>
            )}
          </View>

          {/* Mã giảm giá */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mã Giảm Giá</Text>
            <View style={styles.promoContainer}>
              <View style={styles.promoInputContainer}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Nhập mã giảm giá"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  editable={!promoApplied}
                />
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    promoApplied && styles.appliedButton,
                  ]}
                  onPress={handleApplyPromoCode}
                  disabled={promoApplied}
                >
                  <Text
                    style={[
                      styles.applyButtonText,
                      promoApplied && styles.appliedButtonText,
                    ]}
                  >
                    {promoApplied ? "Đã áp dụng" : "Áp dụng"}
                  </Text>
                </TouchableOpacity>
              </View>
              {promoApplied && (
                <Text style={styles.promoSuccessText}>
                  Mã {promoCode.toUpperCase()} đã được áp dụng thành công!
                </Text>
              )}
            </View>
          </View>

          {/* Điều khoản và điều kiện */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={agreeToTerms ? "checkbox" : "square-outline"}
                size={24}
                color={agreeToTerms ? "#FF6B6B" : "#999"}
              />
              <Text style={styles.termsText}>
                Tôi đồng ý với{" "}
                <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và{" "}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>
          </View>
          {/* Nút thanh toán */}
          <View style={styles.paymentButtonContainer}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                (!agreeToTerms || processingPayment) &&
                  styles.paymentButtonDisabled,
              ]}
              onPress={handlePayment}
              disabled={!agreeToTerms || processingPayment}
            >
              {processingPayment ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.paymentButtonText}>
                    THANH TOÁN {totalAmount.toLocaleString()} VND
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color="#FFF"
                    style={styles.paymentButtonIcon}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Thông tin bảo mật */}
          <View style={styles.securityInfo}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.securityText}>
              Thông tin thanh toán của bạn được bảo mật và mã hóa
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  bookingId: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
    fontStyle: "italic",
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  orderInfo: {
    marginBottom: 10,
  },
  movieInfo: {
    flexDirection: "row",
    marginBottom: 20,
  },
  moviePoster: {
    width: 80,
    height: 100,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  moviePosterText: {
    fontSize: 36,
  },
  movieDetails: {
    flex: 1,
    justifyContent: "center",
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cinemaName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  showtimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  showtimeText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
  },
  seatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  seatsText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
  },
  ticketSummary: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  discountText: {
    color: "#4CAF50",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  paymentMethods: {
    marginBottom: 10,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedPaymentMethod: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  paymentIcon: {
    marginHorizontal: 15,
    fontSize: 18,
    fontWeight: "500",
  },
  momoIcon: {
    color: "#A50064",
  },
  zalopayIcon: {
    color: "#0D5E9E",
  },
  paymentMethodText: {
    fontSize: 16,
    color: "#333",
  },
  cardForm: {
    marginTop: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  eWalletNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  eWalletText: {
    flex: 1,
    fontSize: 14,
    color: "#4A90E2",
    marginLeft: 10,
  },
  promoContainer: {
    marginBottom: 10,
  },
  promoInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  appliedButton: {
    backgroundColor: "#4CAF50",
  },
  applyButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  appliedButtonText: {
    fontWeight: "500",
  },
  promoSuccessText: {
    color: "#4CAF50",
    fontSize: 14,
    marginTop: 10,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    lineHeight: 20,
  },
  termsLink: {
    color: "#FF6B6B",
    fontWeight: "500",
  },
  paymentButtonContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    marginTop: 10,
  },
  paymentButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentButtonDisabled: {
    backgroundColor: "#CCC",
  },
  paymentButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  paymentButtonIcon: {
    marginTop: 2,
  },
  securityInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FFF",
    marginTop: 10,
  },
  securityText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
});
