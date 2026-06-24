import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Purchase } from "../context/ShopContext";

// Interface mendefinisikan prop yang diterima oleh komponen OrderCard
interface OrderCardProps {
  order: Purchase;
}

/**
 * Komponen Reusable OrderCard
 * Digunakan untuk merender item dalam daftar riwayat pembelian di halaman ProfileScreen.
 * Menampilkan detail Invoice ID, Tanggal Transaksi, Alamat Pengiriman, Status, dan Total Pembayaran.
 */
export default function OrderCard({ order }: OrderCardProps) {
  return (
    <View style={styles.orderCard} testID={`order-card-${order.id}`}>
      {/* Bagian Header Order Card */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.invoiceNo}>Invoice ID: #{order.id}</Text>
          <Text style={styles.orderDate}>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("id-ID")
              : "Hari ini"}
          </Text>
        </View>

        {/* Badge Status Pesanan */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      {/* Rincian Alamat Pengiriman */}
      <Text style={styles.addressText} numberOfLines={1}>
        📍 Alamat: {order.address}
      </Text>

      {/* Bagian Footer Order Card (Metode Pembayaran dan Total Harga) */}
      <View style={styles.orderFooter}>
        <Text style={styles.orderMethod}>
          Metode ID: {order.paymentMethod?.name || "Selesai"}
        </Text>
        <Text style={styles.orderTotal}>
          Total: Rp {order.totalPrice.toLocaleString("id-ID")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 8,
    marginBottom: 8,
  },
  invoiceNo: { fontWeight: "bold", fontSize: 12, color: "#374151" },
  orderDate: { fontSize: 10, color: "#9ca3af", marginTop: 1 },
  statusBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    justifyContent: "center",
  },
  statusText: {
    fontSize: 9,
    color: "#065f46",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  addressText: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 8,
    marginTop: 4,
  },
  orderMethod: { fontSize: 11, color: "#9ca3af" },
  orderTotal: { fontSize: 13, fontWeight: "bold", color: "#3b82f6" },
});
