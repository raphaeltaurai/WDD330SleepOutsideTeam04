import { alertMessage } from "./utils.mjs";

const UNSPLASH_FALLBACKS = [
  "https://source.unsplash.com/400x300/?modern,house,exterior",
  "https://source.unsplash.com/400x300/?home,architecture,realestate",
  "https://source.unsplash.com/400x300/?house,property,exterior",
  "https://source.unsplash.com/400x300/?villa,home,modern"
];

export default class HouseDetails {
  constructor(houseId, dataSource) {
    this.houseId = houseId;
    this.house = {};
    this.dataSource = dataSource;
  }

  async init() {
    try {
      this.house = await this.dataSource.findHouseById(this.houseId);
      this.owner = await this.dataSource.getHouseOwner(this.houseId);
      this.reviews = await this.dataSource.getHouseReviews(this.houseId);
      this.renderHouseDetails();
      // Add event listener to Contact Agent button
      const contactBtn = document.getElementById("contactAgent");
      if (contactBtn) {
        contactBtn.addEventListener("click", this.contactAgent.bind(this));
      }
    } catch (error) {
      console.error("Error loading house details:", error);
      const houseDetailSection = document.querySelector("#product-detail");
      if (houseDetailSection) {
        houseDetailSection.innerHTML = `
          <div class="error-message">
            <h3>Error Loading House</h3>
            <p>Sorry, we couldn't load the house details. Please try again later.</p>
            <p>Error: ${error.message}</p>
          </div>
        `;
      }
    }
  }

  contactAgent() {
    alertMessage("Contact form or agent details would appear here.");
  }

  renderHouseDetails() {
    const houseDetailSection = document.querySelector("#product-detail");
    if (!houseDetailSection) {
      console.error("House detail section not found");
      return;
    }

    // Gallery of images (with Unsplash fallback)
    let galleryHtml = "";
    let images = Array.isArray(this.house.images) && this.house.images.length > 0 ? this.house.images : UNSPLASH_FALLBACKS;
    galleryHtml = `<div class='house-gallery'>` +
      images.map(img => `<img src='${img}' alt='House image' />`).join("") +
      `</div>`;

    const address = this.house.address || "";
    const price = this.house.price ? `$${this.house.price.toLocaleString()}` : "";
    const status = this.house.status ? this.house.status.charAt(0).toUpperCase() + this.house.status.slice(1) : "";
    const description = this.house.description || "";
    const ownerName = this.owner && this.owner.length > 0 ? this.owner[0].name : "";
    const ownerContact = this.owner && this.owner.length > 0 ? this.owner[0].contact : "";

    // Reviews
    let reviewsHtml = "";
    if (Array.isArray(this.reviews) && this.reviews.length > 0) {
      reviewsHtml = `<div class='house-reviews'><h4>Reviews</h4>` +
        this.reviews.map(r => `<div class='review'><strong>${r.user}</strong>: ${r.comment}</div>`).join("") +
        `</div>`;
    }

    const html = `
      <h2 class="divider">${address}</h2>
      ${galleryHtml}
      <p class="house-card__price">${price}</p>
      <span class="house-card__status">${status}</span>
      <p class="house__description">${description}</p>
      <div class="house-owner">
        <h4>Owner Info</h4>
        <p>${ownerName ? `Name: ${ownerName}` : ""}</p>
        <p>${ownerContact ? `Contact: ${ownerContact}` : ""}</p>
      </div>
      ${reviewsHtml}
      <div class="house-detail__contact">
        <button id="contactAgent" data-id="${this.houseId}">Contact Agent</button>
      </div>
    `;
    houseDetailSection.innerHTML = html;
  }
}
