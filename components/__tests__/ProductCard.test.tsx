import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import ProductCard from "../ProductCard";
import { Product } from "../../context/ShopContext";

describe("ProductCard Component Test", () => {
  const mockProduct: Product = {
    id: 1,
    categoryId: 2,
    productName: "Laptop ASUS",
    productDescription: "Laptop Gaming Ringan",
    productPrice: 15000000,
    productStock: 10,
  };

  it("harus merender informasi produk dengan benar", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ProductCard product={mockProduct} onPress={mockOnPress} />
    );

    expect(getByText("Laptop ASUS")).toBeTruthy();
    expect(getByText("Rp 15.000.000")).toBeTruthy();
    expect(getByText("Stok aktif: 10")).toBeTruthy();
  });

  it("harus memicu onPress ketika kartu produk ditekan", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <ProductCard product={mockProduct} onPress={mockOnPress} />
    );

    const card = getByTestId("product-card-1");
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
