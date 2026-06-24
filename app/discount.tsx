import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DiscountForm from "../components/DiscountForm";
import { calculateTotal } from "../utils/discountHelper";

export default function DiscountScreen() {
  const [totalAkhir, setTotalAkhir] = useState(0); // State untuk menyimpan hasil akhir setelah diskon diterapkan
  const DISKON_TETAP = 10; // Aplikasi ini memberikan diskon tetap 10%

  // Fungsi untuk menghitung total akhir setelah diskon diterapkan, akan dipanggil saat pengguna menekan tombol "Pergi ke Discount"
  const handleCalculate = (harga: number): void => {
    // Panggil fungsi calculateTotal dari discountHelper dengan harga yang dimasukkan pengguna dan diskon tetap 10%
    const hasil = calculateTotal(harga, DISKON_TETAP);

    // Update state totalAkhir dengan hasil yang dihitung, sehingga teks hasil di layar akan otomatis terupdate dengan nilai baru
    setTotalAkhir(hasil);
  };

  return (
    <View style={styles.container}>
      {/* Tampilkan judul aplikasi di bagian atas layar */}
      <Text style={styles.title}>Aplikasi Diskon 10%</Text>

      {/* Tampilkan Form untuk input harga */}
      <DiscountForm onCalculate={handleCalculate} />

      {/* Tampilkan hasil akhir setelah diskon diterapkan */}
      <Text style={styles.textTotal}>Total Bayar: Rp {totalAkhir}</Text>
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
  textTotal: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
