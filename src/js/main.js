
import { loadHeaderFooter } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import { renderListWithTemplate } from "./utils.mjs";

loadHeaderFooter();

// Product card template for home page
function productCardTemplate(product) {
  // Handle different image structures
  let imageSrc = "";
  if (product.Image) {
    // Tents and hammocks have simple Image field
    const pathParts = product.Image.split("/");
    const subfolder = pathParts[pathParts.length - 2];
    const filename = pathParts[pathParts.length - 1];
    imageSrc = `images/${subfolder}/${filename}`;
  } else if (product.Images && product.Images.PrimaryLarge) {
    // Backpacks and sleeping-bags have Images.PrimaryLarge
    imageSrc = product.Images.PrimaryLarge;
  }

  return `<li class="product-card">
    <a href="/product_pages/?product=${product.Id}">
      <img src="${imageSrc}" alt="${product.Name}">
      <h3 class="card__brand">${product.Brand?.Name || ""}</h3>
      <h2 class="card__name">${product.NameWithoutBrand || product.Name}</h2>
      <p class="product-card__price">$${product.FinalPrice?.toFixed(2) || ""}</p>
    </a>
  </li>`;
}

// Load top products for a category
async function loadTopProducts(category, listElement, count = 4) {
  try {
    const dataSource = new ProductData(category);
    const products = await dataSource.getData();
    
    // Take the first 'count' products as top products
    const topProducts = products.slice(0, count);
    
    // Render the products
    renderListWithTemplate(productCardTemplate, listElement, topProducts, "afterbegin", true);
  } catch (error) {
    console.error(`Error loading ${category} products:`, error);
    listElement.innerHTML = `<li>No ${category} products available</li>`;
  }
}

// Load all category products when the page loads
async function loadAllTopProducts() {
  const categories = [
    { name: "tents", element: document.querySelector(".tents-list") },
    { name: "backpacks", element: document.querySelector(".backpacks-list") },
    { name: "sleeping-bags", element: document.querySelector(".sleeping-bags-list") },
    { name: "hammocks", element: document.querySelector(".hammocks-list") }
  ];

  // Load products for each category
  for (const category of categories) {
    if (category.element) {
      await loadTopProducts(category.name, category.element, 4);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", loadAllTopProducts);


