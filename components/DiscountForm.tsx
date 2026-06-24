import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DiscountFormProps {
  onCalculate: (price: number) => void;
}
export default function DiscountForm({ onCalculate }: DiscountFormProps) {
  const [price, setPrice] = useState(""); // State untuk menyimpan input harga dari pengguna

  return (
    <View style={styles.container}>
      {/* Tampilkan judul aplikasi di bagian atas layar */}
      <Text style={styles.title}>Aplikasi Diskon</Text>

      {/* Tampilkan Form untuk input harga */}
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Masukkan Harga"
        value={price}
        onChangeText={setPrice}
        testID="input-harga"
      />

      {/* Tampilkan tombol untuk menghitung diskon */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => onCalculate(Number(price))}
        testID="tombol-hitung"
      >
        <Text style={styles.buttonText}>Pergi ke Discount</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
});
