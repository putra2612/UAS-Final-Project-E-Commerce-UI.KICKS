# Panduan Lengkap: Pembuatan Aplikasi Multi-tenant E-Commerce (React Native & Expo Router)

Selamat datang di tutorial komprehensif pembuatan aplikasi **Multi-tenant E-Commerce** berbasis **React Native** dan **Expo**. Panduan ini dirancang khusus untuk mahasiswa Semester 4 guna membantu penyelesaian Proyek Akhir mata kuliah Pemrograman Mobile 2.

Aplikasi ini mengintegrasikan database multi-tenant berbasis backend MySQL + Express, di mana setiap kelompok akan memiliki data terisolasi menggunakan `PROJECT_ID` unik masing-masing.

---

## 🛠️ Daftar Isi
1. [Pendahuluan & Konsep Multi-tenant](#1-pendahuluan--konsep-multi-tenant)
2. [Setup Project Awal](#2-setup-project-awal)
3. [Implementasi Core State & API (ShopContext)](#3-implementasi-core-state--api-shopcontext)
4. [Struktur Navigasi Tab & Stack (Expo Router)](#4-struktur-navigasi-tab--stack-expo-router)
5. [Membuat Komponen UI Reusable & Modular](#5-membuat-komponen-ui-reusable--modular)
6. [Halaman Detail Produk & Logika Keranjang Belanja](#6-halaman-detail-produk--logika-keranjang-belanja)
7. [Halaman Checkout & Pengelolaan Metode Pembayaran](#7-halaman-checkout--pengelolaan-metode-pembayaran)
8. [Setup & Penulisan Unit Testing (Jest)](#8-setup--penulisan-unit-testing-jest)
9. [Tips & Kesimpulan](#9-tips--kesimpulan)

---

## 1. Pendahuluan & Konsep Multi-tenant

Sebelum memulai coding, penting untuk memahami konsep **Multi-tenant**. 
Dalam arsitektur web/mobile, multi-tenant berarti **satu server database digunakan bersama-sama oleh banyak tim kelompok**, namun data antar kelompok tidak akan saling bercampur.

Cara kerjanya dalam project ini:
- Setiap tim kelompok mendaftarkan proyeknya untuk mendapatkan `PROJECT_ID` (misalnya: `13`).
- Saat pengguna (Customer) mendaftar melalui aplikasi, data akunnya akan terikat dengan `PROJECT_ID` kelompok Anda.
- Server API menggunakan token **JWT (JSON Web Token)** untuk mengamankan data. Begitu masuk, data produk, keranjang, dan riwayat pesanan disaring otomatis oleh backend hanya untuk kelompok Anda.

---

## 2. Setup Project Awal

### Langkah 2.1: Inisialisasi Project Expo
Buka terminal/PowerShell Anda, lalu jalankan perintah berikut untuk menginisialisasi project baru:
```bash
npx create-expo-app@latest StickerSmash --template blank-typescript
```

### Langkah 2.2: Instalasi Dependensi yang Dibutuhkan
Masuk ke direktori project dan pasang pustaka pendukung untuk navigasi, ikon, gambar, penyimpanan sesi, serta framework pengujian:
```bash
# Masuk ke direktori
cd StickerSmash

# Pasang pustaka navigasi dan UI Expo
npm install expo-router expo-image @react-navigation/native @react-navigation/bottom-tabs

# Pasang penyimpanan lokal untuk persistence session
npm install @react-native-async-storage/async-storage

# Pasang alat testing
npm install -D jest jest-expo @testing-library/react-native react-test-renderer @types/jest
```

### Langkah 2.3: Konfigurasi `package.json` untuk Testing
Buka file `package.json` dan pastikan konfigurasi test Jest sudah disiapkan sebagai berikut:
```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "test": "jest"
},
"jest": {
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ]
}
```

---

## 3. Implementasi Core State & API (ShopContext)

Kita akan membuat **State Management** menggunakan React Context. Berkas ini berfungsi sebagai jembatan utama komunikasi antara aplikasi React Native kita dengan server API database.

Buat file baru di `context/ShopContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. Definisikan Struktur Data Sesuai Respons API
export interface Product {
  id: number;
  categoryId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStock: number;
}

export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

export interface Category {
  id: number;
  categoryName: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  type: "wallet" | "bank";
}

export interface Purchase {
  id: number;
  address: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  paymentMethod?: PaymentMethod;
}

interface ShopContextType {
  token: string | null;
  user: any | null;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  paymentMethods: PaymentMethod[];
  purchases: Purchase[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCart: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchPurchases: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateCartQty: (cartId: number, qty: number) => Promise<void>;
  removeFromCart: (cartId: number) => Promise<void>;
  checkout: (address: string, paymentMethodId: number) => Promise<boolean>;
  createPaymentMethod: (name: string, type: "wallet" | "bank", logoUrl: string) => Promise<boolean>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const BASE_URL = "https://shop.tandurkarya.com";
  const PROJECT_ID = 13; // ⚠️ Ubah sesuai PROJECT_ID kelompok Anda!

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ id: 0, categoryName: "Semua" }]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Auto-load token JWT dari AsyncStorage untuk fitur "Ingat Saya" (Keep Logged In)
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const savedToken = await AsyncStorage.getItem("userToken");
        if (savedToken) {
          setToken(savedToken);
          // Ambil profil user untuk memastikan token masih aktif
          const res = await fetch(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setUser(data.data);
          } else {
            await AsyncStorage.removeItem("userToken");
            setToken(null);
          }
        }
      } catch (err) {
        console.error("Gagal load session", err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // Integrasi Register Customer Baru
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: PROJECT_ID, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registrasi gagal");
      Alert.alert("Sukses", "Akun berhasil terdaftar!");
      return true;
    } catch (err: any) {
      Alert.alert("Register Error", err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Integrasi Login Customer
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login Gagal");

      setToken(data.data.token);
      await AsyncStorage.setItem("userToken", data.data.token);

      const profileRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.data.token}` },
      });
      const profileData = await profileRes.json();
      setUser(profileData.data);
      return true;
    } catch (err: any) {
      Alert.alert("Login Error", err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
    setCart([]);
    setPurchases([]);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/categories`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories([{ id: 0, categoryName: "Semua" }, ...data.data]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/products`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setProducts(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${BASE_URL}/carts`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setCart(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(`${BASE_URL}/payment-methods`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setPaymentMethods(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`${BASE_URL}/purchases`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setPurchases(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (productId: number, quantity: number): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/carts`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error("Gagal menambahkan ke keranjang");
      await fetchCart();
      return true;
    } catch (err: any) {
      Alert.alert("Cart Error", err.message);
      return false;
    }
  };

  const updateCartQty = async (cartId: number, qty: number) => {
    if (qty <= 0) return removeFromCart(cartId);
    try {
      const res = await fetch(`${BASE_URL}/carts/${cartId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ quantity: qty }),
      });
      await fetchCart();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      await fetch(`${BASE_URL}/carts/${cartId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      await fetchCart();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const checkout = async (address: string, paymentMethodId: number): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/purchases`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ address, paymentMethodId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout gagal");
      setCart([]);
      await fetchPurchases();
      return true;
    } catch (err: any) {
      Alert.alert("Checkout Gagal", err.message);
      return false;
    }
  };

  const createPaymentMethod = async (name: string, type: "wallet" | "bank", logoUrl: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/payment-methods`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, type, logoUrl }),
      });
      if (!res.ok) throw new Error("Gagal membuat opsi pembayaran");
      await fetchPaymentMethods();
      return true;
    } catch (err: any) {
      Alert.alert("Error", err.message);
      return false;
    }
  };

  return (
    <ShopContext.Provider
      value={{
        token, user, products, categories, cart, paymentMethods, purchases, loading,
        login, register, logout, fetchProducts, fetchCategories, fetchCart,
        fetchPaymentMethods, fetchPurchases, addToCart, updateCartQty, removeFromCart,
        checkout, createPaymentMethod
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop harus di dalam ShopProvider");
  return context;
};
```

---

## 4. Struktur Navigasi Tab & Stack (Expo Router)

Expo Router menggunakan struktur folder (file-based routing) untuk mendefinisikan halaman.

### Langkah 4.1: Root Layout & Auth Gatekeeper
Layar ini mendeteksi keberadaan token login. Jika tidak ada token, paksa user mengisi form register/login.

Buat file di `app/_layout.tsx`:
```typescript
import { Stack } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ShopProvider, useShop } from "../context/ShopContext";

function RootContent() {
  const { token, login, register, loading } = useShop();
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password || (!isLoginView && !name)) {
      alert("Isi semua bidang form!");
      return;
    }
    if (isLoginView) {
      await login(email, password);
    } else {
      const success = await register(name, email, password);
      if (success) setIsLoginView(true);
    }
  };

  if (!token) {
    return (
      <ScrollView contentContainerStyle={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>{isLoginView ? "Sign In" : "Register"}</Text>
          <Text style={styles.authSubtitle}>Sistem E-Commerce Multi-tenant</Text>

          {!isLoginView && (
            <TextInput placeholder="Nama Lengkap" value={name} onChangeText={setName} style={styles.input} />
          )}
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            <TouchableOpacity onPress={handleSubmit} style={styles.authBtn}>
              <Text style={styles.authBtnText}>{isLoginView ? "Masuk" : "Daftar"}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setIsLoginView(!isLoginView)} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              {isLoginView ? "Belum punya akun? Daftar" : "Sudah terdaftar? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="product/[id]" options={{ headerShown: true, title: "Detail Produk" }} />
      <Stack.Screen name="checkout" options={{ headerShown: true, title: "Pengiriman" }} />
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
  authContainer: { flexGrow: 1, backgroundColor: "#f3f4f6", justifyContent: "center", padding: 20 },
  authCard: { backgroundColor: "#ffffff", padding: 24, borderRadius: 20, elevation: 3 },
  authTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  authSubtitle: { fontSize: 12, color: "#9ca3af", textAlign: "center", marginBottom: 20 },
  input: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", padding: 12, borderRadius: 10, marginBottom: 12 },
  authBtn: { backgroundColor: "#3b82f6", padding: 14, borderRadius: 10, alignItems: "center" },
  authBtnText: { color: "#ffffff", fontWeight: "bold" },
  switchBtn: { marginTop: 16, alignItems: "center" },
  switchText: { color: "#3b82f6", fontWeight: "500" },
});
```

---

## 5. Membuat Komponen UI Reusable & Modular

Kita pisahkan logika kartu tampilan data ke folder `components/` agar modular dan mudah dibaca (reusable).

### Komponen 5.1: `ProductCard.tsx`
Buat di `components/ProductCard.tsx` untuk menampilkan item produk di grid beranda:
```typescript
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../context/ShopContext";

const { width } = Dimensions.get("window");
const cardWidth = (width - 40) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.productCard} testID={`product-card-${product.id}`}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>No Image Frame</Text>
      </View>
      <Text style={styles.productName} numberOfLines={1}>{product.productName}</Text>
      <Text style={styles.productPrice}>Rp {product.productPrice.toLocaleString("id-ID")}</Text>
      <Text style={styles.productStock}>Stok aktif: {product.productStock}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: { backgroundColor: "#ffffff", padding: 12, borderRadius: 16, width: cardWidth, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6" },
  imagePlaceholder: { width: "100%", height: 120, backgroundColor: "#e5e7eb", borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  imagePlaceholderText: { color: "#9ca3af", fontSize: 11 },
  productName: { fontWeight: "bold", color: "#1f2937", fontSize: 14 },
  productPrice: { color: "#3b82f6", fontSize: 13, fontWeight: "600", marginTop: 4 },
  productStock: { color: "#9ca3af", fontSize: 10, marginTop: 2 }
});
```

### Komponen 5.2: `CartItemCard.tsx`
Buat di `components/CartItemCard.tsx` untuk menampilkan item belanja dalam keranjang:
```typescript
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CartItem } from "../context/ShopContext";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQty: (cartId: number, qty: number) => void;
  onRemove: (cartId: number) => void;
}

export default function CartItemCard({ item, onUpdateQty, onRemove }: CartItemCardProps) {
  return (
    <View style={styles.cartCard} testID={`cart-item-card-${item.id}`}>
      <View style={styles.cartInfo}>
        <Text style={styles.cartName} numberOfLines={1}>{item.product?.productName || "Produk Tidak Dikenal"}</Text>
        <Text style={styles.cartPrice}>Rp {((item.product?.productPrice || 0) * item.quantity).toLocaleString("id-ID")}</Text>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.qtyWrapper}>
          <TouchableOpacity onPress={() => onUpdateQty(item.id, item.quantity - 1)} style={styles.qtyActionBtn} testID={`btn-decrease-${item.id}`}>
            <Text style={styles.qtyActionText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText} testID={`qty-text-${item.id}`}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => onUpdateQty(item.id, item.quantity + 1)} style={styles.qtyActionBtn} testID={`btn-increase-${item.id}`}>
            <Text style={styles.qtyActionText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.deleteBtn} testID={`btn-delete-${item.id}`}>
          <Text style={styles.deleteBtnText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartCard: { backgroundColor: "#ffffff", padding: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6" },
  cartInfo: { flex: 1, paddingRight: 8 },
  cartName: { fontWeight: "bold", color: "#1f2937", fontSize: 14 },
  cartPrice: { color: "#3b82f6", fontSize: 12, marginTop: 2, fontWeight: "500" },
  actionRow: { flexDirection: "row", alignItems: "center" },
  qtyWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, marginRight: 12 },
  qtyActionBtn: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#f9fafb" },
  qtyActionText: { fontWeight: "bold" },
  qtyText: { paddingHorizontal: 10, fontSize: 12, fontWeight: "600" },
  deleteBtn: { backgroundColor: "#fef2f2", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { color: "#ef4444", fontSize: 12, fontWeight: "600" }
});
```

### Komponen 5.3: `OrderCard.tsx`
Buat di `components/OrderCard.tsx` untuk menampilkan daftar riwayat pesanan (checkout):
```typescript
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Purchase } from "../context/ShopContext";

interface OrderCardProps {
  order: Purchase;
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <View style={styles.orderCard} testID={`order-card-${order.id}`}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.invoiceNo}>Invoice ID: #{order.id}</Text>
          <Text style={styles.orderDate}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID") : "Hari ini"}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
      <Text style={styles.addressText} numberOfLines={1}>📍 Alamat: {order.address}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderMethod}>Metode ID: {order.paymentMethod?.name || "Selesai"}</Text>
        <Text style={styles.orderTotal}>Total: Rp {order.totalPrice.toLocaleString("id-ID")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orderCard: { backgroundColor: "#ffffff", padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingBottom: 8, marginBottom: 8 },
  invoiceNo: { fontWeight: "bold", fontSize: 12, color: "#374151" },
  orderDate: { fontSize: 10, color: "#9ca3af", marginTop: 1 },
  statusBadge: { backgroundColor: "#d1fae5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, justifyContent: "center" },
  statusText: { fontSize: 9, color: "#065f46", fontWeight: "bold", textTransform: "uppercase" },
  addressText: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  orderFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 8, marginTop: 4 },
  orderMethod: { fontSize: 11, color: "#9ca3af" },
  orderTotal: { fontSize: 13, fontWeight: "bold", color: "#3b82f6" }
});
```

---

## 6. Halaman Detail Produk & Logika Keranjang Belanja

### Langkah 6.1: Layar Beranda (HomeScreen)
Layar utama untuk render kategori dan grid produk yang sudah ter-filter.

Buat di `app/(tabs)/index.tsx`:
```typescript
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useShop } from "../../context/ShopContext";
import ProductCard from "../../components/ProductCard";

