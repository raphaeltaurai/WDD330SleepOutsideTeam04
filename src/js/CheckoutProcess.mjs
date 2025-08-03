import { getLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key);
    this.calculateItemSubTotal();
  }

  calculateItemSubTotal() {
    // calculate and display the total dollar amount of the items in the cart, and the number of items.
    this.itemTotal = this.list.reduce((sum, item) => sum + parseFloat(item.FinalPrice), 0);
    
    // Display the subtotal
    const subtotalElement = document.querySelector(`${this.outputSelector} #subtotal`);
    if (subtotalElement) {
      subtotalElement.innerText = `$${this.itemTotal.toFixed(2)}`;
    }
  }

  calculateOrderTotal() {
    // calculate the tax and shipping amounts. Add those to the cart total to figure out the order total
    this.tax = (this.itemTotal * 0.06);
    this.shipping = this.list.length > 0 ? 10 + (this.list.length - 1) * 2 : 0; // $10 for first item + $2 for each additional
    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    // display the totals.
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    // once the totals are all calculated display them in the order summary page
    const tax = document.querySelector(`${this.outputSelector} #tax`);
    const shipping = document.querySelector(`${this.outputSelector} #shipping`);
    const orderTotal = document.querySelector(`${this.outputSelector} #order-total`);

    if (tax) {
      tax.innerText = `$${this.tax.toFixed(2)}`;
    }
    
    if (shipping) {
      shipping.innerText = `$${this.shipping.toFixed(2)}`;
    }
    
    if (orderTotal) {
      orderTotal.innerText = `$${this.orderTotal.toFixed(2)}`;
    }
  }

  // takes the items currently stored in the cart (localstorage) and returns them in a simplified form.
  packageItems(items) {
    // convert the list of products from localStorage to the simpler form required for the checkout process.
    // An Array.map would be perfect for this process.
    return items.map(item => ({
      id: item.Id,
      name: item.Name,
      price: parseFloat(item.FinalPrice),
      quantity: 1
    }));
  }

  // takes a form element and returns an object where the key is the "name" of the form input.
  formDataToJSON(formElement) {
    const formData = new FormData(formElement),
      convertedJSON = {};

    formData.forEach(function (value, key) {
      convertedJSON[key] = value;
    });

    return convertedJSON;
  }

  async checkout(form) {
    // get the form element data by the form name
    // convert the form data to a JSON order object using the formDataToJSON function
    // populate the JSON order object with the order Date, orderTotal, tax, shipping, and list of items
    // call the checkout method in the ExternalServices module and send it the JSON order data.
    
    try {
      // Convert form data to JSON
      const formData = this.formDataToJSON(form);
      
      // Package items for checkout
      const packagedItems = this.packageItems(this.list);
      
      // Create the order object with required format
      const orderData = {
        orderDate: new Date().toISOString(),
        fname: formData.fname,
        lname: formData.lname,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        cardNumber: formData.cardNumber,
        expiration: formData.expiration,
        code: formData.code,
        items: packagedItems,
        orderTotal: this.orderTotal.toFixed(2),
        shipping: this.shipping,
        tax: this.tax.toFixed(2)
      };

      // Call the checkout method in ExternalServices
      const externalServices = new ExternalServices();
      const result = await externalServices.checkout(orderData);
      
      return result;
    } catch (error) {
      console.error("Error in checkout process:", error);
      
      // Handle the custom error object from ExternalServices
      if (error.name === "servicesError") {
        throw error; // Re-throw the custom error object
      } else {
        throw new Error(`Checkout failed: ${error.message}`);
      }
    }
  }
}
