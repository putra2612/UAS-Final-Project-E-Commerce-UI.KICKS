import { useRouter, Stack } from "expo-router";
import React, { useEffect, useState, useRef } from "react"; 
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { useShop } from "../../context/ShopContext";
import ProductCard from "../../components/ProductCard";

const { width } = Dimensions.get("window");

// =========================================================================
// [DATA STATIS] Banner Iklan, Benefit Toko, dan Lokasi Cabang
// =========================================================================

const bannerData = [
  { 
    id: '1', 
    brand: 'NIKE', 
    promo: 'Air Max Series\nDisc Up To 30%', 
    image: require("../../assets/images/Nike Air Max.webp")
  },
  { 
    id: '2', 
    brand: 'ADIDAS', 
    promo: 'Ultraboost New Arrival\nFree Shipping', 
    image: require("../../assets/images/Adidas Ultra Boost New Arrival.webp")
  },
  { 
    id: '3', 
    brand: 'JORDAN', 
    promo: 'Retro Collection\nLimited Release', 
    image: require("../../assets/images/JORDAN Retro Collection.webp")
  },
];

const benefitsData = [
  { id: '1', icon: '📦', title: 'Satisfaction Guaranteed', desc: 'Quality guaranteed. Your satisfaction, our promise' },
  { id: '2', icon: '🔄', title: '7-Days Easy Return', desc: 'Shop everywhere with peace of mind' },
  { id: '3', icon: '🌐', title: 'Free Shipping Nationwide', desc: 'Seamless and secure delivery to your doorstep across Indonesia.' },
  { id: '4', icon: '🔍', title: '100% Authentic', desc: 'Authenticity assured. Trust secured with a Money-Back Guarantee' },
  { id: '5', icon: '🛍️', title: 'Complete Collection', desc: 'Elevate your style with the latest sneakers and streetwear brands' },
];

const locationsData = [
  { id: '1', address: 'San Antonio Shopping Street N1 - 60\nPakuwon City, Surabaya Timur' },
  { id: '2', address: 'PTC Mall LG Floor A3-06\nSurabaya Barat' },
  { id: '3', address: 'G Walk, Jl. Niaga Gapura Citraland Blok C No.10,\nSurabaya, Jawa Timur 60217' },
  { id: '4', address: 'Jl. Tebet Utara Dalam 11C, Jakarta Selatan' },
  { id: '5', address: 'Ruko / Cluster Fifth Avenue, Jl. Boulevard Raya Gading\nSerpong A/28, Pakulonan Barat, Kecamatan Kelapa\nDua, Kabupaten Tangerang, Banten 15811' },
];

