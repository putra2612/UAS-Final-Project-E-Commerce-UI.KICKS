import { calculateTotal } from "../discountHelper";

describe.only("calculateTotal Unit Test", () => {
  it("harus menghitung total harga setelah diskon dengan benar", () => {
    // 1. ARRANGE (Given: Siapkan input)
    const hargaAwal = 100000; // Harga awal sebelum diskon
    const diskon = 20; // Diskon 20% berarti potongan 20000, jadi total akhir harusnya 80000
    const ekspektasiHasil = 80000; // Total akhir yang diharapkan setelah diskon diterapkan

    // 2. ACT (When: Jalankan fungsinya)
    const hasilAktual = calculateTotal(hargaAwal, diskon);
    console.log("Hasil Aktual:", hasilAktual); // Log hasil aktual untuk melihat outputnya

    // 3. ASSERT (Then: Cek hasilnya)
    expect(hasilAktual).toBe(ekspektasiHasil);
  });
});
