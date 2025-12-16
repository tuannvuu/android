import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
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

const { width } = Dimensions.get("window");

// INTERFACE FOR TYPES
interface Movie {
  id: string;
  title: string;
  genre: string[];
  rating: number;
  duration: string;
  year: number;
  poster: string;
  backdrop: string;
  description: string;
  isIMAX?: boolean;
  is4D?: boolean;
  isVIP?: boolean;
}

interface Cinema {
  id: string;
  name: string;
  location: string;
  distance: string;
  features: string[];
}

interface UpcomingMovie {
  id: string;
  title: string;
  releaseDate: string;
  poster: string;
  tag: string;
}

// MOCK DATA - PREMIUM MOVIES
const featuredMovies: Movie[] = [
  {
    id: "1",
    title: "DUNE: PART TWO",
    genre: ["Sci-Fi", "Adventure", "Epic"],
    rating: 4.8,
    duration: "2h 46m",
    year: 2024,
    poster:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop",
    backdrop:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=400&fit=crop",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    isIMAX: true,
    is4D: true,
    isVIP: true,
  },
  {
    id: "2",
    title: "FURIOSA",
    genre: ["Action", "Adventure", "Thriller"],
    rating: 4.7,
    duration: "2h 28m",
    year: 2024,
    poster:
      "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=600&fit=crop",
    backdrop:
      "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=800&h=400&fit=crop",
    description:
      "The origin story of renegade warrior Furiosa before her encounter with Mad Max.",
    isIMAX: true,
    is4D: false,
    isVIP: true,
  },
  {
    id: "3",
    title: "KINGDOM OF THE PLANET OF THE APES",
    genre: ["Sci-Fi", "Action", "Drama"],
    rating: 4.5,
    duration: "2h 25m",
    year: 2024,
    poster:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w-400&h=600&fit=crop",
    backdrop:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop",
    description:
      "Many years after Caesar's reign, apes are the dominant species living harmoniously.",
    isIMAX: true,
    is4D: true,
    isVIP: false,
  },
];

const nowPlayingMovies: Movie[] = [
  {
    id: "4",
    title: "INSIDE OUT 2",
    genre: ["Animation", "Family", "Comedy"],
    rating: 4.9,
    duration: "1h 56m",
    year: 2024,
    poster:
      "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop",
    backdrop: "",
    description: "",
    isIMAX: false,
    is4D: true,
    isVIP: true,
  },
  {
    id: "5",
    title: "DEADPOOL & WOLVERINE",
    genre: ["Action", "Comedy", "Superhero"],
    rating: 4.8,
    duration: "2h 18m",
    year: 2024,
    poster:
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
    backdrop: "",
    description: "",
    isIMAX: true,
    is4D: true,
    isVIP: true,
  },
  {
    id: "6",
    title: "GHOSTBUSTERS: FROZEN EMPIRE",
    genre: ["Comedy", "Fantasy", "Adventure"],
    rating: 4.2,
    duration: "1h 55m",
    year: 2024,
    poster:
      "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=600&fit=crop",
    backdrop: "",
    description: "",
    isIMAX: false,
    is4D: false,
    isVIP: false,
  },
];

const cinemas: Cinema[] = [
  {
    id: "1",
    name: "LiDoRa IMAX Theater",
    location: "Downtown Central",
    distance: "0.5 mi",
    features: ["IMAX", "4DX", "VIP Lounge", "Dolby Atmos"],
  },
  {
    id: "2",
    name: "Galaxy Premium Cinema",
    location: "Westgate Mall",
    distance: "2.1 mi",
    features: ["IMAX", "ScreenX", "Gold Class"],
  },
  {
    id: "3",
    name: "Starlight Cinemas",
    location: "Riverside Plaza",
    distance: "3.4 mi",
    features: ["4DX", "Kids Friendly", "Bar"],
  },
];

const upcomingMovies: UpcomingMovie[] = [
  {
    id: "1",
    title: "JOKER: FOLIE À DEUX",
    releaseDate: "Oct 4, 2024",
    poster:
      "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=600&fit=crop",
    tag: "MUSICAL THRILLER",
  },
  {
    id: "2",
    title: "VENOM: THE LAST DANCE",
    releaseDate: "Oct 25, 2024",
    poster:
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
    tag: "FINAL CHAPTER",
  },
  {
    id: "3",
    title: "MOANA 2",
    releaseDate: "Nov 27, 2024",
    poster:
      "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop",
    tag: "ANIMATED SEQUEL",
  },
];

