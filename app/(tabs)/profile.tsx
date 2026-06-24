import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useShop } from "../../context/ShopContext";
import OrderCard from "../../components/OrderCard";

export default function ProfileScreen() {
  const { purchases, fetchPurchases, user, logout } = useShop();

  // Ambil manifes riwayat transaksi terbaru langsung dari server API
  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Informasi Profil Pengguna */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.substring(0, 2).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.profileName}>{user?.name || "Loading..."}</Text>
        <Text style={styles.profileNim}>
          Role Pembeli | Kelompok Multi-tenant
        </Text>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Keluar / Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* List Riwayat Checkout Real API */}
      <Text style={styles.sectionTitle}>
        Riwayat Pembelian Riil (Database API)
      </Text>

      {purchases.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Belum ada riwayat transaksi terdaftar di server.
          </Text>
        </View>
      ) : (
        purchases.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  profileCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: "#3b82f6",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: { color: "#ffffff", fontWeight: "bold", fontSize: 20 },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  profileNim: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  logoutBtn: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyText: { color: "#9ca3af", fontSize: 13 },
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