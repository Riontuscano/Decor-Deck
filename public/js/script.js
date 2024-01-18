// import { createAuth0Client } from '@auth0/auth0-spa-js';

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
let cart = document.querySelector(".cart");
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
  loadCartItems();
}

function removeCartItem(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.remove();
  updateTotal();
  saveCartItems();
}
//Quantity changes
function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateTotal();
  updateCartIcon();
  saveCartItems();
}

//add to cart

var cartIcons = document.querySelectorAll(".bx-cart1");

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
    updateCartIcon();
    saveCartItems();
  });
});

function addProductToCart(Title, price, img) {
  var cartShopBox = document.createElement("div");
  cartShopBox.classList.add('cart-box');
  var cartItems = document.getElementsByClassName("cart-content")[0];
  var cartItemsNames = cartItems.getElementsByClassName("cart-product-title");

  for (var i = 0; i < cartItemsNames.length; i++) {
    if (cartItemsNames[i].textContent.toLowerCase() === Title.toLowerCase()) {
      alert("You have already added this product to Cart");
      return;
    }
  }
  var cartBoxContent = `
                      <img src="${img}" alt="" class="cart-img">
                      <div class="detail-box">
                      <div class="cart-product-title">${Title}</div>
                      <div class="cart-price"><i class='bx bx-rupee' style="color: green;"></i>${price}</div>
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
  updateTotal();
  updateCartIcon();
  saveCartItems();
}

//buy btn def

function buybtnClicked(){
  alert("Your order has been placed!!")
  var cartContent = document.getElementsByClassName("cart-content")[0];
  while (cartContent.hasChildNodes()) {
    cartContent.removeChild(cartContent.firstChild);
}
localStorage.clear();
updateTotal();
updateCartIcon();
// saveCartItems();
}
//update total
function updateTotal() {
  var cartContent = document.getElementsByClassName("cart-content")[0];
  var cartBoxes = cartContent.getElementsByClassName("cart-box");
  var total = 0;
  for (var i = 0; i < cartBoxes.length; i++) {
    var cartbox = cartBoxes[i];
    var priceElement = cartbox.getElementsByClassName("cart-price")[0];
    var quantityElement = cartbox.getElementsByClassName("cart-quantity")[0];
    var price = parseFloat(priceElement.innerText.replace("Rs.", ""));
    var quantity = quantityElement.value;
    total = total + price * quantity;
  
  }
    total = Math.round(total * 100) / 100;
    document.getElementsByClassName("totalprice")[0].innerText = " Rs." + total;
    
    localStorage.setItem('cartTotal', total);
 
}


// function itemadd(item){
//   // alert("Item Add to cart ")
//   var arr=[];
//   arr = arr.push(item);
//   console.log(arr);
//   // if(!arr.includes(item)){
//   //   alert("Item Add to cart ")
//   // }
// }

//save cart items
function saveCartItems(){
  var cartContent = document.getElementsByClassName("cart-content")[0];
  var cartBoxes = cartContent.getElementsByClassName("cart-box");
  var cartItems = [];
  
  for (var i = 0; i < cartBoxes.length; i++) {
    var cartbox = cartBoxes[i];
    var cartItemTitle = cartbox.getElementsByClassName("cart-product-title")[0];
    var priceElement = cartbox.getElementsByClassName("cart-price")[0];
    var qauntityElement = cartbox.getElementsByClassName("cart-quantity")[0];
    var img = cartbox.getElementsByClassName("cart-img")[0];
    var item = {
      title :  cartItemTitle.innerText,
      price :  priceElement.innerText,
      qauntity: qauntityElement.value,
      productimg:img.src,
    };
    cartItems.push(item);
  }
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

// // Loads in cart 
function loadCartItems() {
  var cartItems = localStorage.getItem('cartItems');
  if (cartItems){
    cartItems = JSON.parse(cartItems);
    // console.log(cartItems.length);
    for(var i=0; i < cartItems.length; i++){
      var items = cartItems[i];
      // console.log(items.title, items.price,items.productimg);
      addProductToCart(items.title, items.price, items.productimg);

      // var cartBoxes =document.getElementsByClassName('cart-box');
      // var cartbox = cartBoxes[cartBoxes.length-1];
      // var qauntityElement = cartbox.getElementsByClassName('cart-quantity')[0];
      // qauntityElement.value = items.quantity;
      // updateCartIcon();
    }
  }
  var cartTotal = localStorage.getItem('cartTotal');
  // console.log(cartTotal);
  if(cartTotal){
    document.getElementsByClassName("totalprice")[0].innerText = " Rs." + cartTotal;
}

}

// Quantity in cart Icon

function updateCartIcon(){
  var cartContent = document.getElementsByClassName("cart-content")[0];
  var cartBoxes = cartContent.getElementsByClassName("cart-box");
  var quantity = 0;

  for(var i=0; i<cartBoxes.length; i++){
    var cartbox = cartBoxes[i];
    var quantityElement = cartbox.getElementsByClassName("cart-quantity")[0];
    quantity += parseInt(quantityElement.value); 
  }
  var cartIcon = document.querySelector('#nav-cart');
  cartIcon.setAttribute('data-quantity', quantity);
}