let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    navbar.classList.toggle('active');
}

window.onscroll = () => {
    navbar.classList.remove('active');
}
function change1(){
    document.getElementById('cred').style.display = 'block';
}
function change2(){
    document.getElementById('cred').style.display = 'none';
}
let stars = 
    document.getElementsByClassName("star");
let output = 
    document.getElementById("output");
 
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
    output.innerText = "Rating : \n"+ n + "/5";
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
let carticon=document.querySelector("#nav-cart");
let cart=document.querySelector(".addtocart");
let cartclose=document.querySelector("#close-cart");

carticon.onclick = () =>{
    cart.classList.add("active");
};

cartclose.onclick = () =>{
    cart.classList.remove("active");
};