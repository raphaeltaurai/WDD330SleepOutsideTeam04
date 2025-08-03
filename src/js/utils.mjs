// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// get a parameter from the URL
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// Render a list of items using a template function
export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = false) {
  if (clear) {
    parentElement.innerHTML = "";
  }
  const htmlStrings = list.map(templateFn).join("");
  parentElement.insertAdjacentHTML(position, htmlStrings);
}

// Render a single template into a parent element
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

// Load an HTML template from a path
export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

// Load header and footer partials into the page
export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");
  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");
  renderWithTemplate(headerTemplate, headerElement);
  renderWithTemplate(footerTemplate, footerElement);
}

// Create and display a custom alert message
export function alertMessage(message, scroll = true) {
  // create element to hold the alert
  const alert = document.createElement("div");
  // add a class to style the alert
  alert.classList.add("alert");
  // set the contents. You should have a message and an X or something the user can click on to remove
  alert.innerHTML = `
    <span class="alert-message">${message}</span>
    <button class="alert-close" aria-label="Close alert">×</button>
  `;

  // add the alert to the top of main
  const mainContainer = document.querySelector("main");
  mainContainer.prepend(alert);

  // add a listener to the alert to see if they clicked on the X
  // if they did then remove the child
  alert.addEventListener("click", function(e) {
    if (e.target.tagName === "BUTTON" || e.target.classList.contains("alert-close")) {
      if (mainContainer && mainContainer.contains(this)) {
        mainContainer.removeChild(this);
      }
    }
  });
  
  // make sure they see the alert by scrolling to the top of the window
  // you may not always want to do this...so default to scroll=true, but allow it to be passed in and overridden.
  if (scroll) {
    window.scrollTo(0, 0);
  }
}
