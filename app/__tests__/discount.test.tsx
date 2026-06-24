import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import DiscountScreen from "../discount";

describe("DiscountScreen Integration Test", () => {
  it("harus mengintegrasikan Form dan Fungsi Logika untuk menampilkan hasil akhir di layar", () => {
    // 1. ARRANGE (Given)
    // Render seluruh layar (Form + Teks Hasil ada di sini)
    const { getByTestId } = render(<DiscountScreen />);
    // Seleksi elemen input dan tombol berdasarkan testID yang sudah kita tetapkan di komponen Form
    const input = getByTestId("input-harga");
    const tombol = getByTestId("tombol-hitung");

    // 2. ACT (When)
    // Pengguna memasukkan harga 200000 (Diskon otomatis 10% -> Potongan 20000)
    fireEvent.changeText(input, "200000");
    // Pengguna menekan tombol "Pergi ke Discount" untuk menghitung total akhir
    fireEvent.press(tombol);

    // 3. ASSERT (Then)
    // TEmukan text hasil yang muncul di layar, yaitu "Total Bayar: Rp 180000"
    const teksHasil = screen.getByText("Total Bayar: Rp 180000");
    // Jika teks ditemukan dan text="Total Bayar: Rp 180000" , ekspektasi ini akan lolos dengan sukses
    expect(teksHasil).toBeTruthy();
  });
});