// COMPONENTS
const MovieCard = ({
  movie,
  size = "medium",
}: {
  movie: Movie;
  size?: "small" | "medium" | "large";
}) => {
  const cardWidth =
    size === "large"
      ? width * 0.8
      : size === "medium"
      ? width * 0.6
      : width * 0.4;

  return (
    <TouchableOpacity
      style={[styles.movieCard, { width: cardWidth }]}
      activeOpacity={0.9}
    >
      <Image source={{ uri: movie.poster }} style={styles.moviePoster} />
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
          {movie.title}
        </Text>
        <View style={styles.movieMeta}>
          <Text style={styles.movieGenre}>{movie.genre.join(" • ")}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.movieRating}>{movie.rating}</Text>
          </View>
        </View>
        <Text style={styles.movieDuration}>
          {movie.duration} • {movie.year}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CinemaCard = ({ cinema }: { cinema: Cinema }) => (
  <TouchableOpacity style={styles.cinemaCard} activeOpacity={0.9}>
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
    <TouchableOpacity style={styles.selectButton}>
      <Text style={styles.selectButtonText}>SELECT</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const UpcomingMovieCard = ({ movie }: { movie: UpcomingMovie }) => (
  <TouchableOpacity style={styles.upcomingCard}>
    <Image source={{ uri: movie.poster }} style={styles.upcomingPoster} />
    <View style={styles.upcomingInfo}>
      <Text style={styles.upcomingTag}>{movie.tag}</Text>
      <Text style={styles.upcomingTitle}>{movie.title}</Text>
      <View style={styles.releaseDate}>
        <MaterialIcons name="date-range" size={16} color="#667eea" />
        <Text style={styles.releaseDateText}>Releases {movie.releaseDate}</Text>
      </View>
      <TouchableOpacity style={styles.remindButton}>
        <Text style={styles.remindButtonText}>REMIND ME</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function PremiumHomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("nowPlaying");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header */}
      <LinearGradient colors={["#000428", "#004e92"]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>LiDoRa</Text>
            <Text style={styles.headerSubtitle}>PREMIUM EXPERIENCE</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <FontAwesome5 name="user" size={20} color="#FFF" />
            </TouchableOpacity>
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
            placeholder="Search movies, cinemas..."
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
            <Text style={styles.sectionTitle}>FEATURED PREMIUM</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={featuredMovies}
            renderItem={({ item }) => <MovieCard movie={item} size="large" />}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
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
            <Text style={styles.actionText}>Book Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.actionIcon, { backgroundColor: "#00B4D8" }]}>
              <MaterialIcons
                name="confirmation-number"
                size={24}
                color="#FFF"
              />
            </View>
            <Text style={styles.actionText}>My Tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.actionIcon, { backgroundColor: "#9D4EDD" }]}>
              <FontAwesome5 name="crown" size={20} color="#FFF" />
            </View>
            <Text style={styles.actionText}>VIP Club</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.actionIcon, { backgroundColor: "#4CAF50" }]}>
              <MaterialIcons name="restaurant" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionText}>Food & Drinks</Text>
          </TouchableOpacity>
        </View>

        {/* Now Playing / Coming Soon Tabs */}
        <View style={styles.tabContainer}>
          {["NOW PLAYING", "COMING SOON", "SPECIAL EVENTS"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab.toLowerCase().replace(" ", "") &&
                  styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.toLowerCase().replace(" ", ""))}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.toLowerCase().replace(" ", "") &&
                    styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Now Playing Movies */}
        <View style={styles.section}>
          <FlatList
            horizontal
            data={nowPlayingMovies}
            renderItem={({ item }) => <MovieCard movie={item} size="medium" />}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moviesList}
          />
        </View>

        {/* Premium Cinemas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PREMIUM CINEMAS NEAR YOU</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>MAP VIEW</Text>
            </TouchableOpacity>
          </View>
          {cinemas.map((cinema) => (
            <CinemaCard key={cinema.id} cinema={cinema} />
          ))}
        </View>

        {/* Upcoming Movies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>COMING SOON</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>CALENDAR</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {upcomingMovies.map((movie) => (
              <UpcomingMovieCard key={movie.id} movie={movie} />
            ))}
          </ScrollView>
        </View>

        {/* Membership Banner */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.membershipBanner}
        >
          <View style={styles.membershipContent}>
            <FontAwesome5 name="crown" size={40} color="#FFD700" />
            <View style={styles.membershipText}>
              <Text style={styles.membershipTitle}>ELITE MEMBERSHIP</Text>
              <Text style={styles.membershipSubtitle}>
                Get 20% off all tickets + Free upgrades
              </Text>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>JOIN NOW</Text>
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
