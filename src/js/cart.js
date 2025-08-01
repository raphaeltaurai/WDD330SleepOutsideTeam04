import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { loadHeaderFooter } from "./utils.mjs";
function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  // Attach event listeners to all remove buttons
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const id = this.getAttribute("data-id");
      removeCartItem(id);
    });
  });
}

function removeCartItem(id) {
  let cartItems = getLocalStorage("so-cart") || [];
  // Remove the first item with matching Id
  const index = cartItems.findIndex((item) => String(item.Id) === String(id));
  if (index !== -1) {
    cartItems.splice(index, 1);
    setLocalStorage("so-cart", cartItems);
    renderCartContents();
  }
}

function cartItemTemplate(item) {
  const color = item.Colors && item.Colors[0] ? item.Colors[0].ColorName : "";
  
  // Handle different image structures
  let imageSrc = "";
  if (item.Images && item.Images.PrimaryMedium) {
    // Use PrimaryMedium for cart display
    imageSrc = item.Images.PrimaryMedium;
  } else if (item.Image) {
    // Fallback for local data structure
    const pathParts = item.Image.split("/");
    const subfolder = pathParts[pathParts.length - 2];
    const filename = pathParts[pathParts.length - 1];
    imageSrc = `/images/${subfolder}/${filename}`;
  }
  
  const newItem = `<li class="cart-card divider">
  <span class="remove-item" data-id="${item.Id}" title="Remove item" style="cursor:pointer;position:absolute;right:10px;top:10px;font-weight:bold;font-size:1.2em;">&times;</span>
  <a href="#" class="cart-card__image">
    <img
      src="${imageSrc}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${color}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;

  return newItem;
}

renderCartContents();
loadHeaderFooter();