export default function HomeScreen() {
  const { products, categories, fetchProducts, fetchCategories, user } = useShop();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoadingRefresh(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoadingRefresh(false);
    };
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      selectedCategory === "Semua" ||
      p.categoryId === categories.find((c) => c.categoryName === selectedCategory)?.id;
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subGreeting}>Halo, {user?.name || "Mahasiswa"}</Text>
        <Text style={styles.mainGreeting}>Proyek Akhir Kelompok Anda</Text>
      </View>

      <TextInput placeholder="Cari produk di proyek ini..." value={search} onChangeText={setSearch} style={styles.searchBar} />

      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.categoryName)}
              style={[styles.categoryBadge, selectedCategory === item.categoryName && styles.categoryBadgeActive]}
            >
              <Text style={[styles.categoryText, selectedCategory === item.categoryName && styles.categoryTextActive]}>
                {item.categoryName}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loadingRefresh ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  header: { marginBottom: 16 },
  subGreeting: { color: "#6b7280", fontSize: 13 },
  mainGreeting: { fontSize: 20, fontWeight: "bold", color: "#1f2937" },
  searchBar: { backgroundColor: "#ffffff", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 16 },
  categoryContainer: { marginBottom: 16 },
  categoryBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#e5e7eb", marginRight: 8 },
  categoryBadgeActive: { backgroundColor: "#3b82f6" },
  categoryText: { color: "#374151", fontWeight: "500" },
  categoryTextActive: { color: "#ffffff" },
  gridRow: { justifyContent: "space-between" }
});
```

### Langkah 6.2: Layar Detail Produk (`ProductDetailScreen`)
Menampilkan deskripsi detail dan memicu penambahan item ke cart secara asinkron dengan validasi stok.

Buat di `app/product/[id].tsx`:
```typescript
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useShop } from "../../context/ShopContext";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { products, addToCart } = useShop();
  const router = useRouter();

  const product = products.find((p) => p.id === Number(id));
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text>Produk Tidak Ditemukan</Text>
      </View>
    );
  }

  const handleAddToCart = async () => {
    if (qty > product.productStock) {
      Alert.alert("Gagal", "Jumlah melebihi batas stok aktif proyek.");
      return;
    }
    const success = await addToCart(product.id, qty);
    if (success) {
      Alert.alert("Sukses", "Item berhasil masuk ke keranjang belanja.", [
        { text: "Tetap Disini" },
        { text: "Lihat Cart", onPress: () => router.push("/(tabs)/cart") },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageBigPlaceholder}>
        <Text style={styles.imageBigText}>Pratinjau Gambar Produk</Text>
      </View>
      <Text style={styles.title}>{product.productName}</Text>
      <Text style={styles.price}>Rp {product.productPrice.toLocaleString("id-ID")}</Text>
      <Text style={styles.description}>{product.productDescription}</Text>

      <View style={styles.footer}>
        <View style={styles.qtyContainer}>
          <Text style={styles.qtyLabel}>Atur Jumlah (Stok: {product.productStock})</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity onPress={() => setQty(qty + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleAddToCart} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Tambah Ke Keranjang Belanja</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", padding: 16 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  imageBigPlaceholder: { width: "100%", height: 240, backgroundColor: "#e5e7eb", borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  imageBigText: { color: "#9ca3af", fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
  price: { fontSize: 18, fontWeight: "600", color: "#3b82f6", marginBottom: 12 },
  description: { fontSize: 14, color: "#4b5563", lineHeight: 20 },
  footer: { marginTop: "auto", borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 16 },
  qtyContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  qtyLabel: { color: "#4b5563", fontSize: 13, fontWeight: "500" },
  qtyRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8 },
  qtyBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#f3f4f6" },
  qtyBtnText: { fontSize: 16, fontWeight: "bold" },
  qtyValue: { paddingHorizontal: 16, fontWeight: "bold", fontSize: 14 },
  primaryButton: { backgroundColor: "#3b82f6", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  primaryButtonText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 }
});
```

### Langkah 6.3: Layar Keranjang Belanja (CartScreen)
Buat di `app/(tabs)/cart.tsx` untuk memanipulasi item belanjaan sebelum checkout:
```typescript
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useShop } from "../../context/ShopContext";
import CartItemCard from "../../components/CartItemCard";

