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
  console.log(removeCartButtons);
  for (var i = 0; i < removeCartButtons.length; i++) {
    var button = removeCartButtons[i];
    // console.log(removeCartButtons[i]);
    button.addEventListener("click", removeCartItem);
  }
  var quantityInputs = document.getElementsByClassName('cart-quantity');
//   console.log(quantityInputs);
  for (var i = 0; i < quantityInputs.length; ++i) {
    var input = quantityInputs[i];
    // console.log(input);
    input.addEventListener("change", quantityChanged);
  }
  //add to cart 
  var addtoCart=document.getElementsByClassName("addto-cart");
  for (var i = 0; i < addtoCart.length; ++i) {
    var button = addtoCart[i];
    // console.log(input);
    button.addEventListener("click", addCartClicked);
  }
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
function addCartClicked(event) {
    var button = event.target;
    var shopProducts = button.parentElement;
    var title = shopProducts.getElementsByClassName('product-title')[0].innerText;
    console.log(title);
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
    total= Math.round(total *100)/100;
    document.getElementsByClassName("totalprice")[0].innerText = "Rs."+total;
  }
}
