import { render } from "@testing-library/react-native";
import React from "react";
import ProfileScreen from "../profile";
import { useShop } from "../../../context/ShopContext";

// Mocking useShop context hook
jest.mock("../../../context/ShopContext", () => ({
  useShop: jest.fn(),
}));

describe("ProfileScreen (tabs) test", () => {
  it("harus merender nama pengguna dan riwayat transaksi dengan benar", () => {
    const mockPurchases = [
      {
        id: 99,
        address: "Depok, Jawa Barat",
        totalPrice: 150000,
        status: "completed",
        createdAt: "2026-06-06T12:00:00.000Z",
        paymentMethod: { id: 1, name: "GoPay", type: "wallet" },
      },
    ];

    (useShop as jest.Mock).mockReturnValue({
      purchases: mockPurchases,
      fetchPurchases: jest.fn(),
      user: { name: "Ahmad" },
      logout: jest.fn(),
    });

    const { getByText } = render(<ProfileScreen />);

    expect(getByText("Ahmad")).toBeTruthy();
    expect(getByText("Invoice ID: #99")).toBeTruthy();
    expect(getByText("📍 Alamat: Depok, Jawa Barat")).toBeTruthy();
    expect(getByText("Total: Rp 150.000")).toBeTruthy();
    expect(getByText("Metode ID: GoPay")).toBeTruthy();
  });
});
