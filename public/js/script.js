let menu = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navbar");

if (menu && navbar) {
  menu.onclick = () => {
    navbar.classList.toggle("active");
  };

  window.onscroll = () => {
    navbar.classList.remove("active");
  };
}

let submenu = document.getElementById("subwrap");
function toggleprofile() {
  submenu?.classList.toggle("open-menu");
}

let stars = document.getElementsByClassName("star");
let output = document.getElementById("output");
const ratingClasses = ["one", "two", "three", "four", "five"];

// Funtion to update rating
function rating(n) {
  remove();
  for (let i = 0; i < n; i++) {
    stars[i].className = "star " + ratingClasses[n - 1];
  }
  output.innerText = "Rating : \n" + n + "/5";
}

// To remove the pre-applied styling
function remove() {
  for (let i = 0; i < 5; i++) {
    stars[i].className = "star";
  }
}

//cart
let carticon = document.querySelector("#nav-cart");
let cart = document.querySelector(".cart");
let cartclose = document.querySelector("#close-cart");
let cartContent = document.querySelector(".cart-content");

// Pages without a cart (e.g. About) only use the navbar and profile menu
if (carticon && cart && cartclose && cartContent) {
  carticon.onclick = () => {
    cart.classList.add("active");
  };

  cartclose.onclick = () => {
    cart.classList.remove("active");
  };

  document.querySelectorAll(".bx-cart1").forEach((cartIcon) => {
    cartIcon.addEventListener("click", () => {
      const boxElement = cartIcon.closest(".box");
      const title = boxElement.querySelector(".product-title").textContent.trim();
      const price = boxElement.querySelector(".product-price").textContent.trim();
      const img = boxElement.querySelector(".box-img").children[0].src;

      addProductToCart(title, price, img);
    });
  });

  loadCartItems();
}

function addproduct(val) {
  const boxElement = document.getElementById(val).closest(".preview");
  const title = boxElement.querySelector(".product-title").textContent.trim();
  const price = boxElement.querySelector(".product-price").textContent.trim();
  const img = boxElement.querySelector(".preview-img").src;

  addProductToCart(title, price, img);
}

function removeCartItem(event) {
  event.target.closest(".cart-box").remove();
  cartChanged();
}

//Quantity changes
function quantityChanged(event) {
  const input = event.target;
  const quantity = parseInt(input.value, 10);
  input.value = Number.isInteger(quantity) && quantity > 0 ? Math.min(quantity, 20) : 1;
  cartChanged();
}

// Adds one cart row; returns false if the product is already in the cart
function renderCartItem(title, price, img, quantity) {
  const existing = cartContent.getElementsByClassName("cart-product-title");
  for (let i = 0; i < existing.length; i++) {
    if (existing[i].textContent.toLowerCase() === title.toLowerCase()) {
      return false;
    }
  }

  const cartShopBox = document.createElement("div");
  cartShopBox.classList.add("cart-box");
  cartShopBox.innerHTML = `
                      <img alt="" class="cart-img">
                      <div class="detail-box">
                      <div class="cart-product-title"></div>
                      <div class="cart-price"><i class='bx bx-rupee' style="color: green;"></i><span class="cart-price-value"></span></div>
                      <input type="number" min="1" max="20" class="cart-quantity">
                      </div>
                      <ion-icon name="trash" class="cart-remove"></ion-icon>
                      `;
  cartShopBox.querySelector(".cart-img").src = img;
  cartShopBox.querySelector(".cart-product-title").textContent = title;
  cartShopBox.querySelector(".cart-price-value").textContent = price;
  cartShopBox.querySelector(".cart-quantity").value = quantity;
  cartShopBox.querySelector(".cart-remove").addEventListener("click", removeCartItem);
  cartShopBox.querySelector(".cart-quantity").addEventListener("change", quantityChanged);
  cartContent.append(cartShopBox);
  return true;
}

function addProductToCart(title, price, img) {
  if (!renderCartItem(title, price, img, 1)) {
    alert("You have already added this product to Cart");
    return;
  }
  cartChanged();
}

function cartChanged() {
  updateTotal();
  updateCartIcon();
  saveCartItems();
}

//update total
function updateTotal() {
  let total = 0;
  for (const cartbox of cartContent.getElementsByClassName("cart-box")) {
    const price = parseFloat(cartbox.querySelector(".cart-price-value").textContent);
    const quantity = parseInt(cartbox.querySelector(".cart-quantity").value, 10);
    total += price * quantity;
  }
  total = Math.round(total * 100) / 100;
  document.getElementsByClassName("totalprice")[0].innerText = " Rs." + total;
}

//save cart items
function saveCartItems() {
  const cartItems = [];
  for (const cartbox of cartContent.getElementsByClassName("cart-box")) {
    cartItems.push({
      title: cartbox.querySelector(".cart-product-title").textContent,
      price: cartbox.querySelector(".cart-price-value").textContent,
      quantity: parseInt(cartbox.querySelector(".cart-quantity").value, 10),
      productImg: cartbox.querySelector(".cart-img").src,
    });
  }
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

// Loads saved cart without re-saving it, so stored quantities are preserved
function loadCartItems() {
  let cartItems = [];
  try {
    cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  } catch (e) {
    localStorage.removeItem("cartItems");
  }
  for (const item of cartItems) {
    renderCartItem(item.title, item.price, item.productImg, item.quantity);
  }
  updateTotal();
  updateCartIcon();
}

// Quantity in cart Icon
function updateCartIcon() {
  let quantity = 0;
  for (const cartbox of cartContent.getElementsByClassName("cart-box")) {
    quantity += parseInt(cartbox.querySelector(".cart-quantity").value, 10);
  }
  carticon.setAttribute("data-quantity", quantity);
}
