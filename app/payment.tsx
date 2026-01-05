import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router"; //
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp, // Thêm cái này
  setDoc,
  Timestamp,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

interface BookingData {
  id: string;
  cinemaId: string;
  createdAt: Timestamp;
  movieId: string;
  seats: string[];
  showtimeId: string;
  status: string;
  totalPrice: number;
  userId: string;
}

interface MovieData {
  id: string;
  title: string;
  type?: string;
  duration?: number;
  genre?: string[];
  rating?: string;
  posterUrl?: string;
  synopsis?: string;
}

interface ShowtimeData {
  id: string;
  movieId: string;
  cinemaId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  room: string;
  availableSeats: number;
  price: number;
}

interface CinemaData {
  id: string;
  name: string;
  location?: string;
  address?: string;
}

export default function Payment({ route, navigation }: PaymentProps) {
  // Lấy bookingId từ params
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();

  // State quản lý thông tin
  const [loading, setLoading] = useState(true);
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

  // State cho dữ liệu từ Firestore
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [showtimeData, setShowtimeData] = useState<ShowtimeData | null>(null);
  const [cinemaData, setCinemaData] = useState<CinemaData | null>(null);

  // State cho tổng tiền
  const [subtotal, setSubtotal] = useState(0);
  const [serviceFee] = useState(10000);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch booking data từ Firestore
  const fetchBookingData = useCallback(async () => {
    if (!bookingId) return;

    try {
      setLoading(true);

      // 1. Lấy thông tin Booking từ collection 'bookings'
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        throw new Error("Booking không tồn tại");
      }

      const booking = {
        id: bookingSnap.id,
        ...bookingSnap.data(),
      } as BookingData;
      setBookingData(booking);

      // 2. Truy vấn dữ liệu Phim (để lấy title và posterUrl)
      if (booking.movieId) {
        // Đảm bảo movieId được ép kiểu string để khớp với Document ID trong Firestore
        const movieRef = doc(db, "movies", String(booking.movieId));
        const movieSnap = await getDoc(movieRef);
        if (movieSnap.exists()) {
          const movieInfo = {
            id: movieSnap.id,
            ...movieSnap.data(),
          } as MovieData;
          setMovieData(movieInfo);
          // Log để kiểm tra xem đã lấy được posterUrl chưa
          console.log(
            "Dữ liệu phim thật:",
            movieInfo.title,
            movieInfo.posterUrl
          );
        }
      }

      // 3. Truy vấn dữ liệu Suất chiếu & Rạp
      if (booking.showtimeId) {
        const showtimeRef = doc(db, "showtimes", booking.showtimeId);
        const showtimeSnap = await getDoc(showtimeRef);

        if (showtimeSnap.exists()) {
          const showtime = {
            id: showtimeSnap.id,
            ...showtimeSnap.data(),
          } as ShowtimeData;
          setShowtimeData(showtime);

          // Từ thông tin suất chiếu, truy vấn tiếp lấy tên Rạp thực tế
          if (showtime.cinemaId) {
            const cinemaRef = doc(db, "cinemas", showtime.cinemaId);
            const cinemaSnap = await getDoc(cinemaRef);
            if (cinemaSnap.exists()) {
              setCinemaData({
                id: cinemaSnap.id,
                ...cinemaSnap.data(),
              } as CinemaData);
            }
          }
        }
      }

      // 4. Cập nhật số tiền từ dữ liệu thật trong Booking
      const subtotalCalc = booking.totalPrice || 0;
      setSubtotal(subtotalCalc);
      setTotalAmount(subtotalCalc + serviceFee);
    } catch (error) {
      console.error("Lỗi fetch dữ liệu thực tế:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đặt vé từ hệ thống");
      if (router.canGoBack()) {
        router.back();
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId, serviceFee, router]);

  useEffect(() => {
    if (bookingId) {
      fetchBookingData();
    } else {
      Alert.alert("Lỗi", "Không tìm thấy thông tin đặt vé");

      // ✅ SỬA: Sử dụng router thay cho navigation
      if (router.canGoBack()) {
        router.back();
      }
    }
  }, [bookingId, fetchBookingData, router]); // Loại bỏ navigation vì Expo Router không dùng biến này

  // Format ngày
  const formatDate = (timestamp: Timestamp | Date | string): string => {
    if (!timestamp) return "N/A";

    try {
      let date: Date;

      // Kiểm tra nếu là Timestamp Firebase
      if (typeof timestamp === "object" && "toDate" in timestamp) {
        date = (timestamp as Timestamp).toDate();
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

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Format giờ
  const formatTime = (timestamp: Timestamp | Date | string): string => {
    if (!timestamp) return "N/A";

    try {
      let date: Date;

      if (typeof timestamp === "object" && "toDate" in timestamp) {
        date = (timestamp as Timestamp).toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else {
        return "N/A";
      }

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting time:", error);
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
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản và điều kiện");
      return;
    }

    if (selectedPaymentMethod === "creditCard") {
      if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin thẻ");
        return;
      }

      // Validate thẻ
      if (cardNumber.replace(/\s/g, "").length !== 16) {
        Alert.alert("Lỗi", "Số thẻ phải có 16 chữ số");
        return;
      }

      if (cvv.length !== 3) {
        Alert.alert("Lỗi", "CVV phải có 3 chữ số");
        return;
      }
    }

    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn có chắc chắn muốn thanh toán ${totalAmount.toLocaleString()} VND?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thanh toán",
          onPress: async () => {
            await processPayment();
          },
        },
      ]
    );
  };

  // Xử lý thanh toán và lưu vào Firestore
  const processPayment = async () => {
    try {
      setProcessingPayment(true);

      if (!bookingData) throw new Error("Dữ liệu booking trống");

      // 1. Tạo ID đơn hàng tự tăng (bk1, bk2...)
      const bookingsSnap = await getDocs(collection(db, "bookings"));
      const nextId = `bk${bookingsSnap.size + 1}`;

      // 2. Chụp ảnh dữ liệu thật để lưu vào đơn hàng
      const fullBookingData = {
        ...bookingData,
        movieId: movieData?.id || "1", // Gán ID thật thay vì "unknown"
        movieTitle: movieData?.title || "Phim không xác định",
        //moviePoster: movieData?.poster || "",
        cinemaName: cinemaData?.name || "Rạp không xác định",
        totalPrice: totalAmount,
        status: "PAID",
        bookingId: nextId,
        updatedAt: serverTimestamp(),
        paymentMethod: selectedPaymentMethod,
      };

      // 3. Ghi dữ liệu vào Firestore với ID bkX
      await setDoc(doc(db, "bookings", nextId), fullBookingData);

      // 4. Thông báo thành công
      Alert.alert(
        "Thành công",
        `Thanh toán thành công! Mã đơn của bạn là: ${nextId}`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/"), // Quay về trang chủ
          },
        ]
      );
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      Alert.alert("Lỗi", "Thanh toán thất bại. Vui lòng thử lại.");
    } finally {
      setProcessingPayment(false);
    }
  };

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

  // Hiển thị loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Đang tải thông tin thanh toán...</Text>
      </View>
    );
  }

  // Hiển thị thông báo lỗi nếu không có dữ liệu
  if (!bookingData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Không tìm thấy thông tin đặt vé</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBookingData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
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
            <Text style={styles.bookingId}>
              Mã đặt vé: {bookingId ? bookingId.substring(0, 8) : "N/A"}...
            </Text>
          </View>

          {/* --- Thông tin phim và vé --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông Tin Vé</Text>

            <View style={styles.movieInfo}>
              <View style={styles.moviePoster}>
                {/* Sử dụng Image từ react-native để lấy ảnh thật */}
                {movieData?.posterUrl ? (
                  <Image
                    source={{ uri: movieData.posterUrl }}
                    style={styles.posterImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.moviePosterText}>🎬</Text>
                )}
              </View>

              <View style={styles.movieDetails}>
                {/* Hiển thị Tên phim thực tế từ MovieData */}
                <Text style={styles.movieTitle}>
                  {movieData?.title ||
                    (loading ? "Đang tải phim..." : "Phim không xác định")}
                </Text>

                {/* Hiển thị Tên rạp thực tế từ CinemaData */}
                <Text style={styles.cinemaName}>
                  {cinemaData?.name ||
                    (loading ? "Đang tải rạp..." : "Rạp chưa xác định")}
                </Text>

                <View style={styles.showtimeContainer}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.showtimeText}>
                    {showtimeData?.startTime
                      ? formatDate(showtimeData.startTime)
                      : "Đang tải..."}
                  </Text>

                  <Ionicons
                    name="time-outline"
                    size={16}
                    color="#666"
                    style={styles.timeIcon}
                  />
                  <Text style={styles.showtimeText}>
                    {showtimeData?.startTime
                      ? formatTime(showtimeData.startTime)
                      : "N/A"}
                  </Text>
                </View>

                <View style={styles.seatsContainer}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.seatsText}>
                    Ghế:{" "}
                    {bookingData?.seats
                      ? bookingData.seats.join(", ")
                      : "Chưa chọn"}
                  </Text>
                </View>
              </View>
            </View>

            {/* --- Tóm tắt chi phí --- */}
            <View style={styles.ticketSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Vé {movieData?.type || "Standard"} x{" "}
                  {bookingData?.seats?.length || 0}
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
  posterImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },

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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#333",
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
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
    overflow: "hidden",
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
    marginRight: 15,
  },
  timeIcon: {
    marginLeft: 10,
  },
  seatsContainer: {
    flexDirection: "row",
    alignItems: "center",
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
