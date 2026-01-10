import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bot,
  Brain,
  Send,
  Sparkles,
  User,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { askGemini } from "../services/gemini";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
};

export default function ChatAI() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      text: "Xin chào! Tôi là trợ lý AI của LiDoRa Cinema. Tôi có thể giúp bạn tìm phim, xem lịch chiếu và đặt vé.",
    },
    {
      id: "2",
      role: "ai",
      text: "Hãy thử hỏi tôi về: 'Phim đang chiếu hot?', 'Rạp nào gần đây?' hoặc 'Giá vé thế nào?'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const aiResponse = await askGemini(trimmedInput);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: aiResponse,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại sau.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleQuickQuestionPress = (question: string) => {
    setInput(question);
  };

  const quickQuestions = [
    "Phim đang chiếu hot?",
    "Rạp nào gần đây?",
    "Giá vé thế nào?",
    "Có phim hành động không?",
    "Suất chiếu tối nay",
    "Phim cho trẻ em",
  ];

  const renderMessageItem = ({ item }: { item: Message }) => (
    <Animated.View
      style={[
        styles.messageRow,
        item.role === "user" ? styles.userRow : styles.aiRow,
        { opacity: fadeAnim },
      ]}
    >
      <View style={styles.avatarWrapper}>
        {item.role === "user" ? (
          <LinearGradient
            colors={["#4F46E5", "#7C3AED"]}
            style={styles.userAvatar}
          >
            <User size={18} color="#FFF" />
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={["#EC4899", "#8B5CF6"]}
            style={styles.aiAvatar}
          >
            <Bot size={18} color="#FFF" />
          </LinearGradient>
        )}
      </View>

      <LinearGradient
        colors={
          item.role === "user" ? ["#4F46E5", "#7C3AED"] : ["#F8FAFC", "#F1F5F9"]
        }
        style={[
          styles.messageBubble,
          item.role === "user" ? styles.userBubble : styles.aiBubble,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text
          style={[
            styles.messageContent,
            item.role === "user" ? styles.userText : styles.aiText,
          ]}
        >
          {item.text}
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.pageContainer}>
      {/* Header */}
      <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerIconWrapper}>
            <Brain size={22} color="#7C3AED" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Trợ Lý AI</Text>
            <Text style={styles.headerSubtitle}>LiDoRa Cinema</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Thông tin",
              "Trợ lý AI sử dụng công nghệ Gemini để hỗ trợ bạn."
            )
          }
          style={styles.infoBtn}
          activeOpacity={0.7}
        >
          <Sparkles size={20} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Questions */}
      <View style={styles.quickSection}>
        <Text style={styles.quickTitle}>💡 Câu hỏi nhanh</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickList}
        >
          {quickQuestions.map((question, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleQuickQuestionPress(question)}
              style={styles.quickBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.quickText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatArea}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={
            isLoading ? (
              <View style={styles.thinkingContainer}>
                <LinearGradient
                  colors={["#EC4899", "#8B5CF6"]}
                  style={styles.thinkingBubble}
                >
                  <Bot size={14} color="#FFF" />
                  <Text style={styles.thinkingText}> Đang xử lý...</Text>
                </LinearGradient>
              </View>
            ) : null
          }
        />

        {/* Input Area */}
        <View style={styles.inputWrapper}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor="#94A3B8"
            style={styles.textInput}
            multiline
            maxLength={300}
            editable={!isLoading}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!input.trim() || isLoading}
            style={[
              styles.sendBtn,
              (!input.trim() || isLoading) && styles.sendBtnDisabled,
            ]}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                input.trim() ? ["#EC4899", "#8B5CF6"] : ["#CBD5E1", "#94A3B8"]
              }
              style={styles.sendGradient}
            >
              <Send size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          <Sparkles size={12} color="#FFF" /> Powered by Gemini AI
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Quick Questions
  quickSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  quickList: {
    paddingRight: 16,
  },
  quickBtn: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  quickText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },

  // Chat Area
  chatArea: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userRow: {
    flexDirection: "row-reverse",
  },
  aiRow: {
    flexDirection: "row",
  },
  avatarWrapper: {
    width: 34,
    height: 34,
    marginHorizontal: 8,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  aiAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#FFF",
  },
  aiText: {
    color: "#1E293B",
  },

  // Loading
  thinkingContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  thinkingBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  thinkingText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },

  // Input Area
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    maxHeight: 100,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 8,
    overflow: "hidden",
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  // Footer
  footer: {
    paddingVertical: 10,
    backgroundColor: "#4F46E5",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
});
