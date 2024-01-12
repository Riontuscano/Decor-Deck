let menu = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navbar");

menu.onclick = () => {
  navbar.classList.toggle("active");
};

window.onscroll = () => {
  navbar.classList.remove("active");
};
function change1() {
  document.getElementById("cred").style.display = "block";
}
function change2() {
  document.getElementById("cred").style.display = "none";
}
let stars = document.getElementsByClassName("star");
let output = document.getElementById("output");

// Funtion to update rating
function rating(n) {
  remove();
  for (let i = 0; i < n; i++) {
    if (n == 1) cls = "one";
    else if (n == 2) cls = "two";
    else if (n == 3) cls = "three";
    else if (n == 4) cls = "four";
    else if (n == 5) cls = "five";
    stars[i].className = "star " + cls;
  }
  output.innerText = "Rating : \n" + n + "/5";
}

// To remove the pre-applied styling
function remove() {
  let i = 0;
  while (i < 5) {
    stars[i].className = "star";
    i++;
  }
}
//cart
let carticon = document.querySelector("#nav-cart");
let cart = document.querySelector(".addtocart");
let cartclose = document.querySelector("#close-cart");

carticon.onclick = () => {
  cart.classList.add("active");
};

cartclose.onclick = () => {
  cart.classList.remove("active");
};

//cart working

if (document.readyState == "Loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

//making function
function ready() {
  //remove items from cart
  var removeCartButtons = document.getElementsByClassName("cart-remove");
  for (var i = 0; i < removeCartButtons.length; i++) {
    var button = removeCartButtons[i];
    button.addEventListener("click", removeCartItem);
  }
  var quantityInputs = document.getElementsByClassName("cart-quantity");
  for (var i = 0; i < quantityInputs.length; ++i) {
    var input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }
  // add to cart
    // var addtoCart=document.getElementsByClassName("bx-cart");
    // for (var i = 0; i < addtoCart.length; ++i) {
    //   var button = addtoCart[i];
    //   button.addEventListener("click", addCartClicked);
    // }
  // Buy Button
  var buybtn=document.getElementById("cartbtn");
  buybtn.addEventListener("click",buybtnClicked);
}

function removeCartItem(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.remove();
  updateTotal();
}
//Quantity changes
function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateTotal();
}

//add to cart
const cartIcons = document.querySelectorAll(".bx-cart1");

cartIcons.forEach((cartIcon) => {
  cartIcon.addEventListener("click", () => {
    const boxElement = cartIcon.closest(".box");

    const Title = boxElement.querySelector(".product-title").textContent;

    const price1 = boxElement.querySelector(".product-price").textContent;

    const productparent = boxElement.querySelector(".box-img");

    const productimg = productparent.children;

    const img = productimg[0].src;

    // console.log("Product title:", productTitle.textContent);
    // console.log("Product price:", productprice.textContent);
    // console.log("Product img:", productimg[0].src);
    addProductToCart(Title, price1, img);
    updateTotal();
  });
});

function addProductToCart(Title, price, img) {
  var cartShopBox = document.createElement("div");
  cartShopBox.classList.add('addtocart-box');
  var cartItems = document.getElementsByClassName("addtocart-content")[0];
  var cartItemsNames = cartItems.getElementsByClassName("addtocart-product-title");
  console.log(cartItemsNames[0],Title);
  for (var i = 0; i < cartItemsNames.length; i++) {
    if (cartItemsNames[i].textContent.toLowerCase() === Title.toLowerCase()) {
      alert("You have already added this product to Cart");
      return;
    }
  }
  var cartBoxContent = `
                      <img src="${img}" alt="" class="addtocart-img">
                      <div class="detail-box">
                      <div class="addtocart-product-title">${Title}</div>
                      <div class="addtocart-price"><i class='bx bx-rupee' style="color: green;"></i>${price}</div>
                      <input type="number" value="1" class="cart-quantity">
                      </div>
                      <ion-icon name="trash" class="cart-remove"></ion-icon>
                      `;

cartShopBox.innerHTML = cartBoxContent;
cartItems.append(cartShopBox);
cartShopBox
  .getElementsByClassName("cart-remove")[0]
  .addEventListener("click", removeCartItem);
cartShopBox
  .getElementsByClassName("cart-quantity")[0]
  .addEventListener("change", quantityChanged);
  // updateTotal();
}

//buy btn def

function buybtnClicked(){
  alert("Your order has been placed!!")
  var cartContent = document.getElementsByClassName("addtocart-content")[0];
  while (cartContent.hasChildNodes()) {
    cartContent.removeChild(cartContent.firstChild);
}
updateTotal();
}
//update total
function updateTotal() {
  var cartContent = document.getElementsByClassName("addtocart-content")[0];
  var cartBoxes = cartContent.getElementsByClassName("addtocart-box");
  var total = 0;
  //   console.log(cartBoxes.length);
  for (var i = 0; i < cartBoxes.length; i++) {
    var cartbox = cartBoxes[i];
    var priceElement = cartbox.getElementsByClassName("addtocart-price")[0];
    var qauntityElement = cartbox.getElementsByClassName("cart-quantity")[0];
    var price = parseFloat(priceElement.innerText.replace("Rs.", ""));
    var qauntity = qauntityElement.value;
    total = total + price * qauntity;
    // console.log(total);
  }
    total = Math.round(total * 100) / 100;
    document.getElementsByClassName("totalprice")[0].innerText = "Rs." + total;
 
}
