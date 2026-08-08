/**
 * LUXURY BOX - JavaScript Fonksiyonlari (Supabase Entegrasyonu)
 * Tüm ürünler Supabase'den çekilir.
 */

// ============================================
// 1. KONFIGURASYON
// ============================================
const phoneNumber = '905439704241';

// ============================================
// 2. SUPABASE ÜRÜN FONKSİYONLARI
// ============================================

// Tüm ürünleri getir (Supabase'den)
async function getProducts() {
    try {
        if (typeof window.supabaseClient === 'undefined') {
            console.error('❌ supabaseClient tanımlı değil! supabase.js yüklendi mi?');
            return [];
        }
        
        const { data, error } = await window.supabaseClient
            .from('urunler')
            .select('*')
            .order('id', { ascending: false });
        
        if (error) {
            console.error('❌ Ürünler alınamadı:', error);
            return [];
        }
        console.log(`✅ ${data.length} ürün yüklendi`);
        return data;
    } catch (err) {
        console.error('❌ Hata:', err);
        return [];
    }
}

// Kategoriye göre ürünleri getir (Supabase'den)
async function getProductsByCategory(kategori) {
    try {
        if (typeof window.supabaseClient === 'undefined') {
            console.error('❌ supabaseClient tanımlı değil!');
            return [];
        }
        
        const { data, error } = await window.supabaseClient
            .from('urunler')
            .select('*')
            .eq('kategori', kategori)
            .order('id', { ascending: false });
        
        if (error) {
            console.error('❌ Kategori ürünleri alınamadı:', error);
            return [];
        }
        console.log(`✅ ${kategori} kategorisinde ${data.length} ürün bulundu`);
        return data;
    } catch (err) {
        console.error('❌ Hata:', err);
        return [];
    }
}

// ID'ye göre ürün getir (Supabase'den)
async function getProductById(id) {
    try {
        if (typeof window.supabaseClient === 'undefined') {
            console.error('❌ supabaseClient tanımlı değil!');
            return null;
        }
        
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
        console.error('❌ Hata:', err);
        return null;
    }
}

// ============================================
// 3. SEPET FONKSİYONLARI
// ============================================

