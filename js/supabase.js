// ============================================
// 1. SUPABASE PROJE AYARLARI VE BAĞLANTISI
// ============================================

// ✅ YENİ URL (DOĞRU)
const SUPABASE_URL = 'https://vgflqqpxaxvqsuggfvzd.supabase.co';

// ✅ YENİ ANON KEY (DOĞRU)
const SUPABASE_ANON_KEY = 'sb_publishable_Hd_b2fZwK3Nmgt8y8m3fdw_Hd8d9gEp';

// Supabase istemcisini oluştur ve GLOBAL olarak tanımla
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase bağlantısı kuruldu!');
console.log('📡 URL:', SUPABASE_URL);
console.log('🔑 KEY:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// ============================================
// 2. VERİTABANI FONKSİYONLARI
// ============================================

// Tüm ürünleri getir
async function getProducts() {
    try {
        const { data, error } = await window.supabaseClient
            .from('urunler')
            .select('*')
            .order('id', { ascending: false });
        
        if (error) { 
            console.error('❌ Ürünler alınamadı:', error); 
            return []; 
        }
        console.log('✅ getProducts: ' + data.length + ' ürün bulundu');
        return data;
    } catch (err) {
        console.error('❌ getProducts hatası:', err);
        return [];
    }
}

// Kategoriye göre ürünleri getir
async function getProductsByCategory(kategori) {
    try {
        const { data, error } = await window.supabaseClient
            .from('urunler')
            .select('*')
            .eq('kategori', kategori)
            .order('id', { ascending: false });
        
        if (error) { 
            console.error('❌ Kategori ürünleri alınamadı:', error); 
            return []; 
        }
        console.log('✅ getProductsByCategory (' + kategori + '): ' + data.length + ' ürün bulundu');
        return data;
    } catch (err) {
        console.error('❌ getProductsByCategory hatası:', err);
        return [];
    }
}

// ID'ye göre tek bir ürün getir
async function getProductById(id) {
    try {
        const { data, error } = await window.supabaseClient
            .from('urunler')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) { 
            console.error('❌ Ürün bulunamadı (ID: ' + id + '):', error); 
            return null; 
        }
        return data;
    } catch (err) {
        console.error('❌ getProductById hatası:', err);
        return null;
    }
}

// Yeni ürün ekle
async function addProduct(product) {
    try {
        console.log('📦 addProduct çağrıldı:', product);
        
        const { data, error } = await window.supabaseClient
            .from('urunler')
            .insert([{ 
                isim: product.isim, 
                marka: product.marka || '', 
                fiyat: product.fiyat, 
                resim: product.resim, 
                kategori: product.kategori 
            }])
            .select();
        
        if (error) { 
            console.error('❌ Ürün eklenemedi:', error); 
            return null; 
        }
        console.log('✅ Ürün eklendi:', data[0]);
        return data[0];
    } catch (err) {
        console.error('❌ addProduct hatası:', err);
        return null;
    }
}

// Ürün sil
async function deleteProduct(id) {
    try {
        const { error } = await window.supabaseClient
            .from('urunler')
            .delete()
            .eq('id', id);
        
        if (error) { 
            console.error('❌ Ürün silinemedi:', error); 
            return false; 
        }
        console.log('✅ Ürün silindi, ID:', id);
        return true;
    } catch (err) {
        console.error('❌ deleteProduct hatası:', err);
        return false;
    }
}

console.log('✅ Supabase fonksiyonları hazır!');

// ============================================
// 3. DİĞER DOSYALARIN ERİŞEBİLMESİ İÇİN (GLOBAL)
// ============================================

window.db = {
    getProducts: getProducts,
    getProductsByCategory: getProductsByCategory,
    getProductById: getProductById,
    addProduct: addProduct,
    deleteProduct: deleteProduct
};

console.log('✅ db nesnesi oluşturuldu, fonksiyonlar:', Object.keys(window.db));
console.log('🎯 LUXURY BOX - Supabase hazır!');
