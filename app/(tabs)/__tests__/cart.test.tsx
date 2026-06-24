import { render } from "@testing-library/react-native";
import React from "react";
import CartScreen from "../cart";
import { useShop } from "../../../context/ShopContext";

// Mocking useShop context hook
jest.mock("../../../context/ShopContext", () => ({
  useShop: jest.fn(),
}));

// Mocking expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("CartScreen (tabs) test", () => {
  it("harus merender pesan kosong jika keranjang kosong", () => {
    (useShop as jest.Mock).mockReturnValue({
      cart: [],
      updateCartQty: jest.fn(),
      removeFromCart: jest.fn(),
      fetchCart: jest.fn(),
    });

    const { getByText } = render(<CartScreen />);
    expect(getByText("Keranjang belanja API Anda kosong")).toBeTruthy();
  });

  it("harus merender item keranjang dan subtotal pembayaran", () => {
    const mockCart = [
      {
        id: 1,
        quantity: 2,
        product: {
          id: 101,
          categoryId: 1,
          productName: "Kopi Gayo",
          productDescription: "Kopi Arabika",
          productPrice: 50000,
          productStock: 10,
        },
      },
    ];

    (useShop as jest.Mock).mockReturnValue({
      cart: mockCart,
      updateCartQty: jest.fn(),
      removeFromCart: jest.fn(),
      fetchCart: jest.fn(),
    });

    const { getByText, getAllByText } = render(<CartScreen />);

    expect(getByText("Kopi Gayo")).toBeTruthy();
    expect(getByText("Total Pembayaran:")).toBeTruthy();
    
    const priceElements = getAllByText("Rp 100.000");
    expect(priceElements.length).toBe(2); // Satu di item list, satu di subtotal box
  });
});
