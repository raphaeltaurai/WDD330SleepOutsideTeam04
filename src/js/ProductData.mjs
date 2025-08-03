const baseURL = import.meta.env.VITE_SERVER_URL;

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ProductData {
  constructor() {
    // No category or path needed for API
  }
  
  async getData(category) {
    const response = await fetch(`${baseURL}products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result;
  }
  
  async findProductById(id) {
    try {
      // Try to get the product by searching in all categories
      const categories = ["tents", "backpacks", "sleeping-bags", "hammocks"];
      
      for (const category of categories) {
        const response = await fetch(`${baseURL}products/search/${category}`);
        if (!response.ok) {
          continue; // Try next category
        }
        const data = await convertToJson(response);
        
        // Handle different response structures
        let products = [];
        if (data.Result) {
          products = data.Result;
        } else if (data.data) {
          products = data.data;
        } else if (Array.isArray(data)) {
          products = data;
        }
        
        // Find the product with matching ID
        const product = products.find(p => p.Id === id || p.id === id);
        if (product) {
          return product;
        }
      }
      
      throw new Error(`Product with ID ${id} not found in any category`);
    } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error(`Failed to fetch product with ID ${id}: ${error.message}`);
    }
  }
}
