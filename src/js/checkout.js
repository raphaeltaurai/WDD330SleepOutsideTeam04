import { getLocalStorage, setLocalStorage, alertMessage } from "./utils.mjs";
import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

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

  // Initialize CheckoutProcess
  const checkoutProcess = new CheckoutProcess("so-cart", ".order-summary");
  checkoutProcess.init();
  checkoutProcess.calculateOrderTotal();
  
  // Store checkout process instance for later use
  window.checkoutProcess = checkoutProcess;
}

// Setup form validation
function setupFormValidation() {
  const form = document.getElementById("checkout-form");
  
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // Check form validity
    const chk_status = form.checkValidity();
    form.reportValidity();
    
    if (chk_status) {
      await processOrder();
    }
  });
}

// Validate all form fields
function validateForm() {
  const requiredFields = [
    "fname",
    "lname",
    "street",
    "city", 
    "state",
    "zip",
    "cardNumber",
    "expiration",
    "code"
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
    case "zip":
      if (!/^\d{5}$/.test(value)) {
        showFieldError(field, "Please enter a valid 5-digit zip code");
        return false;
      }
      break;
      
    case "cardNumber":
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
      
    case "code":
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
  const cardNumber = document.getElementById("cardNumber");
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
  const securityCode = document.getElementById("code");
  securityCode.addEventListener("input", function(e) {
    e.target.value = e.target.value.replace(/\D/g, "");
  });

  // Only allow numbers in zip code
  const zipCode = document.getElementById("zip");
  zipCode.addEventListener("input", function(e) {
    e.target.value = e.target.value.replace(/\D/g, "");
  });
}

// Process the order
async function processOrder() {
  const cartItems = getLocalStorage("so-cart") || [];
  
  if (cartItems.length === 0) {
    alertMessage("Your cart is empty!", true);
    return;
  }

  try {
    // Get the form element
    const form = document.getElementById("checkout-form");
    
    // Use CheckoutProcess to handle the checkout
    const checkoutProcess = window.checkoutProcess;
    const result = await checkoutProcess.checkout(form);
    
    // Clear the cart
    setLocalStorage("so-cart", []);
    
    // Redirect to success page
    window.location.href = "/cart/success.html";
  } catch (error) {
    console.error("Error processing order:", error);
    
    // Handle the custom error object from ExternalServices
    if (error.name === "servicesError") {
      // Display the detailed error message from the server
      const errorMessage = error.message.error || error.message.message || "Server error occurred";
      alertMessage(`Order failed: ${errorMessage}`, true);
    } else {
      alertMessage(`There was an error processing your order: ${error.message}`, true);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initCheckout); 
