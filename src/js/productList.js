import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product, viewMode = "grid") {
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

  // Extract size information for display
  let sizeInfo = "";
  if (product.SizesAvailable && Object.keys(product.SizesAvailable).length > 0) {
    const sizes = Object.values(product.SizesAvailable).flat();
    if (sizes.length > 0) {
      sizeInfo = `<span class="product-size">Sizes: ${sizes.join(", ")}</span>`;
    }
  }

  // Extract rating information
  let ratingInfo = "";
  if (product.Reviews && product.Reviews.AverageRating) {
    const rating = product.Reviews.AverageRating;
    const reviewCount = product.Reviews.ReviewCount;
    ratingInfo = `<span class="product-rating">★ ${rating.toFixed(1)} (${reviewCount} reviews)</span>`;
  }

  if (viewMode === "list") {
    return `<li class="product-card">
      <a href="/product_pages/?product=${product.Id}">
        <img src="${imageSrc}" alt="${product.Name}">
        <div class="card-content">
          <h3 class="card__brand">${product.Brand?.Name || ""}</h3>
          <h2 class="card__name">${product.NameWithoutBrand || product.Name}</h2>
          ${sizeInfo}
          ${ratingInfo}
          <p class="product-card__price">$${product.FinalPrice?.toFixed(2) || ""}</p>
        </div>
      </a>
    </li>`;
  }

  // Default grid view
  return `<li class="product-card">
    <a href="/product_pages/?product=${product.Id}">
      <img src="${imageSrc}" alt="${product.Name}">
      <h3 class="card__brand">${product.Brand?.Name || ""}</h3>
      <h2 class="card__name">${product.NameWithoutBrand || product.Name}</h2>
      ${sizeInfo}
      ${ratingInfo}
      <p class="product-card__price">$${product.FinalPrice?.toFixed(2) || ""}</p>
    </a>
  </li>`;
}

// Sorting functions
const sortFunctions = {
  "price-low": (a, b) => (a.FinalPrice || 0) - (b.FinalPrice || 0),
  "price-high": (a, b) => (b.FinalPrice || 0) - (a.FinalPrice || 0),
  "name-asc": (a, b) => (a.NameWithoutBrand || a.Name || "").localeCompare(b.NameWithoutBrand || b.Name || ""),
  "name-desc": (a, b) => (b.NameWithoutBrand || b.Name || "").localeCompare(a.NameWithoutBrand || a.Name || ""),
  "brand-asc": (a, b) => (a.Brand?.Name || "").localeCompare(b.Brand?.Name || ""),
  "brand-desc": (a, b) => (b.Brand?.Name || "").localeCompare(a.Brand?.Name || ""),
  "rating": (a, b) => (b.Reviews?.AverageRating || 0) - (a.Reviews?.AverageRating || 0),
  "default": () => 0 // Keep original order
};

// Filter functions
const filterFunctions = {
  "all": () => true,
  "0-50": (product) => (product.FinalPrice || 0) < 50,
  "50-100": (product) => (product.FinalPrice || 0) >= 50 && (product.FinalPrice || 0) < 100,
  "100-200": (product) => (product.FinalPrice || 0) >= 100 && (product.FinalPrice || 0) < 200,
  "200-500": (product) => (product.FinalPrice || 0) >= 200 && (product.FinalPrice || 0) < 500,
  "500+": (product) => (product.FinalPrice || 0) >= 500
};

