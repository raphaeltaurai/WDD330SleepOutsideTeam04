import { setLocalStorage, getLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    this.renderProductDetails();
    // Add event listener to Add to Cart button after rendering
    const addToCartBtn = document.getElementById("addToCart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", this.addProductToCart.bind(this));
    }
  }

  addProductToCart() {
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
    // Find the main container or create a fallback
    let main = document.querySelector("main");
    if (!main) {
      main = document.createElement("main");
      document.body.appendChild(main);
    }
    // Remove any previous product-detail section
    const oldDetail = main.querySelector(".product-detail");
    if (oldDetail) oldDetail.remove();

    // Prepare product data
    const brand = this.product.Brand?.Name || "";
    const name = this.product.NameWithoutBrand || this.product.Name || "";
    
    // Handle different image structures for API data
    let image = "";
    if (this.product.Images && this.product.Images.PrimaryLarge) {
      // Use PrimaryLarge for product details
      image = this.product.Images.PrimaryLarge;
    } else if (this.product.Image) {
      // Fallback for local data structure
      image = this.product.Image.replace("../", "../");
    }
    
    const price = this.product.FinalPrice ? `$${this.product.FinalPrice.toFixed(2)}` : "";
    const color = this.product.Colors && this.product.Colors[0]?.ColorName ? this.product.Colors[0].ColorName : "";
    const description = this.product.DescriptionHtmlSimple || "";
    const id = this.product.Id || "";

    // Build HTML
    const section = document.createElement("section");
    section.className = "product-detail";
    section.innerHTML = `
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
    main.appendChild(section);
  }
}
