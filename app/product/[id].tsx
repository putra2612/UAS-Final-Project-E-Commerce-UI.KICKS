import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useShop } from "../../context/ShopContext";

const getSneakerImage = (productName: string) => {
  const name = productName.trim();

  const imageMapping: { [key: string]: any } = {
    "Adidas NMD_R1": require("../../assets/images/Adidas NMD_R1.webp"),
    "Adidas Samba OG": require("../../assets/images/Adidas Samba OG.webp"),
    "Adidas Stan Smith": require("../../assets/images/Adidas Stan Smith.webp"),
    "Adidas Superstar": require("../../assets/images/Adidas Superstar.webp"),
    "Adidas Superstar2": require("../../assets/images/Adidas Superstar2.webp"),
    "Adidas Ultra Boost New Arrival": require("../../assets/images/Adidas Ultra Boost New Arrival.webp"),
    "Adidas Ultraboost 22": require("../../assets/images/Adidas Ultraboost 22.webp"),
    "Asics Gel-Kayano 29": require("../../assets/images/Asics Gel-Kayano 29.webp"),
    "Converse Chuck 70": require("../../assets/images/Converse Chuck 70.webp"),
    "Converse Chuck Taylor": require("../../assets/images/Converse Chuck Taylor.webp"),
    "Converse Run Star Hike": require("../../assets/images/Converse Run Star Hike.webp"),
    "New Balance 550": require("../../assets/images/New Balance 550.webp"),
    "New Balance 990v5": require("../../assets/images/New Balance 990v5.webp"),
    "JORDAN Retro Collection": require("../../assets/images/JORDAN Retro Collection.webp"),
    "Nike Air Force 1 '07": require("../../assets/images/Nike Air Force 1 '07.avif"),
    "Nike Air Force 1": require("../../assets/images/Nike Air Force 1.webp"),
    "Nike Air Max 270": require("../../assets/images/Nike Air Max 270.webp"),
    "Nike Air Max": require("../../assets/images/Nike Air Max.webp"),
    "Nike Blazer Mid '77": require("../../assets/images/Nike Blazer Mid '77.webp"),
    "Nike Dunk Low Panda": require("../../assets/images/Nike Dunk Low Panda.webp"),
    "Nike TN Air Max Plus": require("../../assets/images/Nike TN Air Max Plus.webp"),
    "Nike ZoomX Vaporfly": require("../../assets/images/Nike ZoomX Vaporfly.webp"),
    "Puma RS-X": require("../../assets/images/Puma RS-X.webp"),
    "Puma Suede Classic": require("../../assets/images/Puma Suede Classic.jpg"),
    "Puma Suede Classic2": require("../../assets/images/Puma Suede Classic2.webp"),
    "Reebok Club C 85": require("../../assets/images/Reebok Club C 85.webp"),
    "Vans Old Skool": require("../../assets/images/Vans Old Skool.webp"),
    "Vans Slip-On Checkerboard": require("../../assets/images/Vans Slip-On Checkerboard.webp"),
  };

  return imageMapping[name] || require("../../assets/images/icon.png");
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { products, addToCart } = useShop();
  const router = useRouter();

  const product = products.find((p) => p.id === Number(id));
  const isOutOfStock = !product || product.productStock === 0;

  const [qty, setQty] = useState(isOutOfStock ? 0 : 1);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const availableSizes = [39, 40, 41, 42, 43, 44];

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Produk Tidak Ditemukan</Text>
      </View>
    );
  }

  const localImageSource = getSneakerImage(product.productName);

  const handleAddToCart = async () => {
    if (product.productStock === 0) {
      Alert.alert("Gagal", "Maaf, produk ini sudah habis.");
      return;
    }

    if (selectedSize === null) {
      Alert.alert("Pilih Ukuran", "Silakan pilih ukuran sepatu kamu terlebih dahulu.");
      return;
    }

    if (qty > product.productStock) {
      Alert.alert("Gagal", "Jumlah melebihi batas stok aktif proyek.");
      return;
    }
    
    const success = await addToCart(product.id, qty, selectedSize || undefined);
    if (success) {
      Alert.alert(
        "Sukses", 
        `${product.productName} (Size: ${selectedSize}) berhasil masuk ke keranjang belanja.`, 
        [
          { text: "Tetap Disini" },
          { text: "Lihat Cart", onPress: () => router.push("/(tabs)/cart") },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Detail Produk",
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "bold", fontSize: 16, color: "#1f2937" },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#ffffff" },
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        {/* FRAME GAMBAR PRODUK YANG SUDAH DIRAPIKAN */}
        <View style={styles.imageContainer}>
          <Image 
            source={localImageSource} 
            style={styles.productImage} 
            resizeMode="contain" 
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{product.productName}</Text>
          <Text style={styles.price}>
            Rp {product.productPrice.toLocaleString("id-ID")}
          </Text>
          
          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Pilih Ukuran (EU)</Text>
          <View style={styles.sizeRow}>
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  disabled={isOutOfStock}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.sizeBox,
                    isSelected && styles.selectedSizeBox,
                    isOutOfStock && styles.disabledSizeBox
                  ]}
                >
                  <Text style={[
                    styles.sizeText,
                    isSelected && styles.selectedSizeText,
                    isOutOfStock && styles.disabledText
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />
          
          <Text style={styles.sectionLabel}>Deskripsi Produk</Text>
          <Text style={styles.description}>
            {product.productDescription || "Tidak ada deskripsi untuk produk ini."}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.qtyContainer}>
          <Text style={styles.qtyLabel}>
            Jumlah (Stok: {product.productStock})
          </Text>
          
          <View style={styles.qtyRow}>
            <TouchableOpacity
              onPress={() => setQty(Math.max(1, qty - 1))}
              disabled={isOutOfStock}
              style={[styles.qtyBtn, isOutOfStock && styles.disabledQtyBtn]}
            >
              <Text style={[styles.qtyBtnText, isOutOfStock && styles.disabledText]}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.qtyValue}>{qty}</Text>
            
            <TouchableOpacity
              onPress={() => setQty(Math.min(product.productStock, qty + 1))}
              disabled={isOutOfStock || qty >= product.productStock}
              style={[styles.qtyBtn, (isOutOfStock || qty >= product.productStock) && styles.disabledQtyBtn]}
            >
              <Text style={[styles.qtyBtnText, (isOutOfStock || qty >= product.productStock) && styles.disabledText]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          style={[styles.primaryButton, isOutOfStock && styles.disabledPrimaryButton]}
        >
          <Text style={styles.primaryButtonText}>
            {isOutOfStock ? "🔒 Stok Habis" : "Tambah Ke Keranjang Belanja"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#ffffff" 
  },
  scrollContainer: { 
    paddingBottom: 20 
  },
  centerContainer: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#ffffff" 
  },
  errorText: { 
    fontSize: 16, 
    color: "#6b7280", 
    fontWeight: "500" 
  },
  
// STYLES
  imageContainer: { 
    width: "100%", 
    height: 320,               
    backgroundColor: "#ffffff", 
    alignItems: "center", 
    justifyContent: "center",
    borderBottomWidth: 1,       
    borderColor: "#f3f4f6",
  },
  productImage: { 
    width: "80%",             
    height: "80%" 
  },
  
  infoContainer: { 
    padding: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#1f2937", 
    marginBottom: 6 
  },
  price: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#2563eb", 
    marginBottom: 16 
  },
  divider: { 
    height: 1, 
    backgroundColor: "#e5e7eb", 
    marginVertical: 16 
  },
  sectionLabel: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "#1f2937", 
    marginBottom: 12, 
    textTransform: "uppercase", 
    letterSpacing: 0.5 
  },
  description: { 
    fontSize: 14, 
    color: "#4b5563", 
    lineHeight: 22 
  },
  
  // Perbaikan Grid Size Row agar lurus sejajar satu baris
  sizeRow: { 
    flexDirection: "row", 
    flexWrap: "nowrap",
    justifyContent: "space-between",
    gap: 6
  },
  sizeBox: { 
    flex: 1,
    height: 44,
    maxHeight: 44,
    maxWidth: 46,
    borderWidth: 1, 
    borderColor: "#d1d5db", 
    borderRadius: 8, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#ffffff" 
  },
  selectedSizeBox: { 
    backgroundColor: "#111827", 
    borderColor: "#111827" 
  },
  disabledSizeBox: { 
    backgroundColor: "#f3f4f6", 
    borderColor: "#e5e7eb" 
  },
  sizeText: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#1f2937" 
  },
  selectedSizeText: { 
    color: "#ffffff" 
  },

  footer: { 
    borderTopWidth: 1, 
    borderTopColor: "#f3f4f6", 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 32, 
    backgroundColor: "#ffffff" 
  },
  qtyContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 16 
  },
  qtyLabel: { 
    color: "#4b5563", 
    fontSize: 13, 
    fontWeight: "600" 
  },
  qtyRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#d1d5db", 
    borderRadius: 8, 
    overflow: "hidden" 
  },
  qtyBtn: { 
    paddingVertical: 6, 
    paddingHorizontal: 14, 
    backgroundColor: "#f3f4f6" 
  },
  qtyBtnText: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#1f2937" 
  },
  qtyValue: { 
    paddingHorizontal: 16, 
    fontWeight: "bold", 
    fontSize: 14, 
    color: "#1f2937" 
  },
  primaryButton: { 
    backgroundColor: "#111827", 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  primaryButtonText: { 
    color: "#ffffff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  
  disabledPrimaryButton: { 
    backgroundColor: "#9ca3af" 
  },
  disabledQtyBtn: { 
    backgroundColor: "#e5e7eb" 
  },
  disabledText: { 
    color: "#9ca3af" 
  }
});