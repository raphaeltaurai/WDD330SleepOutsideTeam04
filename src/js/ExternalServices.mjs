const baseURL = import.meta.env.VITE_SERVER_URL;

// Helper to detect if we should use local JSON
function useLocalJson() {
  return !baseURL || baseURL === "undefined";
}

async function convertToJson(res) {
  const jsonResponse = await res.json();
  if (res.ok) {
    return jsonResponse;
  } else {
    throw { name: "servicesError", message: jsonResponse };
  }
}

export default class ExternalServices {
  constructor() {}

  // Fetch all houses (now using /products endpoint)
  async getAllHouses() {
    if (useLocalJson()) {
      const response = await fetch("/json/houses.json");
      return await response.json();
    } else {
      const response = await fetch(`${baseURL}products`);
      const data = await convertToJson(response);
      return data;
    }
  }

  // Fetch houses by status (to rent or to buy)
  async getHousesByStatus(status) {
    // If the API provides a way to filter by status, use it. Otherwise, filter client-side.
    const allHouses = await this.getAllHouses();
    if (!status) return allHouses;
    // Assume status is a property like 'for_rent' or 'for_sale' on the house object
    return allHouses.filter(house => house.status && house.status.toLowerCase() === status.toLowerCase());
  }

  // Fetch house by ID (now using /products endpoint)
  async findHouseById(id) {
    const response = await fetch(`${baseURL}products/${id}`);
    const data = await convertToJson(response);
    return data;
  }

  // Fetch houses in a place (optional, for future use, using /products endpoint as placeholder)
  async getHousesByPlace(placeId) {
    const response = await fetch(`${baseURL}products?placeId=${placeId}`);
    const data = await convertToJson(response);
    return data;
  }

  // Fetch house owner info (optional, for detail page, using /products endpoint as placeholder)
  async getHouseOwner(id) {
    const response = await fetch(`${baseURL}products/${id}/owners`);
    const data = await convertToJson(response);
    return data;
  }

  // Fetch house reviews (optional, for detail page, using /products endpoint as placeholder)
  async getHouseReviews(id) {
    const response = await fetch(`${baseURL}products/${id}/reviews`);
    const data = await convertToJson(response);
    return data;
  }
}
