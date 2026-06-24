import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "../index";
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

describe("HomeScreen (tabs) integration test", () => {
  const mockProducts = [
    {
      id: 1,
      categoryId: 1,
      productName: "iPhone 15 Pro",
      productDescription: "Smartphone Apple",
      productPrice: 20000000,
      productStock: 10,
    },
    {
      id: 2,
      categoryId: 2,
      productName: "Baju Kaos Polos",
      productDescription: "Bahan katun dingin",
      productPrice: 75000,
      productStock: 50,
    },
  ];

  const mockCategories = [
    { id: 0, categoryName: "Semua" },
    { id: 1, categoryName: "Gadget" },
    { id: 2, categoryName: "Clothing" },
  ];

  beforeEach(() => {
    (useShop as jest.Mock).mockReturnValue({
      products: mockProducts,
      categories: mockCategories,
      fetchProducts: jest.fn().mockResolvedValue(undefined),
      fetchCategories: jest.fn().mockResolvedValue(undefined),
      user: { name: "Budi Santoso" },
    });
  });

  it("harus merender salam pengguna dan list produk", async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("Halo, Budi Santoso")).toBeTruthy();
      expect(getByText("iPhone 15 Pro")).toBeTruthy();
      expect(getByText("Baju Kaos Polos")).toBeTruthy();
    });
  });

  it("harus menyaring produk berdasarkan input pencarian", async () => {
    const { getByPlaceholderText, queryByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText("Cari produk di proyek ini...")).toBeTruthy();
    });

    const searchInput = getByPlaceholderText("Cari produk di proyek ini...");
    fireEvent.changeText(searchInput, "Kaos");

    await waitFor(() => {
      expect(queryByText("Baju Kaos Polos")).toBeTruthy();
      expect(queryByText("iPhone 15 Pro")).toBeNull();
    });
  });
});