export default function HomeScreen() {
  const { products, categories, fetchProducts, fetchCategories, user } = useShop();
  const router = useRouter();
  
  // Filter kategori agar tidak memunculkan kategori "Gadget" yang bukan sepatu
  const filteredCategories = categories.filter(
    (cat) => cat.categoryName.toLowerCase() !== "gadget"
  );

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<any>(null);

  // =========================================================================
  // [LOGIKA & EFFECT] Mengambil Data API dan Menjalankan Auto-Scroll Iklan
  // =========================================================================

  useEffect(() => {
    const loadData = async () => {
      setLoadingRefresh(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoadingRefresh(false);
    };
    loadData();
  }, []); 

  useEffect(() => {
    if (!bannerData || bannerData.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = activeIndex === bannerData.length - 1 ? 0 : activeIndex + 1;
      const cardWidthSize = width - 32;
      const targetOffset = nextIndex * cardWidthSize;

      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: targetOffset,
          animated: true,
        });
      }

      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const cardWidthSize = width - 32;
    
    if (cardWidthSize > 0) {
      const currentIndex = Math.round(contentOffset / cardWidthSize);
      setActiveIndex(currentIndex);
    }
  };

  // Filter logika pencarian barang berdasarkan teks pencarian dan kategori tab
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      selectedCategory === "Semua" ||
      p.categoryId === categories.find((c) => c.categoryName === selectedCategory)?.id;
    return matchSearch && matchCat;
  });

  // =========================================================================
  // [RENDER TAMPILAN LAYAR UTAMA]
  // =========================================================================
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ==================== [1. FIXED CONTAINER HEADER] ==================== */}
      {/* Bagian ini posisinya tetap di atas layar HP (Nama Toko, Kolom Cari, Kategori) */}
      <View style={styles.fixedHeaderContainer}>
        
        {/* Sub-Bagian A: Nama Toko / Logo */}
        <View style={styles.storeHeader}>
          <Text style={styles.storeLogoText}>UI.KICKS</Text>
        </View>

        {/* Sub-Bagian B: Kolom Input Pencarian */}
        <TextInput
          placeholder="Cari produk ..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
          placeholderTextColor="#9ca3af"
        />

        {/* Sub-Bagian C: Tab Pilihan Kategori Sepatu (Horizontal Scroll) */}
        <View style={styles.categoryContainer}>
          <FlatList
            data={filteredCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.categoryName)}
                style={[
                  styles.categoryBadge,
                  selectedCategory === item.categoryName && styles.categoryBadgeActive,
                ]}
              >
                <Text style={[styles.categoryText, selectedCategory === item.categoryName && styles.categoryTextActive]}>
                  {item.categoryName}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {/* Loading saat data ditarik dari Server API */}
      {loadingRefresh ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        
        // ==================== [3. GRID PRODUK UTAMA] ====================
        // Menampilkan katalog produk sepatu dalam bentuk grid 2 kolom ke bawah
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          
          // ListHeaderComponent memasukkan Banner Iklan di atas daftar produk agar ikut ter-scroll
          ListHeaderComponent={
            <>
              {/* ==================== [2. BANNER IKLAN BERJALAN] ==================== */}
              {/* Tempat banner promo berjalan otomatis 3 detik atau geser manual */}
              <View style={styles.bannerContainer}>
                <FlatList
                  ref={flatListRef} 
                  data={bannerData}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled={true} 
                  onMomentumScrollEnd={handleMomentumScrollEnd} 
                  nestedScrollEnabled={true}
                  snapToInterval={width - 32} 
                  snapToAlignment="center"
                  decelerationRate="fast"
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <ImageBackground 
                      source={item.image}
                      style={styles.bannerCard}
                      imageStyle={styles.bannerImageStyle}
                    >
                      <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerBrand}>{item.brand}</Text>
                        <Text style={styles.bannerPromo}>{item.promo}</Text>
                      </View>
                    </ImageBackground>
                  )}
                />
              </View>
            </>
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: item.id.toString() },
                })
              }
            />
          )}
          
          // ListFooterComponent meletakkan info jaminan dan footer di bagian paling bawah katalog
          ListFooterComponent={
            <>
              {/* ==================== [4. SECTION BENEFIT TOKO] ==================== */}
              {/* Informasi garansi toko: Jaminan Kepuasan, 7 Hari Pengembalian, dll. */}
              <View style={styles.benefitSection}>
                {benefitsData.map((benefit) => (
                  <View key={benefit.id} style={styles.benefitRow}>
                    <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                    <View style={styles.benefitTextContainer}>
                      <Text style={styles.benefitTitle}>{benefit.title}</Text>
                      <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* ==================== [5. SECTION FOOTER HITAM PREMIUM] ==================== */}
              {/* Kontainer berwarna hitam di dasar aplikasi untuk info alamat, maps, sosmed, sitemap */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerLogo}>UI.KICKS</Text>
                
                {/* Looping Alamat Toko Cabang */}
                {locationsData.map((loc) => (
                  <View key={loc.id} style={styles.locationRow}>
                    <Text style={styles.locationPin}>📍</Text>
                    <Text style={styles.locationText}>{loc.address}</Text>
                  </View>
                ))}

                <View style={styles.divider} />

                {/* Info Kontak Dukungan */}
                <Text style={styles.footerSubTitle}>CONNECT WITH US</Text>
                <Text style={styles.contactText}>Phone: +62895433951234</Text>
                <Text style={styles.contactText}>Email: uikicks.support@yahoo.com</Text>

                <View style={styles.divider} />

                {/* Peta Situs / Sitemap */}
                <View style={styles.sitemapContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sitemapHeader}>SITEMAP</Text>
                    <Text style={styles.sitemapLink}>New Arrival</Text>
                    <Text style={styles.sitemapLink}>Footwear</Text>
                    <Text style={styles.sitemapLink}>Accessories</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sitemapHeader}>ABOUT</Text>
                    <Text style={styles.sitemapLink}>Store Location</Text>
                    <Text style={styles.sitemapLink}>Privacy Policy</Text>
                  </View>
                </View>

                {/* Teks Hak Cipta */}
                <Text style={styles.copyrightText}>UI.KICKS © 2026 Supported by React Native</Text>
              </View>
            </>
          }
        />
      )}
    </View>
  );
}

