import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ẩn tiêu đề phía trên
        tabBarShowLabel: false, // Ẩn chữ Home/Profile
        tabBarStyle: { display: "none" }, // Xóa hoàn toàn thanh điều hướng màu trắng
      }}
    >
      {/* Bạn cần khai báo các màn hình con ở đây để chúng hoạt động */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
