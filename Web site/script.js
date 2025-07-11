document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------------
  // --- כאן אתה מנהל את רשימת המוצרים שיוצגו באתר ---
  const productIds = [
    "1005006331027409",
    "1005006331373168",
    "1005005550133405",
    "1005006253492742", // מוצר רביעי לדוגמה
  ];
  // -------------------------------------------------------------------

  const productsContainer = document.querySelector(".products-container");

  if (!productsContainer) {
    console.error("Products container not found!");
    return;
  }

  productsContainer.innerHTML = "";

  const displayProduct = async (productId) => {
    try {
      const response = await fetch(
        `https://benaya-server-app.onrender.com/api/get-product-info/${productId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch product ${productId}`);
      }
      // שינינו את שם המשתנה כדי שיהיה ברור יותר
      const dataFromServer = await response.json();

      // חילוץ המידע מתוך התשובה המורכבת של אליאקספרס
      const productDetails =
        dataFromServer?.aliexpress_local_service_product_query_response
          ?.local_service_product_dto;

      if (!productDetails) {
        console.error(`No valid data for product ID ${productId}`);
        return;
      }

      const productCard = document.createElement("div");
      productCard.className = "product-card";

      productCard.innerHTML = `
                <div class="product-image-container">
                    <a href="#" target="_blank">
                        <img src="${productDetails.multimedia.media_list[0].url}" alt="${productDetails.title}">
                    </a>
                </div>
                <div class="product-info">
                    <h3>${productDetails.title}</h3>
                    <div class="price">
                        <span class="current-price">${productDetails.product_property_list[0].sku_price} ₪</span>
                    </div>
                    <div class="rating">
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-regular fa-star"></i>
                    </div>
                    <button class="add-to-cart-btn">הוספה לסל</button>
                </div>
            `;

      productsContainer.appendChild(productCard);

      // --- החלק החשוב שהוספנו ---
      // מצא את הקישור (<a>) בתוך הכרטיס החדש
      const linkElement = productCard.querySelector(
        ".product-image-container a"
      );

      // עדכן את הכתובת שלו לקישור השותפים שקיבלנו מהשרת
      if (linkElement && dataFromServer.affiliate_link) {
        linkElement.href = dataFromServer.affiliate_link;
      }
      // ----------------------------

      observer.observe(productCard);
    } catch (error) {
      console.error(error);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  productIds.forEach((id) => {
    displayProduct(id);
  });
});
