import { render } from "@testing-library/react-native";
import React from "react";
import OrderCard from "../OrderCard";
import { Purchase } from "../../context/ShopContext";

describe("OrderCard Component Test", () => {
  const mockOrder: Purchase = {
    id: 5,
    address: "Jl. Diponegoro No. 10",
    totalPrice: 250000,
    status: "pending",
    createdAt: "2026-06-06T12:00:00.000Z",
    paymentMethod: {
      id: 1,
      name: "OVO",
      type: "wallet",
    },
  };

  it("harus merender informasi pesanan dengan benar", () => {
    const { getByText } = render(<OrderCard order={mockOrder} />);

    expect(getByText("Invoice ID: #5")).toBeTruthy();
    expect(getByText("📍 Alamat: Jl. Diponegoro No. 10")).toBeTruthy();
    expect(getByText("Total: Rp 250.000")).toBeTruthy();
    expect(getByText("Metode ID: OVO")).toBeTruthy();
    expect(getByText("pending")).toBeTruthy();
  });
});