// Sepetteki ürünleri göster
function loadCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    if (!cartContainer) {
        console.warn('⚠️ cart-items-container bulunamadı');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('luxuryCart')) || [];
    console.log('🛒 Sepetteki ürün sayısı:', cart.length);
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; color: #d47b8e; margin-bottom: 20px; display: block;"></i>
                <p style="font-size: 1.2rem; font-weight: 300;">Sepetiniz boş.</p>
                <p style="color: #999; font-size: 0.9rem;">Lüks koleksiyonumuzu keşfedin!</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">
                    <i class="fas fa-arrow-left"></i> Alışverişe Başla
                </a>
            </div>
        `;
        updateCartSummary(0);
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="cart-item" data-index="${index}">
                <img src="${item.image || 'css/foto/placeholder.jpeg'}" alt="${item.name}" onerror="this.src='css/foto/placeholder.jpeg'" />
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    ${item.brand ? `<p class="brand-text">${item.brand}</p>` : ''}
                    <p class="cart-item-price">${item.price.toLocaleString()} TL</p>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i> Kaldır
                </button>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    updateCartSummary(subtotal);
}

// Sepet özetini güncelle
function updateCartSummary(subtotal) {
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) {
        subtotalElement.textContent = (subtotal || 0).toLocaleString() + ' TL';
    }
    
    if (totalElement) {
        totalElement.textContent = (subtotal || 0).toLocaleString() + ' TL';
    }
}

// Sepetteki ürün miktarını güncelle
function updateQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('luxuryCart')) || [];
    
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem('luxuryCart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
    }
}

// Sepetten ürün kaldır
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('luxuryCart')) || [];
    
    if (index >= 0 && index < cart.length) {
        const productName = cart[index].name;
        cart.splice(index, 1);
        localStorage.setItem('luxuryCart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
        showToast(productName + ' sepetten kaldırıldı.');
    }
}

// ============================================
// 4. SEPETE EKLE
// ============================================
async function addToCart(e) {
    const button = e.target.closest('.add-to-cart');
    if (!button) {
        console.warn('⚠️ add-to-cart butonu bulunamadı');
        return;
    }
    
    const productId = parseInt(button.getAttribute('data-id'));
    if (!productId) {
        showToast('❌ Ürün ID bulunamadı!');
        return;
    }

    console.log('🛒 Sepete ekleniyor, ID:', productId);

    const product = await getProductById(productId);
    if (!product) {
        showToast('❌ Ürün bulunamadı!');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('luxuryCart')) || [];
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.isim,
            brand: product.marka || '',
            price: product.fiyat,
            image: product.resim,
            quantity: 1
        });
    }

    localStorage.setItem('luxuryCart', JSON.stringify(cart));
    updateCartCount();
    
    showToast(`✅ ${product.isim} sepete eklendi!`);
}

// ============================================
// 5. SEPET SAYISINI GUNCELLE
// ============================================
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('luxuryCart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// ============================================
// 6. TOAST BILDIRIMI
// ============================================
function showToast(message) {
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
            <i class="fas fa-check-circle" style="color:#d47b8e; font-size:1.4rem;"></i>
            <span>${message}</span>
        </div>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #121212;
        color: #ffffff;
        padding: 16px 24px;
        border-radius: 16px;
        border: 1px solid rgba(212, 123, 142, 0.15);
        box-shadow: 0 15px 40px rgba(0,0,0,0.5);
        z-index: 10000;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9rem;
        max-width: 400px;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
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
            if (toast.parentNode) {
                toast.remove();
            }
        }, 400);
    }, 3000);
}

// ============================================
// 7. SEPETI WHATSAPP'A GONDER
// ============================================
function sendCartToWhatsApp() {
    const cart = JSON.parse(localStorage.getItem('luxuryCart')) || [];
    
    if (cart.length === 0) {
        showToast('Sepetiniz boş!');
        return;
    }
    
    let message = '🛍️ *LUXURY BOX SİPARİŞİM*%0A';
    message += '============================%0A%0A';
    
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `📦 ${index + 1}. ${item.name}%0A`;
        message += `   Fiyat: ${item.price.toLocaleString()} TL x ${item.quantity}%0A`;
        message += `   Toplam: ${itemTotal.toLocaleString()} TL%0A%0A`;
    });
    
    message += `💰 *GENEL TOPLAM: ${total.toLocaleString()} TL*%0A%0A`;
    message += `📱 Instagram: @luxurybox.tm%0A`;
    message += `📍 İstanbul, Türkiye%0A%0A`;
    message += `Teşekkürler! 🙏`;
    
    const url = 'https://wa.me/' + phoneNumber + '?text=' + message;
    window.open(url, '_blank');
}

// ============================================
// 8. WHATSAPP DOGRUDAN ILETISIM
// ============================================
function openWhatsApp(productName) {
    const message = 
        'LUXURY BOX - OZEL SIPARIS\n' +
        '============================\n\n' +
        'Urun: ' + productName + '\n' +
        'Bu urun hakkinda bilgi almak istiyorum.\n\n' +
        'LUXURY BOX\n' +
        '@luxurybox.tm';

    const encodedMessage = encodeURIComponent(message);
    const url = 'https://wa.me/' + phoneNumber + '?text=' + encodedMessage;
    window.open(url, '_blank');
}

// ============================================
// 9. SAYFAYA GÖRE ÜRÜN YÜKLE
// ============================================
async function loadProductsByPage() {
    const currentPage = window.location.pathname.split('/').pop();
    let kategori = 'anasayfa';
    
    if (currentPage === 'kadin.html') {
        kategori = 'ayakkabilar';
    } else if (currentPage === 'erkek.html') {
        kategori = 'gozluk-saat';
    } else if (currentPage === 'cocuk.html') {
        kategori = 'cantalar';
    } else if (currentPage === 'cart.html' || currentPage === 'sepet.html') {
        return;
    }
    
    console.log('📄 Sayfa:', currentPage, '→ Kategori:', kategori);
    await displayProductsByCategory(kategori);
}

// ============================================
// 10. KATEGORİYE GÖRE ÜRÜN GÖSTER
// ============================================
async function displayProductsByCategory(kategori) {
    const grid = document.getElementById('productGrid');
    if (!grid) {
        console.warn('⚠️ productGrid bulunamadı');
        return;
    }
    
    let products;
    
    if (kategori === 'anasayfa') {
        const allProducts = await getProducts();
        products = allProducts.slice(0, 6);
    } else {
        products = await getProductsByCategory(kategori);
    }
    
    grid.innerHTML = '';
    
    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div style="text-align:center; grid-column:1/-1; padding:60px 20px; color:#999;">
                <i class="fas fa-box-open" style="font-size:3rem; margin-bottom:20px; display:block; color:#d47b8e;"></i>
                <p style="font-size:1.2rem;">Bu kategoride henüz ürün yok.</p>
                <p style="font-size:0.9rem;">Admin panelinden ürün ekleyebilirsiniz.</p>
                <a href="admin.html" style="display:inline-block; margin-top:20px; padding:12px 30px; background:#d47b8e; color:#fff; border-radius:50px; text-decoration:none;">
                    <i class="fas fa-plus"></i> Admin Paneli
                </a>
            </div>
        `;
        return;
    }
    
    let html = '';
    products.forEach(product => {
        html += createProductCard(product);
    });
    grid.innerHTML = html;
    
    setupAddToCartButtons();
}

