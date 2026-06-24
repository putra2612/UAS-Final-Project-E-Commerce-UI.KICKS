import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShop } from "../context/ShopContext";

export default function CheckoutScreen() {
  const { paymentMethods, checkout, fetchPaymentMethods, user, createPaymentMethod } = useShop();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const uniquePaymentMethods = paymentMethods.reduce((acc: typeof paymentMethods, current) => {
    const isDuplicate = acc.some(item => item.name.toLowerCase() === current.name.toLowerCase());
    if (!isDuplicate) {
      return acc.concat([current]);
    }
    return acc;
  }, []);

  const handleCreateDefaultPayment = async () => {
    const success = await createPaymentMethod("GoPay", "wallet", "https://example.com/gopay.png");
    if (success) {
      Alert.alert("Sukses", "Metode pembayaran GoPay berhasil dibuat untuk Proyek Anda!");
    }
  };

  const handleProcessCheckout = async () => {
    if (!address.trim()) {
      return Alert.alert("Error", "Alamat pengiriman wajib diisi.");
    }
    if (!selectedMethod) {
      return Alert.alert("Error", "Pilih salah satu metode pembayaran API.");
    }

    try {
      setIsLoading(true);

      const success = await checkout(address, selectedMethod);
      
      if (success) {
        Alert.alert(
          "Sukses",
          "Transaksi checkout berhasil disimpan di database server!",
          [
            {
              text: "Buka Riwayat Pesanan",
              onPress: () => router.replace({ pathname: "/(tabs)/profile" }),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert("Gagal", "Terjadi kesalahan saat menyambung ke server API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        
        {/* 1. INFORMASI USER IDENTITY */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Identitas Akun Customer</Text>
          <Text style={styles.cardMainText}>{user?.name || "Loading..."}</Text>
          <Text style={styles.cardSubText}>{user?.email}</Text>
        </View>

        {/* 2. FORM INPUT ALAMAT */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Alamat Tujuan Lengkap</Text>
          <TextInput
            placeholder="Tuliskan nama jalan, nomor rumah, kota, dan kode pos paket..."
            placeholderTextColor="#9ca3af"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={styles.textArea}
          />
        </View>

        {/* 3. SELEKSI OPSI METODE PEMBAYARAN */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pilih Metode Pembayaran Proyek Anda</Text>
          
          {uniquePaymentMethods.length === 0 ? (
            <View>
              <Text style={styles.noPaymentText}>
                Belum ada opsi pembayaran di database proyek.
              </Text>
              <TouchableOpacity onPress={handleCreateDefaultPayment} style={styles.createPaymentBtn}>
                <Text style={styles.createPaymentBtnText}>Buat Metode Pembayaran Uji Coba (GoPay)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.methodListContainer}>
              {uniquePaymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedMethod(method.id)}
                    style={[
                      styles.paymentOption,
                      isSelected && styles.paymentOptionActive,
                    ]}
                  >
                    <View style={styles.methodLeftRow}>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioInnerCircle} />}
                      </View>
                      <Text style={[styles.paymentName, isSelected && styles.paymentNameSelected]}>
                        {method.name}
                      </Text>
                    </View>

                    <View style={[
                      styles.badge,
                      method.type === "bank" ? styles.bankBadge : styles.walletBadge
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        method.type === "bank" ? styles.bankBadgeText : styles.walletBadgeText
                      ]}>
                        {method.type}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* TOMBOL DENGAN SAFE AREA VIEW AGAR TERHINDAR DARI NAVIGASI HP */}
      <SafeAreaView edges={["bottom"]} style={styles.footerContainer}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={handleProcessCheckout} 
          disabled={isLoading}
          style={[styles.payBtn, isLoading && styles.payBtnDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.payBtnText}>Kirim Transaksi ke Server</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: { 
    flex: 1, 
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  cardMainText: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#111827",
  },
  cardSubText: { 
    fontSize: 13, 
    color: "#6b7280", 
    marginTop: 2,
  },
  noPaymentText: {
    fontSize: 13,
    color: "#ef4444",
    marginTop: 4,
    lineHeight: 18,
    fontWeight: "500",
  },
  textArea: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    color: "#111827",
    minHeight: 80,
    marginTop: 4,
  },
  methodListContainer: {
    gap: 10,
    marginTop: 4,
  },
  paymentOption: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  paymentOptionActive: { 
    borderColor: "#2563eb", 
    backgroundColor: "#eff6ff",
  },
  methodLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#2563eb",
  },
  radioInnerCircle: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#2563eb",
  },
  paymentName: { 
    fontWeight: "600", 
    color: "#374151", 
    fontSize: 14,
  },
  paymentNameSelected: {
    color: "#1d4ed8",
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  walletBadge: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  bankBadge: {
    backgroundColor: "#fff7ed",
    borderColor: "#ffedd5",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  walletBadgeText: {
    color: "#4b5563",
  },
  bankBadgeText: {
    color: "#c2410c",
  },
  
  // SOLUSI UTAMA: Jarak bawah otomatis diserahkan ke SafeAreaView
  footerContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "android" ? 16 : 0, // Tambahan padding khusus Android jika virtual buttons aktif
    borderTopWidth: 1,
    borderColor: "#f3f4f6",
  },
  payBtn: {
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  payBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  payBtnText: { 
    color: "#ffffff", 
    fontWeight: "700", 
    fontSize: 15,
  },
  createPaymentBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#3b82f6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  createPaymentBtnText: {
    color: "#3b82f6",
    fontWeight: "700",
    fontSize: 13,
  },
});