// Category-specific sorting and filtering
const categorySpecificOptions = {
  "tents": {
    sortOptions: [
      { value: "capacity-low", label: "Capacity: Low to High" },
      { value: "capacity-high", label: "Capacity: High to Low" },
      { value: "season-asc", label: "Season: 1 to 4" },
      { value: "season-desc", label: "Season: 4 to 1" }
    ],
    filterOptions: [
      { value: "2-person", label: "2-Person Tents" },
      { value: "3-person", label: "3-Person Tents" },
      { value: "4-person", label: "4-Person+ Tents" },
      { value: "tent-3-season", label: "3-Season Tents" },
      { value: "4-season", label: "4-Season Tents" }
    ]
  },
  "backpacks": {
    sortOptions: [
      { value: "capacity-low", label: "Capacity: Low to High" },
      { value: "capacity-high", label: "Capacity: High to Low" },
      { value: "weight-low", label: "Weight: Light to Heavy" },
      { value: "weight-high", label: "Weight: Heavy to Light" }
    ],
    filterOptions: [
      { value: "daypack", label: "Daypacks (< 30L)" },
      { value: "weekend", label: "Weekend Packs (30-50L)" },
      { value: "multiday", label: "Multi-day Packs (50L+)" },
      { value: "internal-frame", label: "Internal Frame" },
      { value: "external-frame", label: "External Frame" }
    ]
  },
  "sleeping-bags": {
    sortOptions: [
      { value: "temp-low", label: "Temperature: Low to High" },
      { value: "temp-high", label: "Temperature: High to Low" },
      { value: "weight-low", label: "Weight: Light to Heavy" },
      { value: "weight-high", label: "Weight: Heavy to Light" }
    ],
    filterOptions: [
      { value: "summer", label: "Summer Bags (30°F+)" },
      { value: "bag-3-season", label: "3-Season Bags (15-30°F)" },
      { value: "winter", label: "Winter Bags (< 15°F)" },
      { value: "down", label: "Down Fill" },
      { value: "synthetic", label: "Synthetic Fill" }
    ]
  },
  "hammocks": {
    sortOptions: [
      { value: "weight-low", label: "Weight: Light to Heavy" },
      { value: "weight-high", label: "Weight: Heavy to Light" },
      { value: "capacity-low", label: "Capacity: Low to High" },
      { value: "capacity-high", label: "Capacity: High to Low" }
    ],
    filterOptions: [
      { value: "single", label: "Single Hammocks" },
      { value: "double", label: "Double Hammocks" },
      { value: "with-bugnet", label: "With Bug Net" },
      { value: "without-bugnet", label: "Without Bug Net" }
    ]
  }
};

// Enhanced sorting functions with category-specific logic
const enhancedSortFunctions = {
  ...sortFunctions,
  "capacity-low": (a, b) => {
    const capacityA = extractCapacity(a.NameWithoutBrand || a.Name);
    const capacityB = extractCapacity(b.NameWithoutBrand || b.Name);
    return capacityA - capacityB;
  },
  "capacity-high": (a, b) => {
    const capacityA = extractCapacity(a.NameWithoutBrand || a.Name);
    const capacityB = extractCapacity(b.NameWithoutBrand || b.Name);
    return capacityB - capacityA;
  },
  "season-asc": (a, b) => {
    const seasonA = extractSeason(a.NameWithoutBrand || a.Name);
    const seasonB = extractSeason(b.NameWithoutBrand || b.Name);
    return seasonA - seasonB;
  },
  "season-desc": (a, b) => {
    const seasonA = extractSeason(a.NameWithoutBrand || a.Name);
    const seasonB = extractSeason(b.NameWithoutBrand || b.Name);
    return seasonB - seasonA;
  },
  "weight-low": (a, b) => {
    const weightA = extractWeight(a.NameWithoutBrand || a.Name);
    const weightB = extractWeight(b.NameWithoutBrand || b.Name);
    return weightA - weightB;
  },
  "weight-high": (a, b) => {
    const weightA = extractWeight(a.NameWithoutBrand || a.Name);
    const weightB = extractWeight(b.NameWithoutBrand || b.Name);
    return weightB - weightA;
  },
  "temp-low": (a, b) => {
    const tempA = extractTemperature(a.NameWithoutBrand || a.Name);
    const tempB = extractTemperature(b.NameWithoutBrand || b.Name);
    return tempA - tempB;
  },
  "temp-high": (a, b) => {
    const tempA = extractTemperature(a.NameWithoutBrand || a.Name);
    const tempB = extractTemperature(b.NameWithoutBrand || b.Name);
    return tempB - tempA;
  }
};

// Helper functions to extract product specifications from names
function extractCapacity(name) {
  const capacityMatch = name.match(/(\d+)[-\s]?(?:person|p)/i);
  return capacityMatch ? parseInt(capacityMatch[1]) : 0;
}

function extractSeason(name) {
  if (name.includes("4-season") || name.includes("winter")) return 4;
  if (name.includes("3-season")) return 3;
  if (name.includes("2-season")) return 2;
  if (name.includes("1-season") || name.includes("summer")) return 1;
  return 0;
}

function extractWeight(name) {
  const weightMatch = name.match(/(\d+(?:\.\d+)?)\s*(?:oz|lb|g|kg)/i);
  return weightMatch ? parseFloat(weightMatch[1]) : 0;
}

