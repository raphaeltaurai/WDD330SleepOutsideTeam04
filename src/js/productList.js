import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  // Handle different image structures for API data
  let imageSrc = "";
  if (product.Images && product.Images.PrimaryMedium) {
    // Use PrimaryMedium for product lists
    imageSrc = product.Images.PrimaryMedium;
  } else if (product.Image) {
    // Fallback for local data structure
    const pathParts = product.Image.split("/");
    const subfolder = pathParts[pathParts.length - 2];
    const filename = pathParts[pathParts.length - 1];
    imageSrc = `../images/${subfolder}/${filename}`;
  }

  return `<li class="product-card">
    <a href="product_pages/?product=${product.Id}">
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
    const list = await this.dataSource.getData(this.category);
    this.renderList(list);
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list, "afterbegin", true);
  }
} 
