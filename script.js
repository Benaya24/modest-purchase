// --- State Management ---
let likedProducts = {};
let currentCategory = 'home';
let allProducts = []; // This will hold all products from our DB

// --- DOM Elements ---
const pageBody = document.getElementById('page-body');
const productGrid = document.getElementById('product-grid');
const navLinks = document.querySelectorAll('.nav-link');
const heroSection = document.getElementById('hero-section');
const heroIcon = document.getElementById('hero-icon');
const heroTitle = document.getElementById('hero-title');
const heroSubtitle = document.getElementById('hero-subtitle');

const API_ENDPOINT = '/.netlify/functions/api';

const heroContent = {
    home: { title: 'ברוכים הבאים לרכישה צנועה', subtitle: 'המקום שלכם למצוא את הדילים הכי שווים על אופנה לכל המשפחה.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" x2="21" y1="6" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>' },
    men: { title: 'קולקציית גברים', subtitle: 'גלו את הטרנדים האחרונים באופנת גברים.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 22V10h8v12"></path><path d="M8 10l-2-8h12l-2 8"></path></svg>' },
    women: { title: 'קולקציית נשים', subtitle: 'משמלות ערב ועד ג\'ינסים מחמיאים.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M6 2v4h12V2Z"></path><path d="m6 6 2 14h8l2-14Z"></path></svg>' },
    children: { title: 'קולקציית ילדים', subtitle: 'בגדים נוחים, צבעוניים ועמידים לקטנטנים שלכם.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 8h8v14H8z"></path><path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"></path></svg>' },
    gifts: { title: 'עולם של מתנות', subtitle: 'רעיונות מקוריים ומפתיעים לכל אחד ולכל אירוע.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>' },
    likes: { title: 'המוצרים שאהבתי', subtitle: 'כאן שמורים כל הפריטים שסימנתם.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>' }
};

function createProductCard(product) {
    const isLiked = !!likedProducts[product.id];
    const categoryColors = { men: '#0d6efd', women: '#d63384', children: '#ffc107', gifts: '#14b8a6', home: '#6f42c1', likes: '#dc2626' };
    const themeColor = categoryColors[product.category] || categoryColors.home;

    return `
        <div class="product-card flex flex-col">
            <div class="relative">
                <a href="${product.link}" target="_blank" rel="noopener noreferrer">
                    <img src="${product.img}" alt="${product.name}" class="w-full h-56 object-cover bg-gray-100" onerror="this.onerror=null;this.src='https://placehold.co/400x400/cccccc/ffffff?text=Error';">
                </a>
                <div class="like-btn absolute top-3 right-3 bg-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md ${isLiked ? 'liked' : ''}" onclick='toggleLike(${JSON.stringify(product)})'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-500 transition-all"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                </div>
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="font-semibold text-gray-800 mb-2 flex-grow">${product.name}</h3>
                <div class="flex items-baseline gap-2 mb-3">
                    <span class="text-xl font-bold" style="color: ${themeColor};">₪${product.price}</span>
                </div>
                <a href="${product.link}" target="_blank" rel="noopener noreferrer" class="w-full py-2 rounded-lg font-semibold text-sm text-white text-center" style="background-color: ${themeColor};">קנו עכשיו</a>
            </div>
        </div>
    `;
}

function renderProducts(productsToRender) {
    if (!productsToRender || productsToRender.length === 0) {
        if (currentCategory === 'likes') {
            productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">עדיין לא אהבתם אף מוצר.</p>`;
        } else {
            productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">לא נמצאו מוצרים בקטגוריה זו. ניתן להוסיף מוצרים דרך <a href="/admin.html" class="text-blue-600 underline">עמוד הניהול</a>.</p>`;
        }
        return;
    }
    productGrid.innerHTML = productsToRender.map(createProductCard).join('');
}

function changeCategory(category) {
    currentCategory = category;
    pageBody.className = `theme-${category}`;
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.id === `nav-${category}`) link.classList.add('active');
    });

    const content = heroContent[category];
    if (content) {
        heroIcon.innerHTML = content.icon;
        heroTitle.textContent = content.title;
        heroSubtitle.textContent = content.subtitle;
    }

    if (category === 'likes') {
        renderProducts(Object.values(likedProducts));
    } else if (category === 'home') {
        renderProducts(allProducts);
    } else {
        const filteredProducts = allProducts.filter(p => p.category === category);
        renderProducts(filteredProducts);
    }
}

function toggleLike(product) {
    if (likedProducts[product.id]) {
        delete likedProducts[product.id];
    } else {
        likedProducts[product.id] = product;
    }
    localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
    const card = document.querySelector(`[onclick='toggleLike(${JSON.stringify(product)})']`);
    if (card) card.classList.toggle('liked');
    if (currentCategory === 'likes') renderProducts(Object.values(likedProducts));
}

function loadLikesFromStorage() {
    const storedLikes = localStorage.getItem('likedProducts');
    if (storedLikes) likedProducts = JSON.parse(storedLikes);
}

async function initializeApp() {
    loadLikesFromStorage();
    try {
        const response = await fetch(`${API_ENDPOINT}?action=getProducts`);
        if (!response.ok) throw new Error('Failed to fetch product list');
        const data = await response.json();
        allProducts = data.products;
        changeCategory('home');
    } catch (e) {
        console.error("Could not load initial products", e);
        productGrid.innerHTML = `<p class="col-span-full text-center text-red-500">שגיאה בטעינת רשימת המוצרים.</p>`;
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.id.replace('nav-', '');
        changeCategory(category);
    });
});

initializeApp();