function extractTemperature(name) {
  const tempMatch = name.match(/(\d+)[°\s]?[fF]/);
  return tempMatch ? parseInt(tempMatch[1]) : 0;
}

// Enhanced filter functions with category-specific logic
const enhancedFilterFunctions = {
  ...filterFunctions,
  // Tent filters
  "2-person": (product) => extractCapacity(product.NameWithoutBrand || product.Name) === 2,
  "3-person": (product) => extractCapacity(product.NameWithoutBrand || product.Name) === 3,
  "4-person": (product) => extractCapacity(product.NameWithoutBrand || product.Name) >= 4,
  "tent-3-season": (product) => (product.NameWithoutBrand || product.Name).toLowerCase().includes("3-season"),
  "4-season": (product) => (product.NameWithoutBrand || product.Name).toLowerCase().includes("4-season"),
  
  // Backpack filters
  "daypack": (product) => {
    const capacity = extractCapacity(product.NameWithoutBrand || product.Name);
    return capacity > 0 && capacity < 30;
  },
  "weekend": (product) => {
    const capacity = extractCapacity(product.NameWithoutBrand || product.Name);
    return capacity >= 30 && capacity <= 50;
  },
  "multiday": (product) => {
    const capacity = extractCapacity(product.NameWithoutBrand || product.Name);
    return capacity > 50;
  },
  "internal-frame": (product) => (product.NameWithoutBrand || product.Name).toLowerCase().includes("internal"),
  "external-frame": (product) => (product.NameWithoutBrand || product.Name).toLowerCase().includes("external"),
  
  // Sleeping bag filters
  "summer": (product) => {
    const temp = extractTemperature(product.NameWithoutBrand || product.Name);
    return temp >= 30;
  },
  "bag-3-season": (product) => {
    const temp = extractTemperature(product.NameWithoutBrand || product.Name);
    return temp >= 15 && temp < 30;
  },
  "winter": (product) => {
    const temp = extractTemperature(product.NameWithoutBrand || product.Name);
    return temp < 15;
  },
  "down": (product) => (product.NameWithoutBrand || product.Name).toLowerCase().includes("down"),
  "synthetic": (product) => (product.NameWithoutBrand || product.Name).toLowerCase().includes("synthetic"),
  
  // Hammock filters
  "single": (product) => (product.NameWithoutBrand || product.Name).toLowerCase().includes("single"),
  "double": (product) => (product.NameWithoutBrand || product.Name).toLowerCase().includes("double"),
  "with-bugnet": (product) => (product.NameWithoutBrand || product.Name).toLowerCase().includes("bug"),
  "without-bugnet": (product) => !(product.NameWithoutBrand || product.Name).toLowerCase().includes("bug")
};

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
    this.filteredProducts = [];
    this.currentSort = "default";
    this.currentFilter = "all";
    this.currentView = "grid";
    this.categoryFilter = "all";
    this.init();
  }

  async init() {
    // Load products
    this.products = await this.dataSource.getData(this.category);
    this.filteredProducts = [...this.products];
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Add category-specific options
    this.addCategorySpecificOptions();
    
    // Initial render
    this.renderList();
    this.updateStats();
    
    // Update page title
    this.updatePageTitle();
  }

  addCategorySpecificOptions() {
    const categoryOptions = categorySpecificOptions[this.category];
    if (!categoryOptions) return;

    // Add category-specific sort options
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect && categoryOptions.sortOptions) {
      const defaultOption = sortSelect.querySelector("option[value=\"default\"]");
      if (defaultOption) {
        categoryOptions.sortOptions.forEach(option => {
          const optionElement = document.createElement("option");
          optionElement.value = option.value;
          optionElement.textContent = option.label;
          sortSelect.insertBefore(optionElement, defaultOption.nextSibling);
        });
      }
    }

    // Add category-specific filter dropdown
    const filterControls = document.querySelector(".filter-controls");
    if (filterControls && categoryOptions.filterOptions) {
      const categoryFilterDiv = document.createElement("div");
      categoryFilterDiv.className = "filter-controls";
      
      const label = document.createElement("label");
      label.htmlFor = "category-filter";
      label.textContent = `${this.category.charAt(0).toUpperCase() + this.category.slice(1)} Type:`;
      
      const select = document.createElement("select");
      select.id = "category-filter";
      select.className = "filter-dropdown";
      
      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.textContent = `All ${this.category}`;
      select.appendChild(allOption);
      
      categoryOptions.filterOptions.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
      });
      
      categoryFilterDiv.appendChild(label);
      categoryFilterDiv.appendChild(select);
      
      // Insert after price filter
      const priceFilterDiv = filterControls.parentNode;
      priceFilterDiv.insertBefore(categoryFilterDiv, filterControls.nextSibling);
      
      // Add event listener
      select.addEventListener("change", (e) => {
        this.categoryFilter = e.target.value;
        this.applySortAndFilter();
      });
    }
  }

  setupEventListeners() {
    // Sort dropdown
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.applySortAndFilter();
      });
    }

    // Filter dropdown
    const filterSelect = document.getElementById("price-filter");
    if (filterSelect) {
      filterSelect.addEventListener("change", (e) => {
        this.currentFilter = e.target.value;
        this.applySortAndFilter();
      });
    }

    // View buttons
    const gridBtn = document.getElementById("grid-view");
    const listBtn = document.getElementById("list-view");
    
    if (gridBtn) {
      gridBtn.addEventListener("click", () => {
        this.setViewMode("grid");
      });
    }
    
    if (listBtn) {
      listBtn.addEventListener("click", () => {
        this.setViewMode("list");
      });
    }
  }

  applySortAndFilter() {
    // Apply price filter
    let filtered = this.products.filter(filterFunctions[this.currentFilter]);
    
    // Apply category-specific filter
    if (this.categoryFilter !== "all") {
      filtered = filtered.filter(enhancedFilterFunctions[this.categoryFilter]);
    }
    
    this.filteredProducts = filtered;
    
    // Apply sort
    const sortFunction = enhancedSortFunctions[this.currentSort] || sortFunctions[this.currentSort];
    this.filteredProducts.sort(sortFunction);
    
    // Re-render
    this.renderList();
    this.updateStats();
  }

  setViewMode(mode) {
    this.currentView = mode;
    
    // Update button states
    const gridBtn = document.getElementById("grid-view");
    const listBtn = document.getElementById("list-view");
    const productList = document.getElementById("product-list");
    
    if (gridBtn && listBtn && productList) {
      gridBtn.classList.toggle("active", mode === "grid");
      listBtn.classList.toggle("active", mode === "list");
      productList.classList.toggle("list-view", mode === "list");
    }
    
    // Re-render with new view mode
    this.renderList();
  }

  renderList() {
    // Clear existing content
    this.listElement.innerHTML = "";
    
    // Render each product with current view mode
    this.filteredProducts.forEach(product => {
      const productElement = document.createElement("li");
      productElement.innerHTML = productCardTemplate(product, this.currentView);
      this.listElement.appendChild(productElement.firstElementChild);
    });
  }

  updateStats() {
    const productCount = document.getElementById("product-count");
    const activeFilters = document.getElementById("active-filters");
    
    if (productCount) {
      productCount.textContent = `${this.filteredProducts.length} product${this.filteredProducts.length !== 1 ? "s" : ""}`;
    }
    
    if (activeFilters) {
      const filters = [];
      if (this.currentFilter !== "all") {
        const filterSelect = document.getElementById("price-filter");
        const selectedOption = filterSelect?.options[filterSelect.selectedIndex];
        filters.push(selectedOption?.text || this.currentFilter);
      }
      if (this.currentSort !== "default") {
        const sortSelect = document.getElementById("sort-select");
        const selectedOption = sortSelect?.options[sortSelect.selectedIndex];
        filters.push(selectedOption?.text || this.currentSort);
      }
      if (this.categoryFilter !== "all") {
        const categoryFilterSelect = document.getElementById("category-filter");
        const selectedOption = categoryFilterSelect?.options[categoryFilterSelect.selectedIndex];
        filters.push(selectedOption?.text || this.categoryFilter);
      }
      
      activeFilters.textContent = filters.length > 0 ? `Filtered by: ${filters.join(", ")}` : "";
    }
  }

  updatePageTitle() {
    const titleElement = document.querySelector(".products h2");
    if (titleElement && this.category) {
      titleElement.textContent = `Top Products: ${this.category.charAt(0).toUpperCase() + this.category.slice(1)}`;
    }
  }
} 
