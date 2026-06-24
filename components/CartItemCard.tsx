import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CartItem } from "../context/ShopContext";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQty: (cartId: number, qty: number) => void;
  onRemove: (cartId: number) => void;
}

export default function CartItemCard({ item, onUpdateQty, onRemove }: CartItemCardProps) {
  const price = item.product?.productPrice || 0;

  return (
    <View style={styles.card}>
      <View style={styles.infoColumn}>
        <Text style={styles.name} numberOfLines={1}>
          {item.product?.productName || "Produk Sepatu"}
        </Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.price}>
            Rp {price.toLocaleString("id-ID")}
          </Text>
          
          {/* BADGE UKURAN SEPATU PREMIUM */}
          <View style={styles.sizeBadge}>
            <Text style={styles.sizeText}>EU {item.size || 40}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity
            onPress={() => onUpdateQty(item.id, item.quantity - 1)}
            style={styles.qtyButton}
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onUpdateQty(item.id, item.quantity + 1)}
            style={styles.qtyButton}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => onRemove(item.id)} 
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  infoColumn: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 14,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "700",
  },
  sizeBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  sizeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4b5563",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#f9fafb",
    overflow: "hidden",
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
  },
  qtyButtonText: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 12,
  },
  qtyValue: {
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "700",
  },
});