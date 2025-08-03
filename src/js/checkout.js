import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { loadHeaderFooter } from "./utils.mjs";

// Initialize checkout page
function initCheckout() {
  loadHeaderFooter();
  displayOrderSummary();
  setupFormValidation();
  setupInputFormatting();
}

// Display order summary with cart items and totals
function displayOrderSummary() {
  const cartItems = getLocalStorage("so-cart") || [];
  
  if (cartItems.length === 0) {
    // Redirect to cart if empty
    window.location.href = "index.html";
    return;
  }

  // Display cart items in summary
  const cartItemsContainer = document.querySelector(".cart-items-summary");
  const itemsHTML = cartItems.map(item => `
    <div class="summary-item">
      <span class="item-name">${item.Name}</span>
      <span class="item-price">$${item.FinalPrice}</span>
    </div>
  `).join("");
  
  cartItemsContainer.innerHTML = itemsHTML;

  // Calculate and display totals
  calculateAndDisplayTotals(cartItems);
}

// Calculate and display order totals
function calculateAndDisplayTotals(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.FinalPrice), 0);
  const tax = subtotal * 0.06; // 6% tax rate
  const shipping = cartItems.length > 0 ? 10 + (cartItems.length - 1) * 2 : 0; // $10 for first item + $2 for each additional
  const orderTotal = subtotal + tax + shipping;

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("shipping").textContent = `$${shipping.toFixed(2)}`;
  document.getElementById("order-total").textContent = `$${orderTotal.toFixed(2)}`;
}

// Setup form validation
function setupFormValidation() {
  const form = document.getElementById("checkout-form");
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (validateForm()) {
      processOrder();
    }
  });
}

// Validate all form fields
function validateForm() {
  const requiredFields = [
    "street-address",
    "city", 
    "state",
    "zip-code",
    "card-number",
    "expiration",
    "security-code"
  ];

  let isValid = true;

  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    
    if (!value) {
      showFieldError(field, "This field is required");
      isValid = false;
    } else if (!validateField(fieldId, value)) {
      isValid = false;
    } else {
      clearFieldError(field);
    }
  });

  return isValid;
}

// Validate individual field formats
function validateField(fieldId, value) {
  const field = document.getElementById(fieldId);
  
  switch (fieldId) {
    case "zip-code":
      if (!/^\d{5}$/.test(value)) {
        showFieldError(field, "Please enter a valid 5-digit zip code");
        return false;
      }
      break;
      
    case "card-number":
      if (!/^\d{13,19}$/.test(value.replace(/\s/g, ""))) {
        showFieldError(field, "Please enter a valid credit card number");
        return false;
      }
      break;
      
    case "expiration":
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
        showFieldError(field, "Please enter expiration date as MM/YY");
        return false;
      }
      break;
      
    case "security-code":
      if (!/^\d{3,4}$/.test(value)) {
        showFieldError(field, "Please enter a valid security code");
        return false;
      }
      break;
  }
  
  return true;
}

// Show field error message
function showFieldError(field, message) {
  clearFieldError(field);
  field.classList.add("error");
  
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

// Clear field error message
function clearFieldError(field) {
  field.classList.remove("error");
  const existingError = field.parentNode.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }
}

// Setup input formatting
function setupInputFormatting() {
  // Format credit card number with spaces
  const cardNumber = document.getElementById("card-number");
  cardNumber.addEventListener("input", function(e) {
    let value = e.target.value.replace(/\s/g, "");
    value = value.replace(/(\d{4})/g, "$1 ").trim();
    e.target.value = value;
  });

  // Format expiration date
  const expiration = document.getElementById("expiration");
  expiration.addEventListener("input", function(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    e.target.value = value;
  });

  // Only allow numbers in security code
  const securityCode = document.getElementById("security-code");
  securityCode.addEventListener("input", function(e) {
    e.target.value = e.target.value.replace(/\D/g, "");
  });

  // Only allow numbers in zip code
  const zipCode = document.getElementById("zip-code");
  zipCode.addEventListener("input", function(e) {
    e.target.value = e.target.value.replace(/\D/g, "");
  });
}

// Process the order
function processOrder() {
  const cartItems = getLocalStorage("so-cart") || [];
  
  if (cartItems.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // In a real application, you would send the order to a server
  // For this demo, we'll just clear the cart and show a success message
  
  // Clear the cart
  setLocalStorage("so-cart", []);
  
  // Show success message
  alert("Order placed successfully! Thank you for your purchase.");
  
  // Redirect to home page
  window.location.href = "/index.html";
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initCheckout); 