// =========================================================================
// [STYLESHEET] Konfigurasi Tampilan Elemen HP
// =========================================================================
const styles = StyleSheet.create({
  
  // -----------------------------------------------------------------------
  // A. AREA UTAMA LAYAR (CONTAINER)
  // -----------------------------------------------------------------------
  container: { 
    flex: 1, 
    backgroundColor: "#f9fafb" 
  },

  // -----------------------------------------------------------------------
  // B. HEADER ATAS (NAMA TOKO, CARI, KATEGORI) - POSISI TETAP (FIXED)
  // -----------------------------------------------------------------------
  fixedHeaderContainer: {
    backgroundColor: "#f9fafb",
    paddingTop: 36, 
    zIndex: 10,    
    borderBottomWidth: 1,
    borderColor: "#e5e7eb", 
  },
  storeHeader: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  storeLogoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937", 
    letterSpacing: 1,  
  },
  searchBar: { 
    backgroundColor: "#ffffff", 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: "#e5e7eb", 
    marginBottom: 16, 
    marginHorizontal: 16 
  },
  categoryContainer: { 
    marginBottom: 12, 
    paddingHorizontal: 16 
  },
  categoryBadge: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: "#e5e7eb", 
    marginRight: 8 
  },
  categoryBadgeActive: { 
    backgroundColor: "#3b82f6" 
  },
  categoryText: { 
    fontSize: 13,
    color: "#374151", 
    fontWeight: "500" 
  },
  categoryTextActive: { 
    color: "#ffffff" 
  },

  // -----------------------------------------------------------------------
  // C. BANNER IKLAN BERJALAN AUTOMATIS
  // -----------------------------------------------------------------------
  bannerContainer: { 
    marginBottom: 20, 
    marginTop: 16, 
    paddingHorizontal: 16 
  },
  bannerCard: { 
    width: width - 32, 
    height: 130, 
    borderRadius: 16,
    overflow: 'hidden', 
    justifyContent: 'center', 
  },
  bannerImageStyle: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    justifyContent: 'center',
  },
  bannerBrand: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#ffffff', 
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  bannerPromo: { 
    fontSize: 13, 
    color: '#f3f4f6', 
    marginTop: 4, 
    fontWeight: '600', 
    lineHeight: 18,
  },

  // -----------------------------------------------------------------------
  // D. GRID KATALOG PRODUK SEPATU (Tengah)
  // -----------------------------------------------------------------------
  gridRow: { 
    flexDirection: "row",
    justifyContent: "space-between", 
    gap: 12,              
    paddingHorizontal: 16 
  },

  // -----------------------------------------------------------------------
  // E. SECTION JAMINAN / BENEFIT TOKO
  // -----------------------------------------------------------------------
  benefitSection: { 
    backgroundColor: '#ffffff', 
    padding: 24, 
    marginTop: 24, 
    borderTopWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  benefitRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  benefitIcon: { 
    fontSize: 28, 
    marginRight: 16, 
  },
  benefitTextContainer: { 
    flex: 1 
  },
  benefitTitle: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#1f2937', 
    marginBottom: 2 
  },
  benefitDesc: { 
    fontSize: 12, 
    color: '#6b7280', 
    lineHeight: 16 
  },

  // -----------------------------------------------------------------------
  // F. SECTION FOOTER HITAM PREMIUM (Dasar Aplikasi)
  // -----------------------------------------------------------------------
  footerContainer: { 
    backgroundColor: '#000000', 
    padding: 24, 
    paddingTop: 40 
  },
  footerLogo: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#ffffff', 
    letterSpacing: 2, 
    marginBottom: 24 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    marginBottom: 16, 
  },
  locationPin: { 
    fontSize: 14,
    marginRight: 10, 
    marginTop: 2 
  },
  locationText: { 
    fontSize: 12,
    color: '#d1d5db', 
    flex: 1, 
    lineHeight: 18 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#374151',
    marginVertical: 20 
  },
  footerSubTitle: { 
    fontSize: 13,
    color: '#ffffff', 
    fontWeight: 'bold', 
    marginBottom: 12, 
    letterSpacing: 1 
  },
  contactText: { 
    fontSize: 12,
    color: '#9ca3af', 
    marginBottom: 6 
  },
  sitemapContainer: { 
    flexDirection: 'row', 
    marginBottom: 30 
  },
  sitemapHeader: { 
    fontSize: 12,
    color: '#ffffff', 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  sitemapLink: { 
    fontSize: 12,
    color: '#9ca3af', 
    marginBottom: 8 
  },
  copyrightText: { 
    fontSize: 10,
    color: '#4b5563', 
    textAlign: 'center', 
    marginTop: 10, 
    marginBottom: 20 
  }
});