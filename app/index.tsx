import { Redirect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../config/firebase";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 🛡️ CHECK AUTH CÓ TỒN TẠI
    if (!auth) {
      console.error("Firebase auth is undefined");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ❌ chưa login → về login
  if (!user) {
    return <Redirect href="/login" />;
  }

  // ✅ đã login → vào home (tab)
  return <Redirect href="/(tab)" />;
}
