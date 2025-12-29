import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router, useRouter } from "expo-router";
import { onValue, ref } from "firebase/database";

import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase";

const { width } = Dimensions.get("window");

// INTERFACE FOR TYPES

interface Cinema {
  id: string;
  name: string;
  location: string;
  distance: string;
  features: string[];
}

// MOCK DATA - PREMIUM MOVIES

const cinemas: Cinema[] = [
  {
    id: "1",
    name: "Rạp IMAX LiDoRa",
    location: "Trung tâm Thành phố",
    distance: "0.8 km",
    features: ["IMAX", "4DX", "Phòng chờ VIP", "Dolby Atmos"],
  },
  {
    id: "2",
    name: "Galaxy Premium Cinema",
    location: "Trung tâm mua sắm Westgate",
    distance: "3.4 km",
    features: ["IMAX", "ScreenX", "Gold Class"],
  },
  {
    id: "3",
    name: "Rạp Starlight",
    location: "Quảng trường Riverside",
    distance: "5.5 km",
    features: ["4DX", "Thân thiện trẻ em", "Quầy bar"],
  },
];

// COMPONENTS
const MovieCard = ({
  movie,
  size = "medium",
}: {
  movie: any;
  size?: "small" | "medium" | "large";
}) => {
  const cardWidth =
    size === "large"
      ? width * 0.8
      : size === "medium"
      ? width * 0.6
      : width * 0.4;

  // Định nghĩa hàm xử lý khi nhấn
  const handlePress = () => {
    router.push({
      pathname: "/movie-details",
      params: { id: movie.id }, // Đảm bảo movie có thuộc tính id
    });
  };
  return (
    <TouchableOpacity
      style={[styles.movieCard, { width: cardWidth }]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {/* Sửa uri để tránh bị trắng ảnh nếu link lỗi */}
      <Image
        source={{
          uri:
            movie.poster || "https://via.placeholder.com/400x600?text=No+Image",
        }}
        style={styles.moviePoster}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.9)"]}
        style={styles.movieGradient}
      />

      <View style={styles.movieBadges}>
        {movie.isIMAX && (
          <View style={[styles.badge, { backgroundColor: "#FF6B35" }]}>
            <Text style={styles.badgeText}>IMAX</Text>
          </View>
        )}
        {movie.is4D && (
          <View style={[styles.badge, { backgroundColor: "#00B4D8" }]}>
            <Text style={styles.badgeText}>4DX</Text>
          </View>
        )}
        {movie.isVIP && (
          <View style={[styles.badge, { backgroundColor: "#FFD700" }]}>
            <Text style={[styles.badgeText, { color: "#000" }]}>VIP</Text>
          </View>
        )}
      </View>

      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={1}>
          {movie.title || "Chưa có tên phim"}
        </Text>

        <View style={styles.movieMeta}>
          {/* SỬA LỖI .JOIN Ở ĐÂY: Kiểm tra nếu genre là mảng mới join */}
          <Text style={styles.movieGenre}>
            {Array.isArray(movie.genre)
              ? movie.genre.join(" • ")
              : "Phim chiếu rạp"}
          </Text>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.movieRating}>{movie.rating || "N/A"}</Text>
          </View>
        </View>

        <Text style={styles.movieDuration}>
          {movie.duration || "Đang cập nhật"} • {movie.year || "2024"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CinemaCard = ({ cinema }: { cinema: Cinema }) => {
  const router = useRouter(); // Khai báo router bên trong component

  return (
    <TouchableOpacity
      style={styles.cinemaCard}
      activeOpacity={0.8}
      // Khi nhấn vào toàn bộ thẻ rạp
      onPress={() => {
        console.log("Đang chuyển tới rạp:", cinema.name);
        router.push({
          pathname: "/cinema-movies" as any,
          params: {
            cinemaId: cinema.id,
            cinemaName: cinema.name,
          },
        });
      }}
    >
      <View style={styles.cinemaHeader}>
        <View>
          <Text style={styles.cinemaName}>{cinema.name}</Text>
          <Text style={styles.cinemaLocation}>{cinema.location}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Ionicons name="location" size={12} color="#FFF" />
          <Text style={styles.distanceText}>{cinema.distance}</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {cinema.features.map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Phần nút hiển thị (đã nằm trong TouchableOpacity cha nên sẽ nhận sự kiện onPress) */}
      <View style={styles.selectButton}>
        <Text style={styles.selectButtonText}>XEM PHIM TẠI RẠP NÀY</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function PremiumHomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState<TabType>("nowPlaying");
  const [moviesFromDb, setMoviesFromDb] = useState<any[]>([]);
  type TabType = "nowPlaying" | "comingSoon" | "special";
  const TABS: { label: string; value: TabType }[] = [
    { label: "ĐANG CHIẾU", value: "nowPlaying" },
    { label: "SẮP CHIẾU", value: "comingSoon" },
    { label: "SỰ KIỆN ĐẶC BIỆT", value: "special" },
  ];

  useEffect(() => {
    const moviesRef = ref(db, "movies");

    const unsubscribe = onValue(moviesRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const movieList = Object.keys(data).map((key) => ({
          ...data[key],
          id: key,
        }));
        setMoviesFromDb(movieList);
      }
    });
    return () => unsubscribe();
  }, []);

  // 1. Lọc tất cả phim theo từ khóa search trước
  const filteredMovies = moviesFromDb.filter((movie) =>
    movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Lọc phim Hot từ danh sách ĐÃ SEARCH (Featured)
  const hotMovies = filteredMovies.filter((movie) => movie.isHot === true);

  // 3. Lọc phim Đang chiếu từ danh sách ĐÃ SEARCH

  const nowPlayingMovies = filteredMovies.filter(
    (movie) => movie.status === "nowPlaying"
  );

  const comingSoonMovies = filteredMovies.filter(
    (movie) => movie.status === "comingSoon"
  );
  const moviesByTab = (() => {
    switch (activeTab) {
      case "nowPlaying":
        return nowPlayingMovies;
      case "comingSoon":
        return comingSoonMovies;
      default:
        return [];
    }
  })();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Premium Header */}
      <LinearGradient colors={["#000428", "#004e92"]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>LiDoRa</Text>
            <Text style={styles.headerSubtitle}>TRẢI NGHIỆM CAO CẤP</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <Link href="/profile" asChild>
              <TouchableOpacity style={styles.profileButton}>
                <FontAwesome5 name="user" size={20} color="#FFF" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#667eea"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm phim, rạp chiếu..."
            placeholderTextColor="#a78bfa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Movies Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PHIM ĐỀ CỬ CAO CẤP</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>XEM TẤT CẢ</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            // SỬA DÒNG NÀY: Dùng hotMovies thay vì featuredMovies
            data={hotMovies.length > 0 ? hotMovies : filteredMovies}
            renderItem={({ item }) => <MovieCard movie={item} size="large" />}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.85}
            decelerationRate="fast"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.actionIcon, { backgroundColor: "#FF6B35" }]}>
              <MaterialIcons name="local-movies" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionText}>Đặt vé ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.actionIcon, { backgroundColor: "#00B4D8" }]}>
              <MaterialIcons
                name="confirmation-number"
                size={24}
                color="#FFF"
              />
            </View>
            <Text style={styles.actionText}>Vé của tôi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.actionIcon, { backgroundColor: "#9D4EDD" }]}>
              <FontAwesome5 name="crown" size={20} color="#FFF" />
            </View>
            <Text style={styles.actionText}>Câu lạc bộ VIP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.actionIcon, { backgroundColor: "#4CAF50" }]}>
              <MaterialIcons name="restaurant" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionText}>Đồ ăn & Thức uống</Text>
          </TouchableOpacity>
        </View>

        {/* Now Playing / Coming Soon Tabs */}

        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tab, activeTab === tab.value && styles.activeTab]}
              onPress={() => setActiveTab(tab.value as TabType)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.value && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Now Playing Movies */}
        <View style={styles.section}>
          <FlatList
            horizontal
            data={moviesByTab}
            renderItem={({ item }) => <MovieCard movie={item} size="medium" />}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moviesList}
          />
        </View>

        {/* Premium Cinemas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RẠP CAO CẤP GẦN BẠN</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>XEM TRÊN BẢN ĐỒ</Text>
            </TouchableOpacity>
          </View>
          {cinemas.map((cinema) => (
            <CinemaCard key={cinema.id} cinema={cinema} />
          ))}
        </View>
        {/* Membership Banner */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.membershipBanner}
        >
          <View style={styles.membershipContent}>
            <FontAwesome5 name="crown" size={40} color="#FFD700" />
            <View style={styles.membershipText}>
              <Text style={styles.membershipTitle}>THÀNH VIÊN ELITE</Text>
              <Text style={styles.membershipSubtitle}>
                Nhận ưu đãi 20% tất cả vé + Nâng cấp miễn phí
              </Text>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>THAM GIA NGAY</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Header Styles
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 3,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  iconButton: {
    padding: 5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#4c1d95",
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  // Sections
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  // Movie Card
  movieCard: {
    marginRight: 15,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    height: 320,
  },
  moviePoster: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  movieGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  movieBadges: {
    position: "absolute",
    top: 15,
    left: 15,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  movieInfo: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  movieMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  movieGenre: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  movieRating: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "700",
    marginLeft: 4,
  },
  movieDuration: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  // Featured List
  featuredList: {
    paddingLeft: 5,
  },
  moviesList: {
    paddingLeft: 5,
  },
  // Quick Actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 20,
  },
  quickAction: {
    alignItems: "center",
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    borderWidth: 1,
    borderColor: "#667eea",
  },
  tabText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: "#667eea",
  },
  // Cinema Card
  cinemaCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cinemaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  cinemaName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cinemaLocation: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    color: "#667eea",
    fontWeight: "600",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  featureTag: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  featureText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  selectButton: {
    backgroundColor: "#667eea",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  // Upcoming Movies
  upcomingCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    marginRight: 15,
    width: width * 0.7,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  upcomingPoster: {
    width: 100,
    height: "100%",
    resizeMode: "cover",
  },
  upcomingInfo: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  upcomingTag: {
    fontSize: 10,
    color: "#667eea",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 5,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  releaseDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 15,
  },
  releaseDateText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  remindButton: {
    backgroundColor: "transparent",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#667eea",
  },
  remindButtonText: {
    color: "#667eea",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Membership Banner
  membershipBanner: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 25,
    padding: 25,
  },
  membershipContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  membershipText: {
    flex: 1,
    marginHorizontal: 15,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  membershipSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  joinButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  joinButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  // Spacer
  bottomSpacer: {
    height: 100,
  },
});
