import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../context/ShopContext";

const { width } = Dimensions.get("window");
const cardWidth = (width - 40) / 2;

// FUNGSI MEMETAKAN NAMA PRODUK KE FILE ASET LOKAL YANG KAMU MILIKI
const getLocalSneakerImage = (productName: string) => {
  const name = productName.trim();

  // Objek pemetaan berdasarkan nama file asli di folder assets/images kamu
  const imageMapping: { [key: string]: any } = {
    // Adidas
    "Adidas NMD_R1": require("../assets/images/Adidas NMD_R1.webp"),
    "Adidas Samba OG": require("../assets/images/Adidas Samba OG.webp"),
    "Adidas Stan Smith": require("../assets/images/Adidas Stan Smith.webp"),
    "Adidas Superstar": require("../assets/images/Adidas Superstar.webp"),
    "Adidas Superstar2": require("../assets/images/Adidas Superstar2.webp"),
    "Adidas Ultra Boost New Arrival": require("../assets/images/Adidas Ultra Boost New Arrival.webp"),
    "Adidas Ultraboost 22": require("../assets/images/Adidas Ultraboost 22.webp"),

    // Asics & Converse
    "Asics Gel-Kayano 29": require("../assets/images/Asics Gel-Kayano 29.webp"),
    "Converse Chuck 70": require("../assets/images/Converse Chuck 70.webp"),
    "Converse Chuck Taylor": require("../assets/images/Converse Chuck Taylor.webp"),
    "Converse Run Star Hike": require("../assets/images/Converse Run Star Hike.webp"),

    // New Balance & Jordan
    "New Balance 550": require("../assets/images/New Balance 550.webp"),
    "New Balance 990v5": require("../assets/images/New Balance 990v5.webp"),
    "JORDAN Retro Collection": require("../assets/images/JORDAN Retro Collection.webp"),

    // Nike
    "Nike Air Force 1 '07": require("../assets/images/Nike Air Force 1 '07.avif"),
    "Nike Air Force 1": require("../assets/images/Nike Air Force 1.webp"),
    "Nike Air Max 270": require("../assets/images/Nike Air Max 270.webp"),
    "Nike Air Max": require("../assets/images/Nike Air Max.webp"),
    "Nike Blazer Mid '77": require("../assets/images/Nike Blazer Mid '77.webp"),
    "Nike Dunk Low Panda": require("../assets/images/Nike Dunk Low Panda.webp"),
    "Nike TN Air Max Plus": require("../assets/images/Nike TN Air Max Plus.webp"),
    "Nike ZoomX Vaporfly": require("../assets/images/Nike ZoomX Vaporfly.webp"),

    // Puma, Reebok & Vans
    "Puma RS-X": require("../assets/images/Puma RS-X.webp"),
    "Puma Suede Classic": require("../assets/images/Puma Suede Classic.jpg"),
    "Puma Suede Classic2": require("../assets/images/Puma Suede Classic2.webp"),
    "Reebok Club C 85": require("../assets/images/Reebok Club C 85.webp"),
    "Vans Old Skool": require("../assets/images/Vans Old Skool.webp"),
    "Vans Slip-On Checkerboard": require("../assets/images/Vans Slip-On Checkerboard.webp"),
  };

  // Kembalikan gambar yang cocok, atau pakai icon.png sebagai fallback jika nama tidak terdaftar
  return imageMapping[name] || require("../assets/images/icon.png");
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  // Panggil fungsi gambar lokal di atas
  const localImageSource = getLocalSneakerImage(product.productName);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.productCard}
      testID={`product-card-${product.id}`}
      activeOpacity={0.8}
    >
      {/* Frame Wadah Gambar */}
      <View style={styles.imageContainer}>
        <Image 
          source={localImageSource} 
          style={styles.productImage} 
          resizeMode="cover"
        />
      </View>

      {/* Detail Informasi Nama Produk */}
      <Text style={styles.productName} numberOfLines={1}>
        {product.productName}
      </Text>

      {/* Harga Produk Berformat Rupiah (IDR) */}
      <Text style={styles.productPrice}>
        Rp {product.productPrice.toLocaleString("id-ID")}
      </Text>

      {/* Menampilkan Jumlah Stok Aktif */}
      <Text style={styles.productStock}>
        Stok aktif: {product.productStock} pasang
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 16,
    width: cardWidth,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productName: { 
    fontWeight: "bold", 
    color: "#1f2937", 
    fontSize: 14,
    marginBottom: 2,
  },
  productPrice: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  productStock: { 
    color: "#9ca3af", 
    fontSize: 10, 
    marginTop: 4 
  },
});