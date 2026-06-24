import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ShopProvider, useShop } from "../context/ShopContext";

function RootContent() {
  const { token, login, register, loading } = useShop();
  const [isLoginView, setIsLoginView] = useState(true);

  // State Form Input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password || (!isLoginView && !name)) {
      alert("Mohon isi semua bidang form!");
      return;
    }
    if (isLoginView) {
      await login(email, password);
    } else {
      const success = await register(name, email, password);
      if (success) setIsLoginView(true);
    }
  };

  // 🔒 GATEKEEPER: Jika token tidak ada, kunci layar dengan Form Login/Register
  if (!token) {
    return (
      <ScrollView contentContainerStyle={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>
            {isLoginView ? "Sign In Kelompok" : "Register Akun Baru"}
          </Text>
          <Text style={styles.authSubtitle}>
            Sistem Multi-tenant E-Commerce API
          </Text>

          {!isLoginView && (
            <TextInput
              placeholder="Nama Lengkap"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          )}
          <TextInput
            placeholder="Alamat Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Kata Sandi"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#3b82f6"
              style={{ marginVertical: 10 }}
            />
          ) : (
            <TouchableOpacity onPress={handleSubmit} style={styles.authBtn}>
              <Text style={styles.authBtnText}>
                {isLoginView ? "Masuk Sekarang" : "Daftarkan Akun"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setIsLoginView(!isLoginView)}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>
              {isLoginView
                ? "Belum punya akun? Daftar disini"
                : "Sudah terdaftar? Silakan Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // 🔓 Jika berhasil login, tampilkan Stack Navigasi Utama Aplikasi
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="product/[id]"
        options={{ headerShown: true, title: "Detail Produk" }}
      />
      <Stack.Screen
        name="checkout"
        options={{ headerShown: true, title: "Pengiriman & Pembayaran" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ShopProvider>
      <RootContent />
    </ShopProvider>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flexGrow: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    padding: 20,
  },
  authCard: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  authBtn: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  authBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 15 },
  switchBtn: { marginTop: 16, alignItems: "center" },
  switchText: { color: "#3b82f6", fontSize: 13, fontWeight: "500" },
});
