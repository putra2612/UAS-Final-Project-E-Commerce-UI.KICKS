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
    const price = item.product?.productPrice || 0;
    return sum + price * item.quantity;
  }, 0);

  if (cart.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Keranjang belanja Anda masih kosong</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/" })}
          style={styles.shopButton}
        >
          <Text style={styles.shopButtonText}>Mulai Belanja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onUpdateQty={updateCartQty}
            onRemove={removeFromCart}
          />
        )}
      />

      <View style={styles.totalBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalPrice}>
            Rp {subtotal.toLocaleString("id-ID")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/checkout" })}
          style={styles.checkoutButton}
        >
          <Text style={styles.checkoutButtonText}>Lanjut Ke Pengiriman</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  listContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 16,
    fontWeight: "500",
  },
  shopButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  totalBox: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: "#f3f4f6",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "600",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563eb",
  },
  checkoutButton: {
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
  checkoutButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});