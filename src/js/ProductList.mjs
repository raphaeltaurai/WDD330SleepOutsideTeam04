import { renderListWithTemplate, fetchHousePictures } from "./utils.mjs";

function houseCardTemplate(house) {
  // Use the first image as the main image
  let imageSrc = "";
  if (Array.isArray(house.images) && house.images.length > 0) {
    imageSrc = house.images[0];
  }
  // fallback placeholder
  if (!imageSrc) imageSrc = "https://via.placeholder.com/400x300?text=No+Image";

  // Address, price, and status (to rent/to buy)
  const address = house.address || "";
  const price = house.price ? `$${house.price.toLocaleString()}` : "";
  const status = house.status ? house.status.charAt(0).toUpperCase() + house.status.slice(1) : "";

  return `<li class="house-card">
    <a href="/product_pages/?house=${house.id}">
      <img src="${imageSrc}" alt="House image">
      <div class="card-content">
        <h2 class="card__address">${address}</h2>
        <p class="house-card__price">${price}</p>
        <span class="house-card__status">${status}</span>
      </div>
    </a>
  </li>`;
}

export default class HouseList {
  constructor(status, dataSource, listElement) {
    this.status = status; // 'to rent' or 'to buy'
    this.dataSource = dataSource;
    this.listElement = listElement;
  }


  async init() {
    // Fetch houses by status
    let list = await this.dataSource.getHousesByStatus(this.status);
    // Normalize fields for rendering
    list = list.map(house => ({
      id: house.Id || house.id,
      name: house.Name || house.name,
      address: house.address,
      price: house.FinalPrice || house.price,
      status: house.status,
      description: house.description,
      images: [],
    }));
    // Fetch Unsplash images and assign to houses
    try {
      const unsplashImages = await fetchHousePictures(list.length);
      list = list.map((house, idx) => {
        const img = unsplashImages[idx]?.urls?.regular || unsplashImages[idx]?.urls?.small;
        return { ...house, images: img ? [img] : house.images };
      });
    } catch (e) {
      // If Unsplash fails, fallback to placeholder (handled in template)
    }
    this.renderList(list);
  }

  renderList(list) {
    renderListWithTemplate(houseCardTemplate, this.listElement, list, "afterbegin", true);
  }
} 
