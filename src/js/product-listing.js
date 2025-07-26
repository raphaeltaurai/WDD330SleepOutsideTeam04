import ProductData from "./ProductData.mjs";
import ProductList from "./productList.js";
import { loadHeaderFooter, getParam } from "./utils.mjs";

loadHeaderFooter();

const category = getParam("category");
// first create an instance of the ProductData class.
const dataSource = new ProductData();
// then get the element you want the product list to render in
const listElement = document.querySelector("#product-list");
// then create an instance of the ProductList class and send it the correct information.
const myList = new ProductList(category, dataSource, listElement);
// The init method is now called automatically in the constructor

// Update the page title to show the category
document.addEventListener("DOMContentLoaded", () => {
  const titleElement = document.querySelector(".products h2");
  if (titleElement && category) {
    titleElement.textContent = `Top Products: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  }
});

