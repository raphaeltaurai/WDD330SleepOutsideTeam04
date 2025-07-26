import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  // Handle different image structures
  let imageSrc = "";
  if (product.Image) {
    // Tents and hammocks have simple Image field
    // Extract the subfolder and filename from the path
    const pathParts = product.Image.split("/");
    const subfolder = pathParts[pathParts.length - 2]; // tents or hammocks
    const filename = pathParts[pathParts.length - 1]; // the actual filename
    imageSrc = `../images/${subfolder}/${filename}`;
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

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    const list = await this.dataSource.getData();
    this.renderList(list);
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list, "afterbegin", true);
  }
} 
