// --- ניהול מצב ---
let likedProducts = {};
let currentCategory = "home";
let allProducts = [];

// --- רכיבי DOM ---
const pageBody = document.getElementById("page-body");
const productGrid = document.getElementById("product-grid");
const navLinks = document.querySelectorAll(".nav-link");
const heroSection = document.getElementById("hero-section");
const heroIcon = document.getElementById("hero-icon");
const heroTitle = document.getElementById("hero-title");
const heroSubtitle = document.getElementById("hero-subtitle");

const API_ENDPOINT = "/.netlify/functions/api";

// --- תוכן באנר עליון לפי קטגוריה ---
const heroContent = {
  home: {
    title: "ברוכים הבאים לרכישה צנועה",
    subtitle: "המקום שלכם למצוא את הדילים הכי שווים על אופנה לכל המשפחה.",
    icon: "<svg ...></svg>",
  },
  // המשך התוכן כמו בקוד שלך...
};

// --- יצירת כרטיס מוצר ---
function createProductCard(product) {
  const isLiked = !!likedProducts[product.id];
  const categoryColors = {
    men: "#0d6efd",
    women: "#d63384",
    children: "#ffc107",
    gifts: "#14b8a6",
    home: "#6f42c1",
    likes: "#dc2626",
  };
  const themeColor = categoryColors[product.category] || categoryColors.home;

  return `
    <div class="product-card flex flex-col animate-fade-in-up transition duration-500">
      <div class="relative">
        <a href="${product.link}" target="_blank" rel="noopener noreferrer">
          <img src="${product.img}" alt="${
    product.name
  }" class="w-full h-56 object-cover bg-gray-100" onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=Image+Not+Found';">
        </a>
        <div class="like-btn absolute top-3 right-3 bg-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md ${
          isLiked ? "liked" : ""
        }" onclick='toggleLike(${JSON.stringify(product)})'>
          <svg ...></svg>
        </div>
      </div>
      <div class="p-4 flex flex-col flex-grow">
        <h3 class="font-semibold text-gray-800 mb-2 flex-grow">${
          product.name
        }</h3>
        <div class="flex items-baseline gap-2 mb-3">
          <span class="text-xl font-bold" style="color: ${themeColor};">₪${
    product.price
  }</span>
        </div>
        <a href="${
          product.link
        }" target="_blank" rel="noopener noreferrer" class="w-full py-2 rounded-lg font-semibold text-sm text-white text-center" style="background-color: ${themeColor};">קנו עכשיו</a>
      </div>
    </div>
  `;
}

// --- הצגת מוצרים ---
function renderProducts(productsToRender) {
  productGrid.innerHTML = "";

  if (!productsToRender || productsToRender.length === 0) {
    const message =
      currentCategory === "likes"
        ? "עדיין לא אהבתם אף מוצר."
        : 'לא נמצאו מוצרים. <a href="/admin.html" class="text-blue-600 underline">הוסיפו מוצרים</a>';
    productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">${message}</p>`;
    return;
  }

  productGrid.innerHTML = productsToRender.map(createProductCard).join("");
}

// --- שינוי קטגוריה ---
function changeCategory(category) {
  currentCategory = category;
  pageBody.className = `theme-${category}`;
  navLinks.forEach((link) =>
    link.classList.toggle("active", link.id === `nav-${category}`)
  );

  const content = heroContent[category];
  if (content) {
    heroIcon.innerHTML = content.icon;
    heroTitle.textContent = content.title;
    heroSubtitle.textContent = content.subtitle;
  }

  if (category === "likes") {
    renderProducts(Object.values(likedProducts));
  } else {
    const filtered =
      category === "home"
        ? allProducts
        : allProducts.filter((p) => p.category === category);
    renderProducts(filtered);
  }
}

// --- אהבתי / הסרה ---
function toggleLike(product) {
  if (likedProducts[product.id]) {
    delete likedProducts[product.id];
  } else {
    likedProducts[product.id] = product;
  }

  localStorage.setItem("likedProducts", JSON.stringify(likedProducts));
  if (currentCategory === "likes") {
    renderProducts(Object.values(likedProducts));
  } else {
    changeCategory(currentCategory);
  }
}

// --- אחזור מהמקום המקומי ---
function loadLikesFromStorage() {
  try {
    const stored = localStorage.getItem("likedProducts");
    if (stored) likedProducts = JSON.parse(stored);
  } catch {
    likedProducts = {};
  }
}

// --- אתחול ראשוני ---
async function initializeApp() {
  loadLikesFromStorage();
  try {
    const response = await fetch(`${API_ENDPOINT}?action=getProducts`);
    const data = await response.json();
    allProducts = data.products;
    changeCategory("home");
  } catch (err) {
    console.error("שגיאה בטעינת המוצרים", err);
    productGrid.innerHTML = `<p class="col-span-full text-center text-red-500">שגיאה בטעינת המוצרים.</p>`;
  }
}

// --- האזנה לקישורים ---
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const category = link.id.replace("nav-", "");
    changeCategory(category);
  });
});

initializeApp();
