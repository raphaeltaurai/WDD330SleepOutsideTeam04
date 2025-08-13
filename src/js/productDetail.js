import ExternalServices from "./ExternalServices.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";
import HouseDetails from "./ProductDetails.mjs";

const houseId = getParam("house");

if (!houseId) {
  document.addEventListener("DOMContentLoaded", () => {
    const houseDetailSection = document.querySelector("#product-detail");
    if (houseDetailSection) {
      houseDetailSection.innerHTML = `
        <div class="error-message">
          <h3>No House Selected</h3>
          <p>Please select a house from the listing to view its details.</p>
          <a href="/product-listing/index.html" class="btn">Browse Houses</a>
        </div>
      `;
    }
  });
} else {
  const dataSource = new ExternalServices();
  const house = new HouseDetails(houseId, dataSource);
  house.init();
}

loadHeaderFooter();
