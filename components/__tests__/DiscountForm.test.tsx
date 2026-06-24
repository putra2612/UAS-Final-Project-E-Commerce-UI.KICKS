import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import DiscountForm from "../DiscountForm";

describe("DiscountForm Component Test", () => {
  it("harus memanggil fungsi onCalculate dengan data yang benar saat tombol ditekan", () => {
    // 1. ARRANGE (Given)
    // Kita buat fungsi tiruan (mock function) untuk mendeteksi klik
    const mockOnCalculate = jest.fn();
    const { getByTestId } = render(
      <DiscountForm onCalculate={mockOnCalculate} />,
    );

    const input = getByTestId("input-harga"); // Seleksi elemen input berdasarkan testID yang sudah kita tetapkan di komponen Form
    const tombol = getByTestId("tombol-hitung"); // Seleksi elemen tombol berdasarkan testID yang sudah kita tetapkan di komponen Form

    // 2. ACT (When)
    fireEvent.changeText(input, "50000"); // Simulasi pengguna mengetik angka 50000 lalu menekan tombol
    fireEvent.press(tombol); // Simulasi pengguna menekan tombol "Pergi ke Discount" untuk menghitung total akhir

    // 3. ASSERT (Then)
    // Pastikan fungsi onCalculate dipanggil tepat 1 kali dengan argumen angka 50000
    expect(mockOnCalculate).toHaveBeenCalledTimes(1);
    // Pastikan fungsi onCalculate dipanggil dengan argumen angka 50000
    expect(mockOnCalculate).toHaveBeenCalledWith(50000);
  });
});
