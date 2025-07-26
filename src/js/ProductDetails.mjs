import { setLocalStorage, getLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    try {
      this.product = await this.dataSource.findProductById(this.productId);
      this.renderProductDetails();
      // Add event listener to Add to Cart button after rendering
      const addToCartBtn = document.getElementById("addToCart");
      if (addToCartBtn) {
        addToCartBtn.addEventListener("click", this.addProductToCart.bind(this));
      }
    } catch (error) {
      console.error("Error loading product details:", error);
      const productDetailSection = document.querySelector("#product-detail");
      if (productDetailSection) {
        productDetailSection.innerHTML = `
          <div class="error-message">
            <h3>Error Loading Product</h3>
            <p>Sorry, we couldn't load the product details. Please try again later.</p>
            <p>Error: ${error.message}</p>
          </div>
        `;
      }
    }
  }

  addProductToCart() {
    // Validate that we have a valid product before adding to cart
    if (!this.product || !this.product.Id) {
      alert("Error: Product information is not available. Please refresh the page and try again.");
      return;
    }
    
    let cartItems = getLocalStorage("so-cart");
    if (!Array.isArray(cartItems)) {
      cartItems = [];
    }
    cartItems.push(this.product);
    setLocalStorage("so-cart", cartItems);
    // Optionally, show feedback to the user
    alert("Product added to cart!");
  }

  renderProductDetails() {
    // Find the existing product-detail section
    const productDetailSection = document.querySelector("#product-detail");
    if (!productDetailSection) {
      console.error("Product detail section not found");
      return;
    }

    // Prepare product data
    const brand = this.product.Brand?.Name || "";
    const name = this.product.NameWithoutBrand || this.product.Name || "";
    
    // Handle different image structures for API data
    let image = "";
    if (this.product.Images && this.product.Images.PrimaryLarge) {
      // Use PrimaryLarge for product details
      image = this.product.Images.PrimaryLarge;
    } else if (this.product.Image) {
      // Fallback for local data structure - fix the path
      const pathParts = this.product.Image.split("/");
      const subfolder = pathParts[pathParts.length - 2];
      const filename = pathParts[pathParts.length - 1];
      image = `/images/${subfolder}/${filename}`;
    }
    
    const price = this.product.FinalPrice ? `$${this.product.FinalPrice.toFixed(2)}` : "";
    const color = this.product.Colors && this.product.Colors[0]?.ColorName ? this.product.Colors[0].ColorName : "";
    const description = this.product.DescriptionHtmlSimple || "";
    const id = this.product.Id || "";

    // Build HTML and insert into the existing section
    const html = `
      <h3>${brand}</h3>
      <h2 class="divider">${name}</h2>
      <img class="divider" src="${image}" alt="${name}" />
      <p class="product-card__price">${price}</p>
      <p class="product__color">${color}</p>
      <p class="product__description">${description}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${id}">Add to Cart</button>
      </div>
    `;
    productDetailSection.innerHTML = html;
  }
}