export default function CartScreen() {
  const { cart, updateCartQty, removeFromCart, fetchCart } = useShop();
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = cart.reduce((sum, item) => {
    const harga = item.product?.productPrice || 0;
    return sum + harga * item.quantity;
  }, 0);

  if (cart.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Keranjang belanja API Anda kosong</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: "/" })} style={styles.shopBtn}>
          <Text style={styles.shopBtnText}>Mulai Belanja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CartItemCard item={item} onUpdateQty={updateCartQty} onRemove={removeFromCart} />
        )}
      />

      <View style={styles.totalBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Pembayaran:</Text>
          <Text style={styles.totalPrice}>Rp {subtotal.toLocaleString("id-ID")}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: "/checkout" })} style={styles.checkoutBtn}>
          <Text style={styles.checkoutBtnText}>Lanjut Ke Pengiriman</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" },
  emptyText: { color: "#9ca3af", marginBottom: 12 },
  shopBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  shopBtnText: { color: "#ffffff", fontWeight: "600" },
  totalBox: { backgroundColor: "#ffffff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb", marginTop: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalLabel: { color: "#6b7280" },
  totalPrice: { fontSize: 18, fontWeight: "bold", color: "#3b82f6" },
  checkoutBtn: { backgroundColor: "#3b82f6", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  checkoutBtnText: { color: "#ffffff", fontWeight: "bold" }
});
```

---

## 7. Halaman Checkout & Pengelolaan Metode Pembayaran

Aplikasi membutuhkan minimal satu opsi metode pembayaran. Di halaman ini kita siapkan tombol pengisian otomatis opsi pembayaran agar flow checkout langsung siap pakai.

Buat di `app/checkout.tsx`:
```typescript
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useShop } from "../context/ShopContext";

