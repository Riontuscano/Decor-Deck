// import { createAuth0Client } from '@auth0/auth0-spa-js';

let menu = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navbar");

menu.onclick = () => {
  navbar.classList.toggle("active");
};

window.onscroll = () => {
  navbar.classList.remove("active");
};
let submenu = document.getElementById("subwrap");
function toggleprofile(){
    submenu.classList.toggle("open-menu");
}
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
  updateCartIcon();
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

    
    addProductToCart(Title, price1, img);
    updateTotal();
    updateCartIcon();
    saveCartItems();
  });
});

function addproduct(val){
    const boxElement = document.getElementById(val).closest(".preview");

    const Title = boxElement.querySelector(".product-title").textContent;

    const price1 = boxElement.querySelector(".product-price").textContent;

    const productparent = boxElement.querySelector(".preview-img");

    const img = productparent.src;

   addProductToCart(Title, price1, img);
    updateTotal();
    updateCartIcon();
    saveCartItems();
}

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
  // alert("Your order has been placed!!")
  var cartContent = document.getElementsByClassName("cart-content")[0];
  while (cartContent.hasChildNodes()) {
    cartContent.removeChild(cartContent.firstChild);
}
// localStorage.clear();
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
    var quantityElement = cartbox.getElementsByClassName("cart-quantity")[0];
    var img = cartbox.getElementsByClassName("cart-img")[0];
    var item = {
      title :  cartItemTitle.innerText,
      price :  priceElement.innerText,
      quantity: quantityElement.value,
      productImg:img.src,
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
      addProductToCart(items.title, items.price, items.productImg);

      var cartBoxes =document.getElementsByClassName('cart-box');
      var cartbox = cartBoxes[cartBoxes.length-1];
      var qauntityElement = cartbox.getElementsByClassName('cart-quantity')[0];
      qauntityElement.value = items.quantity;
      updateCartIcon();
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


function clearcart() {
  var cartContent = document.getElementsByClassName("cart-content")[0];
  cartContent.innerHTML = '';
  updateTotal();
  localStorage.removeItem('cartItems');
  
}



// shop section
// Sample data for products

const product=[
 chairs = [
  { name: 'Pink Lawn Chair', imgSrc: './img/chair5.jpg', price: 5999, rating: 5 },
  { name: 'Grey Chair', imgSrc: './img/chair2.jpg', price: 3499, rating: 4.5 },
  { name: 'Massage Chair', imgSrc: './img/chair3.jpg', price: 19999, rating: 5 },
  { name: 'Sofa Chair', imgSrc: './img/chair4.webp', price: 14999, rating: 4 },
  { name: 'Orange Cushion Chair', imgSrc: './img/chair1.jpg', price: 6999, rating: 4.5 },
  { name: 'Gaming Chair', imgSrc: './img/chair6.webp', price: 12999, rating: 4.5 },
],
 sofa =[
  { name: "Cozy Blissful Sofa", imgSrc: "./img/sofa1.png", price: 17999, rating: 4.5 },
  { name: "Velvet Dream Sofa", imgSrc: "./img/sofa2.png", price: 25499, rating: 4 },
  { name: "Luxury Comfort Sofa", imgSrc: "./img/sofa3.png", price: 26999, rating: 5 },
  { name: "Elegant Harmony Sofa", imgSrc: "./img/sofa4.png", price: 28999, rating: 4 },
  { name: "Soothing Serenity Sofa", imgSrc: "./img/sofa5.png", price: 19999, rating: 4.5 },
  { name: "Modern Zenith Sofa", imgSrc: "./img/sofa6.png", price: 21999, rating: 5 }
],
 table = [
  { name: "Elegant Oak Table", imgSrc: "./img/table1.png", price: 3499, rating: 5 },
  { name: "Rustic Pine Table", imgSrc: "./img/table2.png", price: 2299, rating:  4.5},
  { name: "Contemporary Glass Table", imgSrc: "./img/table3.png", price: 5799, rating: 5 },
  { name: "Vintage Mahogany Table", imgSrc: "./img/table4.png", price: 4599, rating: 4.5 },
  { name: "Modern Marble Table", imgSrc: "./img/table5.png", price: 6899, rating: 4 },
  { name: "Industrial Metal Table", imgSrc: "./img/table6.png", price: 7999, rating: 4 }
]
]
// console.log(product[0])

// Function to create HTML for a product
function createProductHTML(product) {
  return `
    <div class="box">
      <div class="box-img">
        <img src="${product.imgSrc}" alt="${product.name}" class="product-img">
      </div>
      <div class="title-price">
        <h3 class="product-title">${product.name}</h3>
        <div class="stars">
          ${getRatingStars(product.rating)}
        </div>
      </div>
      <i class='bx bx-rupee' style="color: green;"></i>
      <span class="product-price">${product.price}</span>
      <div class="bx-cart1">
        <i class='bx bx-cart' id="${product.name}"></i>
      </div>
    </div>
  `;
}

// Function to get star icons based on rating
function getRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0 ? 1 : 0;
  
  const starIcons = Array.from({ length: fullStars + halfStar }, (_, index) => {
    const isHalf = index === fullStars && halfStar === 1;
    return `<ion-icon name="${isHalf ? 'star-half' : 'star'}" class="bx"></ion-icon>`;
  });

  return starIcons.join('');
}
function change(num){
  if(num==1){
    const shopContainer =  document.getElementsByClassName("shop-container");
  var products = product[0]
  products.forEach((product) => {
    const productHTML = createProductHTML(product);
    // console.log(productHTML);
    shopContainer.innerHTML += productHTML;
  });
  }
  if(num==2){
    const shopContainer =  document.getElementsByClassName("shop-container");
    var products = product[1]
    products.forEach((product) => {
      const productHTML = createProductHTML(product);x=
      shopContainer.innerHTML += productHTML;
    });
  }
  if(num==3){
    const shopContainer =  document.getElementsByClassName("shop-container");
    var products = product[2]
    products.forEach((product) => {
      const productHTML = createProductHTML(product);
      // console.log(productHTML);
      shopContainer.innerHTML += productHTML;
    });
  }
}



// // Call the function to add products when the page loads
// window.onload = addProductsToShopContainer;
