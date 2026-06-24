import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ========================================================
// 1. DEFINISI TYPE / INTERFACE (MENYESUAIKAN RESPONSE API)
// ========================================================
export interface Product {
  id: number;
  categoryId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStock: number;
}

export interface CartItem {
  id: number; // ID unik item cart
  quantity: number;
  product: Product; // Join data detail produk dari API
  size?: number;    // TAMBAHAN: Menyimpan info ukuran secara lokal di aplikasi
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
  items?: {
    id: number;
    quantity: number;
    productName: string;
    productPrice: number;
  }[];
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
  // PERBAIKAN: Menambahkan parameter size (opsional agar tidak merusak fungsi lama)
  addToCart: (productId: number, quantity: number, size?: number) => Promise<boolean>;
  updateCartQty: (cartId: number, qty: number) => Promise<void>;
  removeFromCart: (cartId: number) => Promise<void>;
  checkout: (address: string, paymentMethodId: number) => Promise<boolean>;
  createPaymentMethod: (name: string, type: "wallet" | "bank", logoUrl: string) => Promise<boolean>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const BASE_URL = "https://shop.tandurkarya.com";
  const PROJECT_ID = 13;

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ id: 0, categoryName: "Semua" }]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Auto-load session token dari AsyncStorage saat pertama kali aplikasi dibuka
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const savedToken = await AsyncStorage.getItem("userToken");
        if (savedToken) {
          setToken(savedToken);
          const profileRes = await fetch(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          const profileData = await profileRes.json();
          if (profileRes.ok && profileData.success) {
            setUser(profileData.data);
          } else {
            await AsyncStorage.removeItem("userToken");
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Gagal memuat token dari storage", err);
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

  // ========================================================
  // 2. FUNGSI AUTENTIKASI (AUTH API)
  // ========================================================
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: PROJECT_ID, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registrasi Gagal");
      Alert.alert("Sukses", "Akun berhasil terdaftar di bawah Project ID Anda.");
      return true;
    } catch (err: any) {
      Alert.alert("Register Error", err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

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
    try {
      await AsyncStorage.removeItem("userToken");
    } catch (err) {
      console.error("Gagal menghapus session token", err);
    }
    setToken(null);
    setUser(null);
    setCart([]);
    setPurchases([]);
  };

  // ========================================================
  // 3. FUNGSI AMBIL DATA (GET DATA API)
  // ========================================================
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/categories`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories([{ id: 0, categoryName: "Semua" }, ...data.data]);
      }
    } catch (err) {
      console.error("Gagal mengambil data kategori", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/products`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setProducts(data.data);
    } catch (err) {
      console.error("Gagal mengambil data produk", err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${BASE_URL}/carts`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        // Ambil data dari storage lokal jika ada data size lama yang tersimpan
        const localSizesRaw = await AsyncStorage.getItem("cart_sizes");
        const localSizes = localSizesRaw ? JSON.parse(localSizesRaw) : {};

        // Petakan data cart dari server dan gabungkan dengan info size lokal
        const injectedCart = data.data.map((item: any) => ({
          ...item,
          size: localSizes[item.id] || 40 // Default ke 40 jika belum tersimpan di memori
        }));
        
        setCart(injectedCart);
      }
    } catch (err) {
      console.error("Gagal mengambil data keranjang", err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(`${BASE_URL}/payment-methods`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setPaymentMethods(data.data);
    } catch (err) {
      console.error("Gagal mengambil metode pembayaran", err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`${BASE_URL}/purchases`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setPurchases(data.data);
    } catch (err) {
      console.error("Gagal mengambil riwayat transaksi", err);
    }
  };

  // ========================================================
  // 4. FUNGSI MODIFIKASI DATA (MUTATION API)
  // ========================================================
  
  // PERBAIKAN UTAMA: Menangkap parameter size, dikirim ke API lalu di-cache aman ke device
  const addToCart = async (productId: number, quantity: number, size?: number): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/carts`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      
      if (!res.ok) throw new Error("Gagal menambahkan item ke server keranjang");
      
      // Mengambil response cart terbaru dari server terlebih dahulu
      const cartRes = await fetch(`${BASE_URL}/carts`, { headers: getHeaders() });
      const cartData = await cartRes.json();
      
      if (cartRes.ok && cartData.success && size) {
        // Cari id item keranjang yang baru saja dibuat server untuk produk ini
        const newAddedItem = cartData.data.find((item: any) => item.product.id === productId);
        
        if (newAddedItem) {
          // Ambil data size yang sudah tersimpan di device sebelumnya
          const localSizesRaw = await AsyncStorage.getItem("cart_sizes");
          const localSizes = localSizesRaw ? JSON.parse(localSizesRaw) : {};
          
          // Masukkan data ukuran baru menggunakan ID Cart dari server sebagai key
          localSizes[newAddedItem.id] = size;
          await AsyncStorage.setItem("cart_sizes", JSON.stringify(localSizes));
        }
      }

      await fetchCart(); // Sinkronisasi ulang data lokal lengkap dengan size
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
      if (!res.ok) throw new Error("Gagal memperbarui kuantitas");
      await fetchCart();
    } catch (err: any) {
      Alert.alert("Update Cart Error", err.message);
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/carts/${cartId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Gagal menghapus item");
      
      // Hapus data size item tersebut dari memori device agar bersih
      const localSizesRaw = await AsyncStorage.getItem("cart_sizes");
      if (localSizesRaw) {
        const localSizes = JSON.parse(localSizesRaw);
        delete localSizes[cartId];
        await AsyncStorage.setItem("cart_sizes", JSON.stringify(localSizes));
      }

      await fetchCart();
    } catch (err: any) {
      Alert.alert("Delete Error", err.message);
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
      if (!res.ok) throw new Error(data.message || "Proses checkout gagal divalidasi server");

      // Bersihkan juga cache ukuran lokal karena transaksi sudah sukses
      await AsyncStorage.removeItem("cart_sizes");
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
      setLoading(true);
      const res = await fetch(`${BASE_URL}/payment-methods`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, type, logoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat metode pembayaran");
      await fetchPaymentMethods();
      return true;
    } catch (err: any) {
      Alert.alert("Error", err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        token,
        user,
        products,
        categories,
        cart,
        paymentMethods,
        purchases,
        loading,
        login,
        register,
        logout,
        fetchProducts,
        fetchCategories,
        fetchCart,
        fetchPaymentMethods,
        fetchPurchases,
        addToCart,
        updateCartQty,
        removeFromCart,
        checkout,
        createPaymentMethod,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop harus dibungkus di dalam ShopProvider");
  return context;
};