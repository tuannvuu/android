import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { askGemini } from "../services/gemini";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function ChatBox({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào 👋 Mình có thể giúp gì cho bạn?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const reply = await askGemini(input);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: reply,
        sender: "bot",
      },
    ]);
    console.log("askGemini =", askGemini);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Trợ lý AI</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text style={{ color: item.sender === "user" ? "#fff" : "#000" }}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Nhập câu hỏi..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#667eea" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    right: 15,
    width: 300,
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 10,
  },
  header: {
    backgroundColor: "#667eea",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontWeight: "700",
  },
  bubble: {
    margin: 6,
    padding: 8,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#667eea",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#e5e7eb",
    alignSelf: "flex-start",
  },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginRight: 6,
  },
});
