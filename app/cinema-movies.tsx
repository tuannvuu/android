import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { onValue, ref } from "firebase/database";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
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

const { height } = Dimensions.get("window");

interface Movie {
  id: string;
  title: string;
  poster: string;
  rating: number;
  duration: string;
  year: string;
  genres: string[];
  description: string;
  director?: string;
  cast?: string[];
}

interface Showtime {
  id: string;
  time: string;
  format: string;
  theater: string;
  price: number;
  seats: number;
}

export default function CinemaMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Record<string, Showtime[]>>({});
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("today");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [allGenres, setAllGenres] = useState<string[]>([]);

  // Ngày chiếu mẫu
  const dates = [
    { id: "today", label: "Hôm nay", date: "Thứ 4, 20/12" },
    { id: "tomorrow", label: "Ngày mai", date: "Thứ 5, 21/12" },
    { id: "day3", label: "Thứ 6", date: "22/12" },
    { id: "day4", label: "Thứ 7", date: "23/12" },
    { id: "day5", label: "CN", date: "24/12" },
  ];

  // Định dạng chiếu
  const formats = [
    { id: "all", label: "Tất cả" },
    { id: "2d", label: "2D" },
    { id: "3d", label: "3D" },
    { id: "imax", label: "IMAX" },
    { id: "4dx", label: "4DX" },
  ];

  useEffect(() => {
    // Lấy danh sách phim
    const moviesRef = ref(db, "movies");
    const moviesUnsubscribe = onValue(moviesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const moviesArray: Movie[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setMovies(moviesArray);
        setFilteredMovies(moviesArray);

        // Tạo dữ liệu giờ chiếu mẫu
        generateMockShowtimes(moviesArray);

        // Extract all unique genres
        const genresSet = new Set<string>();
        moviesArray.forEach((movie) => {
          if (movie.genres && Array.isArray(movie.genres)) {
            movie.genres.forEach((genre) => genresSet.add(genre));
          }
        });
        setAllGenres(Array.from(genresSet));
      }
      setLoading(false);
    });

    return () => moviesUnsubscribe();
  }, []);

  const generateMockShowtimes = (movies: Movie[]) => {
    const showtimesData: Record<string, Showtime[]> = {};
    const theaters = ["Rạp 1", "Rạp 2", "Rạp 3", "Rạp VIP"];
    const timeSlots = ["09:00", "11:30", "14:00", "16:30", "19:00", "21:30"];
    const formatsList = ["2D", "3D", "IMAX", "4DX"];

    movies.forEach((movie) => {
      const movieShowtimes: Showtime[] = [];
      const showtimeCount = Math.floor(Math.random() * 4) + 3; // 3-6 suất chiếu

      for (let i = 0; i < showtimeCount; i++) {
        const randomFormat =
          formatsList[Math.floor(Math.random() * formatsList.length)];
        const randomTime =
          timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const randomTheater =
          theaters[Math.floor(Math.random() * theaters.length)];
        const basePrice =
          randomFormat === "2D"
            ? 75000
            : randomFormat === "3D"
            ? 95000
            : randomFormat === "IMAX"
            ? 120000
            : 150000;

        movieShowtimes.push({
          id: `${movie.id}_${i}`,
          time: randomTime,
          format: randomFormat,
          theater: randomTheater,
          price: basePrice,
          seats: Math.floor(Math.random() * 20) + 10, // 10-30 ghế trống
        });
      }

      // Sắp xếp theo thời gian
      movieShowtimes.sort((a, b) => a.time.localeCompare(b.time));
      showtimesData[movie.id] = movieShowtimes;
    });

    setShowtimes(showtimesData);
  };

  // Filter và sort movies
  useEffect(() => {
    let result = [...movies];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply genre filter
    if (selectedGenres.length > 0) {
      result = result.filter((movie) =>
        selectedGenres.some((genre) => movie.genres?.includes(genre))
      );
    }

    // Apply format filter
    if (selectedFormat !== "all") {
      result = result.filter((movie) => {
        const movieShowtimes = showtimes[movie.id] || [];
        return movieShowtimes.some(
          (st) => st.format.toLowerCase() === selectedFormat.toLowerCase()
        );
      });
    }

    setFilteredMovies(result);
  }, [searchQuery, selectedGenres, selectedFormat, movies, showtimes]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenres([]);
    setSelectedFormat("all");
    setSelectedDate("today");
  };

  const navigateToMovieDetails = (movieId: string) => {
    router.push({
      pathname: "/movie-details",
      params: { id: movieId },
    });
  };

  const navigateToSeatSelection = (movieId: string, showtimeId: string) => {
    router.push({
      pathname: "/select-seat",
      params: {
        movieId,
        showtimeId,
      },
    });
  };

  const renderShowtimeButton = (showtime: Showtime, movieId: string) => (
    <TouchableOpacity
      key={showtime.id}
      style={styles.showtimeButton}
      onPress={() => navigateToSeatSelection(movieId, showtime.id)}
      activeOpacity={0.7}
    >
      <View style={styles.showtimeTop}>
        <Text style={styles.showtimeTime}>{showtime.time}</Text>
        <View
          style={[
            styles.formatBadge,
            showtime.format === "IMAX" && styles.imaxBadge,
            showtime.format === "4DX" && styles.fourDXBadge,
            showtime.format === "3D" && styles.threeDBadge,
          ]}
        >
          <Text style={styles.formatText}>{showtime.format}</Text>
        </View>
      </View>
      <Text style={styles.showtimeTheater}>{showtime.theater}</Text>
      <View style={styles.showtimeBottom}>
        <Text style={styles.showtimePrice}>
          {showtime.price.toLocaleString()}₫
        </Text>
        <View style={styles.seatsAvailable}>
          <Ionicons name="person-outline" size={12} color="#4CAF50" />
          <Text style={styles.seatsText}>{showtime.seats} ghế</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMovieCard = ({ item }: { item: Movie }) => {
    const movieShowtimes = showtimes[item.id] || [];
    const filteredShowtimes =
      selectedFormat === "all"
        ? movieShowtimes
        : movieShowtimes.filter(
            (st) => st.format.toLowerCase() === selectedFormat.toLowerCase()
          );

    return (
      <View style={styles.movieCard}>
        {/* Phần thông tin phim */}
        <TouchableOpacity
          style={styles.movieInfoSection}
          onPress={() => navigateToMovieDetails(item.id)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: item.poster }} style={styles.poster} />
          <View style={styles.movieDetails}>
            <View style={styles.movieHeader}>
              <Text style={styles.movieTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {item.rating?.toFixed(1) || "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.movieMeta}>
              <Text style={styles.movieMetaText}>{item.year}</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.movieMetaText}>
                {item.duration || "120"} phút
              </Text>
            </View>

            <View style={styles.genreTags}>
              {item.genres?.slice(0, 3).map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreTagText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>

        {/* Phần giờ chiếu */}
        <View style={styles.showtimesSection}>
          <View style={styles.showtimesHeader}>
            <Ionicons name="time-outline" size={16} color="#667eea" />
            <Text style={styles.showtimesTitle}>Giờ chiếu</Text>
          </View>

          {filteredShowtimes.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.showtimesContainer}
            >
              {filteredShowtimes.map((showtime) =>
                renderShowtimeButton(showtime, item.id)
              )}
            </ScrollView>
          ) : (
            <View style={styles.noShowtimes}>
              <Ionicons
                name="time-outline"
                size={24}
                color="rgba(255,255,255,0.3)"
              />
              <Text style={styles.noShowtimesText}>
                Không có suất chiếu{" "}
                {selectedFormat !== "all" ? `(${selectedFormat})` : ""}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Lịch Chiếu Phim</Text>
          <Text style={styles.headerSubtitle}>
            Chọn phim và suất chiếu phù hợp
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={24} color="#FFF" />
          {(selectedGenres.length > 0 || selectedFormat !== "all") && (
            <View style={styles.filterIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm phim..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color="rgba(255,255,255,0.6)"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Ngày chiếu */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.datesContainer}
        contentContainerStyle={styles.datesContent}
      >
        {dates.map((date) => (
          <TouchableOpacity
            key={date.id}
            style={[
              styles.dateButton,
              selectedDate === date.id && styles.dateButtonSelected,
            ]}
            onPress={() => setSelectedDate(date.id)}
          >
            <Text
              style={[
                styles.dateLabel,
                selectedDate === date.id && styles.dateLabelSelected,
              ]}
            >
              {date.label}
            </Text>
            <Text
              style={[
                styles.dateText,
                selectedDate === date.id && styles.dateTextSelected,
              ]}
            >
              {date.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Định dạng chiếu */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.formatsContainer}
        contentContainerStyle={styles.formatsContent}
      >
        {formats.map((format) => (
          <TouchableOpacity
            key={format.id}
            style={[
              styles.formatFilterButton,
              selectedFormat === format.id && styles.formatFilterButtonSelected,
            ]}
            onPress={() => setSelectedFormat(format.id)}
          >
            <Text
              style={[
                styles.formatFilterText,
                selectedFormat === format.id && styles.formatFilterTextSelected,
              ]}
            >
              {format.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={["#0A0A0F", "#1A1A2E"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải lịch chiếu...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={filteredMovies}
        renderItem={renderMovieCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.movieList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="film-outline"
              size={80}
              color="rgba(255,255,255,0.3)"
            />
            <Text style={styles.emptyStateTitle}>Không tìm thấy phim</Text>
            <Text style={styles.emptyStateText}>
              Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
            </Text>
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} tint="dark" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ Lọc Nâng Cao</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Genre Filter */}
              {allGenres.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Thể loại</Text>
                  <View style={styles.genreFilterGrid}>
                    {allGenres.map((genre) => (
                      <TouchableOpacity
                        key={genre}
                        style={[
                          styles.genreFilterButton,
                          selectedGenres.includes(genre) &&
                            styles.genreFilterButtonSelected,
                        ]}
                        onPress={() => handleGenreToggle(genre)}
                      >
                        <Text
                          style={[
                            styles.genreFilterText,
                            selectedGenres.includes(genre) &&
                              styles.genreFilterTextSelected,
                          ]}
                        >
                          {genre}
                        </Text>
                        {selectedGenres.includes(genre) && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#667eea"
                            style={styles.genreCheckIcon}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearAllText}>Xóa tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilters(false)}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.applyButtonGradient}
                  >
                    <Text style={styles.applyButtonText}>Áp dụng</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </BlurView>
        </View>
      </Modal>
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
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#0A0A0F",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#667eea",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
  },
  datesContainer: {
    marginBottom: 15,
  },
  datesContent: {
    paddingRight: 20,
    gap: 10,
  },
  dateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    minWidth: 80,
  },
  dateButtonSelected: {
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    borderColor: "rgba(102, 126, 234, 0.5)",
  },
  dateLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  dateLabelSelected: {
    color: "#FFF",
  },
  dateText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  dateTextSelected: {
    color: "#667eea",
  },
  formatsContainer: {
    marginBottom: 10,
  },
  formatsContent: {
    paddingRight: 20,
    gap: 10,
  },
  formatFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  formatFilterButtonSelected: {
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    borderColor: "rgba(102, 126, 234, 0.5)",
  },
  formatFilterText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  formatFilterTextSelected: {
    color: "#667eea",
    fontWeight: "600",
  },
  movieList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  movieCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  movieInfoSection: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  poster: {
    width: 100,
    height: 140,
    borderRadius: 12,
    resizeMode: "cover",
  },
  movieDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  movieHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  movieTitle: {
    flex: 1,
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "700",
  },
  movieMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  movieMetaText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  metaSeparator: {
    color: "rgba(255,255,255,0.3)",
    marginHorizontal: 6,
  },
  genreTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  genreTag: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreTagText: {
    color: "#667eea",
    fontSize: 11,
    fontWeight: "500",
  },
  showtimesSection: {
    padding: 15,
  },
  showtimesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  showtimesTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  showtimesContainer: {
    gap: 10,
  },
  showtimeButton: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    minWidth: 110,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  showtimeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  showtimeTime: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  formatBadge: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  imaxBadge: {
    backgroundColor: "rgba(255, 87, 34, 0.1)",
  },
  fourDXBadge: {
    backgroundColor: "rgba(156, 39, 176, 0.1)",
  },
  threeDBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  formatText: {
    color: "#667eea",
    fontSize: 10,
    fontWeight: "700",
  },
  showtimeTheater: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginBottom: 8,
  },
  showtimeBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  showtimePrice: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "700",
  },
  seatsAvailable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seatsText: {
    color: "#4CAF50",
    fontSize: 12,
  },
  noShowtimes: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  noShowtimesText: {
    color: "rgba(255,255,255,0.4)",
    marginTop: 8,
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  clearFilterButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  clearFilterText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  filterSectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  genreFilterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genreFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  genreFilterButtonSelected: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  genreFilterText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  genreFilterTextSelected: {
    color: "#667eea",
  },
  genreCheckIcon: {
    marginLeft: 6,
  },
  filterActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 25,
    gap: 15,
  },
  clearAllButton: {
    flex: 1,
    paddingVertical: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  clearAllText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    borderRadius: 15,
    overflow: "hidden",
  },
  applyButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
