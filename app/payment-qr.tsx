import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PaymentQR() {
  const { orderUrl } = useLocalSearchParams<{
    orderUrl: string;
    totalAmount: string;
  }>();

  const openZaloPay = async () => {
    await Linking.openURL(orderUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán ZaloPay</Text>
      <TouchableOpacity style={styles.button} onPress={openZaloPay}>
        <Text style={styles.buttonText}>Mở ứng dụng ZaloPay</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  amount: {
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#0A68FF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
