/**
 * LUXURY BOX - Admin Paneli JavaScript
 * Tüm admin işlemleri burada
 */

// ============================================
// 1. SUPABASE BAĞLANTISI KONTROLÜ
// ============================================
// supabaseClient zaten supabase.js'de tanımlandı
// db nesnesi de supabase.js'de window.db ile tanımlandı

// ============================================
// 2. ADMIN KREDİSİYALLERİ
// ============================================
const ADMIN_CREDENTIALS = { username: 'admin', password: '123456' };

// ============================================
// 3. ADMIN GİRİŞ İŞLEMLERİ
// ============================================

function handleAdminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('loginError');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        errorElement.className = 'error success';
        errorElement.textContent = '✓ Giriş başarılı! Yönlendiriliyorsunuz...';
        setTimeout(() => {
            document.getElementById('adminLoginPage').style.display = 'none';
            document.getElementById('adminPanelPage').style.display = 'block';
            loadAdminProducts();
        }, 600);
    } else {
        errorElement.className = 'error';
        errorElement.textContent = '❌ Hatalı kullanıcı adı veya şifre!';
    }
}

function handleAdminLogout() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        window.location.href = 'index.html';
    }
}

// ============================================
// 4. TOAST MESAJI
// ============================================

function showToast(message, type = 'success') {
    const oldToast = document.querySelector('.admin-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    const icon = type === 'success' ? '✅' : '❌';
    const color = type === 'success' ? '#51cf66' : '#ff6b6b';
    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; color:#fff;">
            <span style="font-size:1.4rem;">${icon}</span>
            <span>${message}</span>
        </div>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #1A1A1A;
        color: #ffffff;
        padding: 16px 24px;
        border-radius: 16px;
        border: 1px solid ${color};
        box-shadow: 0 15px 40px rgba(0,0,0,0.5);
        z-index: 10001;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9rem;
        max-width: 400px;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 50);

    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 400);
    }, 3000);
}

// ============================================
// 5. ÜRÜN EKLEME İŞLEMLERİ
// ============================================

async function handleAddProduct(event) {
    event.preventDefault();
    
    // db kontrolü
    if (typeof db === 'undefined') {
        showToast('❌ Veritabanı bağlantısı kurulamadı! (db tanımlı değil)', 'error');
        console.error('❌ db nesnesi tanımlı değil! supabase.js yüklendi mi?');
        return;
    }
    
    const isim = document.getElementById('adminProductIsim').value.trim();
    const marka = document.getElementById('adminProductMarka').value.trim();
    const fiyat = parseInt(document.getElementById('adminProductFiyat').value);
    const resim = document.getElementById('adminProductResim').value.trim();
    const kategori = document.getElementById('adminProductKategori').value;

    if (!isim || !fiyat || !resim) {
        showToast('Lütfen tüm zorunlu alanları doldurun!', 'error');
        return;
    }

    console.log('📦 Eklenen ürün bilgileri:', { isim, marka, fiyat, resim, kategori });

    try {
        const newProduct = await db.addProduct({ isim, marka, fiyat, resim, kategori });
        if (newProduct) {
            document.getElementById('adminProductIsim').value = '';
            document.getElementById('adminProductMarka').value = '';
            document.getElementById('adminProductFiyat').value = '';
            document.getElementById('adminProductResim').value = '';
            await loadAdminProducts();
            showToast(`✅ "${isim}" başarıyla eklendi!`);
            console.log('✅ Ürün eklendi:', newProduct);
        } else {
            showToast('❌ Ürün eklenirken bir hata oluştu! (Ürün verisi boş döndü)', 'error');
        }
    } catch (error) {
        console.error('❌ Ürün ekleme hatası:', error);
        showToast('❌ Hata: ' + (error.message || 'Bilinmeyen hata'), 'error');
    }
}

// ============================================
// 6. ÜRÜN LİSTELEME İŞLEMLERİ
// ============================================

async function loadAdminProducts() {
    const container = document.getElementById('adminProductList');
    if (!container) {
        console.warn('⚠️ adminProductList bulunamadı');
        return;
    }
    
    // db kontrolü
    if (typeof db === 'undefined') {
        container.innerHTML = '<div class="no-products" style="color:#ff6b6b;">❌ Veritabanı bağlantısı kurulamadı!</div>';
        console.error('❌ db nesnesi tanımlı değil!');
        return;
    }
    
    try {
        const products = await db.getProducts();
        console.log('📋 Admin paneli ürün listesi:', products.length + ' ürün');
        
        if (!products || products.length === 0) {
            container.innerHTML = '<div class="no-products">📦 Henüz ürün eklenmemiş.</div>';
            return;
        }
        
        let html = '';
        products.forEach((product) => {
            let categoryName = '🏠 Ana Sayfa';
            if (product.kategori === 'ayakkabilar') categoryName = '👟 Ayakkabılar';
            else if (product.kategori === 'gozluk-saat') categoryName = '🕶️ Gözlük & Saat';
            else if (product.kategori === 'cantalar') categoryName = '👜 Çantalar';
            
            html += `
                <div class="admin-product-item">
                    <img src="${product.resim}" alt="${product.isim}" onerror="this.src='css/foto/placeholder.jpeg'" />
                    <div class="admin-product-info">
                        <h4>${product.isim}</h4>
                        ${product.marka ? `<p>${product.marka}</p>` : ''}
                        <p class="price">${product.fiyat.toLocaleString()} TL</p>
                        <p style="color:rgba(26,26,26,0.4); font-size:12px; margin-top:4px;">
                            <i class="fas fa-tag"></i> ${categoryName}
                        </p>
                    </div>
                    <button class="delete-product-btn" onclick="handleDeleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('❌ Ürün listeleme hatası:', error);
        container.innerHTML = '<div class="no-products" style="color:#ff6b6b;">❌ Ürünler yüklenirken hata oluştu: ' + error.message + '</div>';
    }
}

// ============================================
// 7. ÜRÜN SİLME İŞLEMLERİ
// ============================================

async function handleDeleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    
    try {
        const success = await db.deleteProduct(id);
        if (success) {
            await loadAdminProducts();
            showToast('✅ Ürün veritabanından silindi.');
        } else {
            showToast('❌ Ürün silinirken bir hata oluştu!', 'error');
        }
    } catch (error) {
        console.error('❌ Silme hatası:', error);
        showToast('❌ Hata: ' + (error.message || 'Bilinmeyen hata'), 'error');
    }
}

// ============================================
// 8. SAYFA YÜKLENDİĞİNDE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin paneli yükleniyor...');
    
    // db kontrolü
    if (typeof db === 'undefined') {
        console.error('❌ db nesnesi tanımlı değil! supabase.js yüklendi mi?');
        console.log('⚠️ Admin paneli veritabanı olmadan çalışamaz!');
    } else {
        console.log('✅ db nesnesi hazır, fonksiyonlar:', Object.keys(db));
    }
    
    // Enter tuşu ile form gönderme
    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddProduct(e);
            }
        });
    }
});

// ============================================
// 9. KONSOL
// ============================================

console.log('%c LUXURY BOX ADMIN ', 'font-size:20px; font-weight:bold; color:#d47b8e;');
console.log('%c Admin paneli hazır ✅', 'font-size:14px; color:#51cf66;');
console.log('%c Kullanıcı: admin / Şifre: 123456', 'font-size:12px; color:#999;');