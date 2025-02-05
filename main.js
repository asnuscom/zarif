// Ürün detaylarını gösteren modal
function showProductModal(title, description, image) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalImage = document.getElementById('modal-image');

    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalImage.src = image;
    modalImage.alt = title;

    modal.classList.remove('hidden');
}

// Modalı kapatan fonksiyon
function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
}

// Firebase yapılandırması
const firebaseConfig = {
    // Firebase console'dan alınan config bilgileri buraya gelecek
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Sayfa içeriğini yükle
async function loadContent() {
    try {
        const contentDoc = await db.collection('content').doc('homepage').get();
        const content = contentDoc.data();

        if (content) {
            // Hero bölümünü güncelle
            document.querySelector('h1').textContent = content.heroTitle;
            document.querySelector('#hero p').textContent = content.heroDescription;

            // Ürünleri güncelle
            const productsContainer = document.querySelector('#featured .grid');
            productsContainer.innerHTML = '';

            content.products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'group relative product-card cursor-pointer hover:shadow-lg transition-shadow duration-300';
                productDiv.innerHTML = `
          <div class="w-full min-h-80 bg-gray-200 rounded-lg overflow-hidden">
            <img src="${product.imageUrl}" alt="${product.title}" class="w-full h-full object-center object-cover">
          </div>
          <div class="mt-4">
            <h3 class="text-lg font-medium text-gray-900">${product.title}</h3>
            <p class="mt-1 text-sm text-gray-500">${product.description}</p>
          </div>
        `;
                productsContainer.appendChild(productDiv);
            });
        }
    } catch (error) {
        console.error('İçerik yüklenirken hata:', error);
    }
}

// Sayfa yüklendiğinde içeriği yükle
document.addEventListener('DOMContentLoaded', loadContent);

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function () {
    // Mobil menü işlemleri
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.querySelector('.hidden.md\\:hidden');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });

        // Mobil menüdeki linklere tıklandığında menüyü kapat
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });

        // Sayfa dışına tıklandığında menüyü kapat
        document.addEventListener('click', (e) => {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Navbar scroll efekti
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('shadow-md', 'bg-white/95', 'backdrop-blur-sm');
        } else {
            header.classList.remove('shadow-md', 'bg-white/95', 'backdrop-blur-sm');
        }
    });

    // Ürün kartlarına tıklama olayı ekle
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            const description = card.querySelector('p').textContent;
            const image = card.querySelector('img').src;
            showProductModal(title, description, image);
        });
    });

    // Modal dışına tıklandığında modalı kapat
    const modal = document.getElementById('product-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC tuşuna basıldığında modalı kapat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Görsel yükleme skeleton efekti
    const productImages = document.querySelectorAll('.product-card img');
    productImages.forEach(img => {
        if (!img.complete) {
            img.parentElement.classList.add('skeleton');
            img.onload = () => {
                img.parentElement.classList.remove('skeleton');
            }
        }
    });

    // Smooth scroll için tüm iç linkleri seç
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Carousel işlemleri
    let currentSlide = 0;
    const totalSlides = 3;
    let autoplayInterval;
    let isTransitioning = false; // Geçiş durumunu kontrol etmek için

    function moveCarousel(direction) {
        if (isTransitioning) return; // Eğer geçiş devam ediyorsa yeni geçişi engelle

        isTransitioning = true;
        currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
        updateCarousel();

        // Geçiş animasyonu tamamlandıktan sonra yeni geçişlere izin ver
        setTimeout(() => {
            isTransitioning = false;
        }, 500); // Bu süre, CSS'teki transition-duration ile aynı olmalı
    }

    function goToSlide(slideIndex) {
        if (isTransitioning || slideIndex === currentSlide) return;

        isTransitioning = true;
        currentSlide = slideIndex;
        updateCarousel();

        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }

    function updateCarousel() {
        const carousel = document.querySelector('#hero-carousel .flex');
        const indicators = document.querySelectorAll('#hero-carousel .bottom-4 button');

        // Slide'ları güncelle
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;

        // İndikatörleri güncelle
        indicators.forEach((indicator, index) => {
            if (index === currentSlide) {
                indicator.classList.add('bg-white');
                indicator.classList.remove('bg-white/60');
            } else {
                indicator.classList.remove('bg-white');
                indicator.classList.add('bg-white/60');
            }
        });

        // Otomatik geçişi yeniden başlat
        resetAutoplay();
    }

    function startAutoplay() {
        stopAutoplay(); // Önceki interval'ı temizle
        autoplayInterval = setInterval(() => {
            if (!isTransitioning) {
                moveCarousel(1);
            }
        }, 5000); // Her 5 saniyede bir geçiş yap
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Sayfa yüklendiğinde carousel'i başlat
    startAutoplay();

    // Carousel üzerine gelindiğinde otomatik geçişi durdur
    const carousel = document.getElementById('hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);

        // Touch olayları için
        carousel.addEventListener('touchstart', stopAutoplay);
        carousel.addEventListener('touchend', startAutoplay);
    }

    // Carousel butonlarına tıklandığında geçişi engelle
    const carouselButtons = document.querySelectorAll('#hero-carousel button');
    carouselButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}); 