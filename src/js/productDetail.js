import { getParam, loadHeaderFooter } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

const productId = getParam("product");

if (!productId) {
  // No product ID provided, show error message
  document.addEventListener("DOMContentLoaded", () => {
    const productDetailSection = document.querySelector("#product-detail");
    if (productDetailSection) {
      productDetailSection.innerHTML = `
        <div class="error-message">
          <h3>No Product Selected</h3>
          <p>Please select a product from the product listing to view its details.</p>
          <a href="/product-listing/index.html" class="btn">Browse Products</a>
        </div>
      `;
    }
  });
} else {
  // Product ID provided, load product details
  const dataSource = new ProductData();
  const product = new ProductDetails(productId, dataSource);
  product.init(); 
}

loadHeaderFooter();
