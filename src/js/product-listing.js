import ExternalServices from "./ExternalServices.mjs";
import HouseList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

loadHeaderFooter();

const status = getParam("status"); // 'to rent' or 'to buy'
const dataSource = new ExternalServices();
const listElement = document.querySelector("#product-list");

// Add search and filter controls
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".products");
  const controls = document.createElement("div");
  controls.className = "house-controls";
  controls.innerHTML = `
    <input type="text" id="house-search" placeholder="Search by address or description..." style="padding:0.5em 1em; margin-right:1em; border-radius:6px; border:1px solid #ccc; width:220px;">
    <select id="price-filter" style="padding:0.5em 1em; border-radius:6px; border:1px solid #ccc;">
      <option value="all">All Prices</option>
      <option value="0-500">Under $500</option>
      <option value="500-1000">$500 - $1,000</option>
      <option value="1000-2000">$1,000 - $2,000</option>
      <option value="2000+">Over $2,000</option>
    </select>
  `;
  section.insertBefore(controls, section.children[1]);
});

let allHouses = [];
let filteredHouses = [];

async function loadAndRenderHouses() {
  allHouses = await dataSource.getHousesByStatus(status);
  filteredHouses = allHouses;
  renderFilteredHouses();
}

function renderFilteredHouses() {
  // Use HouseList's renderList directly
  const houseList = new HouseList(status, dataSource, listElement);
  houseList.renderList(filteredHouses);
}

function applyFilters() {
  const searchValue = (document.getElementById("house-search")?.value || "").toLowerCase();
  const priceValue = document.getElementById("price-filter")?.value || "all";
  filteredHouses = allHouses.filter(house => {
    // Search filter
    const matchesSearch =
      house.address?.toLowerCase().includes(searchValue) ||
      house.description?.toLowerCase().includes(searchValue);
    // Price filter
    let matchesPrice = true;
    if (priceValue !== "all" && house.price) {
      const price = Number(house.price);
      if (priceValue === "0-500") matchesPrice = price < 500;
      else if (priceValue === "500-1000") matchesPrice = price >= 500 && price < 1000;
      else if (priceValue === "1000-2000") matchesPrice = price >= 1000 && price < 2000;
      else if (priceValue === "2000+") matchesPrice = price >= 2000;
    }
    return matchesSearch && matchesPrice;
  });
  renderFilteredHouses();
}

// Event listeners for search/filter
document.addEventListener("input", (e) => {
  if (e.target.id === "house-search" || e.target.id === "price-filter") {
    applyFilters();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const titleElement = document.querySelector(".products h2");
  if (titleElement && status) {
    titleElement.textContent = `Houses: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  }
  loadAndRenderHouses();
});

