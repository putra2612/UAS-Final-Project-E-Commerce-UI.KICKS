import { render } from "@testing-library/react-native";
import React from "react";
import ProductDetailScreen from "../[id]";
import { useShop } from "../../../context/ShopContext";

// Mocking useShop context hook
jest.mock("../../../context/ShopContext", () => ({
  useShop: jest.fn(),
}));

// Mocking expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "1" }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("ProductDetailScreen test", () => {
  it("harus merender rincian detail produk", () => {
    const mockProducts = [
      {
        id: 1,
        categoryId: 1,
        productName: "Headset Logitech",
        productDescription: "Headset gaming dengan mic jernih",
        productPrice: 500000,
        productStock: 15,
      },
    ];

    (useShop as jest.Mock).mockReturnValue({
      products: mockProducts,
      addToCart: jest.fn(),
    });

    const { getByText } = render(<ProductDetailScreen />);

    expect(getByText("Headset Logitech")).toBeTruthy();
    expect(getByText("Rp 500.000")).toBeTruthy();
    expect(getByText("Headset gaming dengan mic jernih")).toBeTruthy();
    expect(getByText("Atur Jumlah (Stok: 15)")).toBeTruthy();
  });
});
