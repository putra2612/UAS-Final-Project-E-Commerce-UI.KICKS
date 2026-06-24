import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import CartItemCard from "../CartItemCard";
import { CartItem } from "../../context/ShopContext";

describe("CartItemCard Component Test", () => {
  const mockItem: CartItem = {
    id: 12,
    quantity: 3,
    product: {
      id: 1,
      categoryId: 2,
      productName: "Sepatu Nike",
      productDescription: "Sepatu lari nyaman",
      productPrice: 1000000,
      productStock: 5,
    },
  };

  it("harus merender informasi item keranjang dengan benar", () => {
    const mockUpdateQty = jest.fn();
    const mockRemove = jest.fn();

    const { getByText } = render(
      <CartItemCard
        item={mockItem}
        onUpdateQty={mockUpdateQty}
        onRemove={mockRemove}
      />
    );

    expect(getByText("Sepatu Nike")).toBeTruthy();
    expect(getByText("Rp 3.000.000")).toBeTruthy(); // 1,000,000 * 3
    expect(getByText("3")).toBeTruthy();
  });

  it("harus memanggil onUpdateQty ketika kuantitas diubah", () => {
    const mockUpdateQty = jest.fn();
    const mockRemove = jest.fn();

    const { getByTestId } = render(
      <CartItemCard
        item={mockItem}
        onUpdateQty={mockUpdateQty}
        onRemove={mockRemove}
      />
    );

    const btnIncrease = getByTestId("btn-increase-12");
    const btnDecrease = getByTestId("btn-decrease-12");

    fireEvent.press(btnIncrease);
    expect(mockUpdateQty).toHaveBeenCalledWith(12, 4);

    fireEvent.press(btnDecrease);
    expect(mockUpdateQty).toHaveBeenCalledWith(12, 2);
  });

  it("harus memanggil onRemove ketika tombol hapus ditekan", () => {
    const mockUpdateQty = jest.fn();
    const mockRemove = jest.fn();

    const { getByTestId } = render(
      <CartItemCard
        item={mockItem}
        onUpdateQty={mockUpdateQty}
        onRemove={mockRemove}
      />
    );

    const btnDelete = getByTestId("btn-delete-12");
    fireEvent.press(btnDelete);

    expect(mockRemove).toHaveBeenCalledWith(12);
  });
});