// ============================================
// 11. ÜRÜN KARTI OLUŞTUR
// ============================================
function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="${product.resim}" alt="${product.isim}" onerror="this.src='css/foto/placeholder.jpeg'" />
            <h3>${product.isim}</h3>
            ${product.marka ? `<p class="brand">${product.marka}</p>` : ''}
            <p class="price">${product.fiyat.toLocaleString()} TL</p>
            <button class="add-to-cart" 
                    data-id="${product.id}" 
                    data-name="${product.isim}" 
                    data-price="${product.fiyat}" 
                    data-image="${product.resim}">
                <i class="fas fa-plus"></i> Sepete Ekle
            </button>
        </div>
    `;
}

// ============================================
// 12. SEPETE EKLE BUTONLARINI AYARLA
// ============================================
function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.removeEventListener('click', addToCart);
        button.addEventListener('click', addToCart);
    });
}

// ============================================
// 13. SAYFA YUKLENDİĞİNDE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LUXURY BOX yükleniyor...');
    
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navbarLinks = document.querySelector('.navbar-links');
    const dropdown = document.querySelector('.dropdown');

    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            navbarLinks.classList.toggle('active');
        });
    }

    const dropbtn = document.querySelector('.dropbtn');
    if (dropbtn) {
        dropbtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (dropdown) {
                dropdown.classList.toggle('open');
            }
        });
    }

    document.querySelectorAll('.navbar-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navbarLinks) {
                navbarLinks.classList.remove('active');
            }
        });
    });

    updateCartCount();

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.question');
        if (question) {
            question.addEventListener('click', function() {
                const isOpen = item.classList.contains('open');
                faqItems.forEach(faq => faq.classList.remove('open'));
                if (!isOpen) item.classList.add('open');
            });
        }
    });

    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Mesajınız başarıyla gönderildi!');
            this.reset();
        });
    }

    const whatsappOrderBtn = document.getElementById('whatsapp-order-btn');
    if (whatsappOrderBtn) {
        whatsappOrderBtn.addEventListener('click', function() {
            sendCartToWhatsApp();
        });
    }

    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'cart.html' || currentPage === 'sepet.html') {
        loadCartItems();
    }
    
    loadProductsByPage();
    setupAddToCartButtons();
});

// ============================================
// 14. GLOBAL FONKSİYONLAR
// ============================================
window.openWhatsApp = openWhatsApp;
window.addToCart = addToCart;
window.loadCartItems = loadCartItems;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.sendCartToWhatsApp = sendCartToWhatsApp;

// ============================================
// 15. KONSOL
// ============================================
console.log('%c LUXURY BOX ', 'font-size:28px; font-weight:bold; color:#d47b8e;');
console.log('%c Enya | Founder ', 'font-size:16px; color:#d47b8e;');
console.log('%c Supabase entegrasyonu ile çalışıyor ✅', 'font-size:13px; color:#2ecc71;');
console.log('%c Sepet sistemi aktif ✅', 'font-size:13px; color:#d47b8e;');