export default function CheckoutScreen() {
  const { paymentMethods, checkout, fetchPaymentMethods, user, createPaymentMethod } = useShop();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleCreateDefaultPayment = async () => {
    const success = await createPaymentMethod("GoPay", "wallet", "https://example.com/gopay.png");
    if (success) {
      Alert.alert("Sukses", "Metode pembayaran GoPay berhasil dibuat!");
    }
  };

  const handleProcessCheckout = async () => {
    if (!address.trim()) return Alert.alert("Error", "Alamat pengiriman wajib diisi.");
    if (!selectedMethod) return Alert.alert("Error", "Pilih salah satu metode pembayaran.");

    const success = await checkout(address, selectedMethod);
    if (success) {
      Alert.alert("Sukses", "Transaksi berhasil dibuat!", [
        { text: "Buka Riwayat Pesanan", onPress: () => router.replace({ pathname: "/(tabs)/profile" }) }
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Akun Customer</Text>
        <Text style={styles.cardMainText}>{user?.name || "Loading..."}</Text>
        <Text style={styles.cardSubText}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Alamat Pengiriman</Text>
        <TextInput
          placeholder="Tuliskan nama jalan, kota, dan kode pos paket..."
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Metode Pembayaran</Text>
        {paymentMethods.length === 0 ? (
          <View>
            <Text style={styles.noPaymentText}>Belum ada opsi pembayaran di database proyek.</Text>
            <TouchableOpacity onPress={handleCreateDefaultPayment} style={styles.createPaymentBtn}>
              <Text style={styles.createPaymentBtnText}>Buat Opsi GoPay Otomatis</Text>
            </TouchableOpacity>
          </View>
        ) : (
          paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedMethod(method.id)}
              style={[styles.paymentOption, selectedMethod === method.id && styles.paymentOptionActive]}
            >
              <Text style={styles.paymentName}>{method.name}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{method.type}</Text></View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity onPress={handleProcessCheckout} style={styles.payBtn}>
        <Text style={styles.payBtnText}>Kirim Transaksi ke Server</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  card: { backgroundColor: "#ffffff", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  cardLabel: { fontSize: 11, fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase", marginBottom: 6 },
  cardMainText: { fontSize: 15, fontWeight: "bold", color: "#1f2937" },
  cardSubText: { fontSize: 12, color: "#6b7280" },
  noPaymentText: { fontSize: 12, color: "#ef4444", marginTop: 4 },
  textArea: { backgroundColor: "#f9fafb", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", fontSize: 13, textAlignVertical: "top", marginTop: 4 },
  paymentOption: { padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  paymentOptionActive: { borderColor: "#3b82f6", backgroundColor: "#eff6ff" },
  paymentName: { fontWeight: "500", color: "#374151" },
  badge: { backgroundColor: "#e5e7eb", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 9, color: "#4b5563", fontWeight: "bold", textTransform: "uppercase" },
  payBtn: { backgroundColor: "#2563eb", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 32 },
  payBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
  createPaymentBtn: { backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#3b82f6", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 8 },
  createPaymentBtnText: { color: "#3b82f6", fontWeight: "bold", fontSize: 12 }
});
```

---

## 8. Setup & Penulisan Unit Testing (Jest)

Menulis tes penting untuk menjamin tidak ada bug regresi saat melakukan perubahan kode.

### Berkas Tes 8.1: `ProductCard.test.tsx`
Buat di `components/__tests__/ProductCard.test.tsx`:
```typescript
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import ProductCard from "../ProductCard";

describe("ProductCard Component Test", () => {
  const mockProduct = {
    id: 1,
    categoryId: 2,
    productName: "Laptop ASUS",
    productDescription: "Laptop Gaming",
    productPrice: 15000000,
    productStock: 10,
  };

  it("harus merender informasi produk dengan benar", () => {
    const { getByText } = render(<ProductCard product={mockProduct} onPress={jest.fn()} />);
    expect(getByText("Laptop ASUS")).toBeTruthy();
    expect(getByText("Rp 15.000.000")).toBeTruthy();
  });
});
```

### Berkas Tes 8.2: `index.test.tsx` (Layar Beranda)
Buat di `app/(tabs)/__tests__/index.test.tsx` menggunakan `waitFor` untuk menguji pemanggilan asinkron:
```typescript
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "../index";
import { useShop } from "../../../context/ShopContext";

jest.mock("../../../context/ShopContext", () => ({ useShop: jest.fn() }));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe("HomeScreen Test", () => {
  it("harus merender salam pengguna dan list produk", async () => {
    (useShop as jest.Mock).mockReturnValue({
      products: [{ id: 1, productName: "HP iPhone", productPrice: 10000000, productStock: 5 }],
      categories: [{ id: 0, categoryName: "Semua" }],
      fetchProducts: jest.fn().mockResolvedValue(undefined),
      fetchCategories: jest.fn().mockResolvedValue(undefined),
      user: { name: "Ahmad" }
    });

    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText("Halo, Ahmad")).toBeTruthy();
      expect(getByText("HP iPhone")).toBeTruthy();
    });
  });
});
```

Jalankan perintah pengujian Anda di terminal:
```bash
npm test
```

---

## 9. Tips & Kesimpulan

- **Cek Project ID Anda**: Selalu pastikan variabel `PROJECT_ID` di `ShopContext.tsx` sudah diganti dengan ID unik kelompok Anda yang terdaftar di Postman.
- **Kondisi Sesi Pengguna**: Berkat `AsyncStorage`, data sesi login akan bertahan meskipun device emulator Anda direstart atau aplikasi di-reload.
- **Penanganan Eror**: Pastikan penanganan eror di blok `try-catch` selalu memunculkan `Alert.alert` agar mempermudah debugging saat ada kendala koneksi ke server produksi API.

Selamat belajar dan semoga sukses menyelesaikan Proyek Akhir Praktikum Pemrograman Mobile 2!
