import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../config/firebase";

interface Movie {
  id: string;
  title: string;
  poster: string;
  rating: number;
  genre?: string; // Dùng số ít theo đề xuất của TS
  genres?: string[]; // Hoặc thêm cả mảng nếu bạn dùng map
  cast?: string[]; // Thêm cast
  director?: string; // Thêm director
  year?: string | number; // Thêm year
  description?: string;
  duration?: string;
  releaseDate?: string;
  status?: string;
  isHot?: boolean;
}

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = Platform.OS === "ios" ? 100 : 80;
const POSTER_HEIGHT = height * 0.55;

export default function MovieDetails() {
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    if (!id) return;

    const movieRef = doc(db, "movies", id as string);

    const unsubscribe = onSnapshot(
      movieRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setMovie({
            ...(snapshot.data() as Movie), // Đưa spread lên trước
            id: snapshot.id, // Gán id sau để đảm bảo không bị ghi đè sai
          });
        } else {
          setMovie(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Lỗi Firestore:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  // Animation cho header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, POSTER_HEIGHT - HEADER_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: "clamp",
  });

  if (loading)
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={["#0A0A0F", "#1A1A2E"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải thông tin phim...</Text>
        </LinearGradient>
      </View>
    );

  if (!movie)
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={["#0A0A0F", "#1A1A2E"]}
          style={styles.loadingGradient}
        >
          <Ionicons name="film-outline" size={80} color="#667eea" />
          <Text style={styles.errorText}>Không tìm thấy thông tin phim</Text>
          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeText}>Quay lại</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );

  // Phân loại thể loại
  const genres = movie.genres || ["Hành động", "Phiêu lưu"];
  const cast = movie.cast || ["Diễn viên A", "Diễn viên B", "Diễn viên C"];
  const director = movie.director || "Đạo diễn XYZ";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Poster với parallax effect */}
        <Animated.View
          style={[
            styles.imageContainer,
            { transform: [{ scale: imageScale }] },
          ]}
        >
          <Image source={{ uri: movie.poster }} style={styles.mainPoster} />
          <LinearGradient
            colors={["transparent", "rgba(10,10,15,0.8)", "rgba(10,10,15,1)"]}
            style={styles.imageGradient}
          />

          {/* Rating badge trên poster */}
          <View style={styles.posterRatingBadge}>
            <LinearGradient
              colors={["#FFD700", "#FFA500"]}
              style={styles.ratingGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="star" size={16} color="#FFF" />
              <Text style={styles.posterRatingText}>
                {movie.rating || "N/A"}
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Nội dung chi tiết */}
        <View style={styles.detailsContent}>
          <View style={styles.titleSection}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <View style={styles.releaseInfo}>
              <View style={styles.yearBadge}>
                <Text style={styles.yearText}>{movie.year || "2024"}</Text>
              </View>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={14} color="#667eea" />
                <Text style={styles.durationText}>
                  {movie.duration || "120"} phút
                </Text>
              </View>
            </View>
          </View>

          {/* Thể loại */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.genreScroll}
            contentContainerStyle={styles.genreContainer}
          >
            {genres.map((genre: string, index: number) => (
              <View key={index} style={styles.genreBadge}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Thông tin chính */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="videocam-outline" size={24} color="#667eea" />
              <Text style={styles.infoLabel}>Định dạng</Text>
              <Text style={styles.infoValue}>2D • Phụ đề</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={24} color="#667eea" />
              <Text style={styles.infoLabel}>Khởi chiếu</Text>
              <Text style={styles.infoValue}>20/12/2024</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="flag-outline" size={24} color="#667eea" />
              <Text style={styles.infoLabel}>Quốc gia</Text>
              <Text style={styles.infoValue}>Mỹ</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="megaphone-outline" size={24} color="#667eea" />
              <Text style={styles.infoLabel}>Ngôn ngữ</Text>
              <Text style={styles.infoValue}>Tiếng Anh</Text>
            </View>
          </View>

          {/* Mô tả */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color="#FFF" />
              <Text style={styles.sectionTitle}>Nội dung phim</Text>
            </View>
            <Text style={styles.description}>
              {movie.description ||
                "Khám phá thế giới điện ảnh đầy mê hoặc với những cảnh quay mãn nhãn và cốt truyện hấp dẫn. Trải nghiệm điện ảnh đỉnh cao tại LiDoRa với chất lượng hình ảnh sắc nét và âm thanh vòm sống động."}
            </Text>
          </View>

          {/* Đạo diễn & Diễn viên */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={24} color="#FFF" />
              <Text style={styles.sectionTitle}>Đội ngũ sản xuất</Text>
            </View>
            <View style={styles.crewItem}>
              <Text style={styles.crewRole}>Đạo diễn:</Text>
              <Text style={styles.crewName}>{director}</Text>
            </View>
            <Text style={styles.crewRole}>Diễn viên chính:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.castScroll}
              contentContainerStyle={styles.castContainer}
            >
              {cast.map((actor: string, index: number) => (
                <View key={index} style={styles.castBadge}>
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color="#667eea"
                  />
                  <Text style={styles.castText}>{actor}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Đánh giá */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color="#FFF"
              />
              <Text style={styles.sectionTitle}>Đánh giá từ khán giả</Text>
            </View>
            <View style={styles.reviewStats}>
              <View style={styles.ratingCircle}>
                <Text style={styles.ratingNumber}>{movie.rating || "8.5"}</Text>
                <Text style={styles.ratingLabel}>/10</Text>
              </View>
              <View style={styles.reviewInfo}>
                <View style={styles.reviewItem}>
                  <Ionicons
                    name="thumbs-up-outline"
                    size={20}
                    color="#4CAF50"
                  />
                  <Text style={styles.reviewText}>92% khán giả thích</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Ionicons name="eye-outline" size={20} color="#2196F3" />
                  <Text style={styles.reviewText}>10K+ lượt xem</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.addReviewButton}>
              <Ionicons name="add-circle-outline" size={20} color="#667eea" />
              <Text style={styles.addReviewText}>Thêm đánh giá của bạn</Text>
            </TouchableOpacity>
          </View>

          {/* Khoảng trống cho footer */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Header cố định với hiệu ứng blur */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={90} tint="dark" style={styles.blurHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {movie.title}
            </Text>
            <TouchableOpacity style={styles.headerShareButton}>
              <Ionicons name="share-social-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      {/* Nút back trên poster */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <BlurView intensity={80} tint="dark" style={styles.blurButton}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </BlurView>
      </TouchableOpacity>

      {/* Nút Đặt vé cố định */}
      <View style={styles.footer}>
        <BlurView intensity={80} tint="dark" style={styles.footerBlur}>
          <View style={styles.footerContent}>
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Giá vé từ</Text>
              <Text style={styles.price}>75.000₫</Text>
            </View>
            <TouchableOpacity
              style={styles.bookingButton}
              onPress={() => {
                router.push({
                  pathname: "/cinema-movies",
                  params: {
                    id: movie.id,
                    title: movie.title,
                    price: 75000,
                  },
                });
              }}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="ticket-outline" size={24} color="#FFF" />
                <Text style={styles.bookingButtonText}>ĐẶT VÉ NGAY</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 30,
  },
  backHomeButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.5)",
  },
  backHomeText: {
    color: "#667eea",
    fontWeight: "600",
  },
  imageContainer: {
    height: POSTER_HEIGHT,
    width: width,
    position: "relative",
  },
  mainPoster: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  posterRatingBadge: {
    position: "absolute",
    top: HEADER_HEIGHT + 20,
    right: 20,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ratingGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  posterRatingText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 18,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  blurButton: {
    padding: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  detailsContent: {
    paddingHorizontal: 20,
    marginTop: -20,
    paddingTop: 20,
    backgroundColor: "#0A0A0F",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  titleSection: {
    marginBottom: 20,
  },
  movieTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 10,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  releaseInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  yearBadge: {
    backgroundColor: "rgba(102, 126, 234, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  yearText: {
    color: "#667eea",
    fontWeight: "600",
    fontSize: 14,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  durationText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  genreScroll: {
    marginBottom: 25,
  },
  genreContainer: {
    gap: 10,
  },
  genreBadge: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  genreText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  infoItem: {
    width: "48%",
    marginBottom: 15,
  },
  infoLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: -0.3,
  },
  description: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  crewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  crewRole: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    marginBottom: 10,
  },
  crewName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  castScroll: {
    marginTop: 10,
  },
  castContainer: {
    gap: 12,
  },
  castBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.2)",
  },
  castText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "500",
  },
  reviewStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    gap: 25,
  },
  ratingCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(102, 126, 234, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  ratingNumber: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
  },
  ratingLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  reviewText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  addReviewText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 100,
  },
  blurHeader: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 20,
  },
  headerShareButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 100,
  },
  footerBlur: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  footerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
  },
  bookingButton: {
    flex: 2,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  bookingButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
