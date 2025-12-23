import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userPhone = await AsyncStorage.getItem("userPhone");

        // Đảm bảo router đã sẵn sàng trước khi replace
        if (userPhone) {
          setTimeout(() => router.replace("/(tab)"), 1);
        } else {
          setTimeout(() => router.replace("/login"), 1);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
      }
    };

    checkLoginStatus();
  }, []);

  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tab)" />
      {/* LƯU Ý: Không được khai báo Stack.Screen cho file firebase.ts ở đây.
         Đó là lý do bạn nên dời file đó ra khỏi thư mục app.
      */}
    </Stack>
  );
}
