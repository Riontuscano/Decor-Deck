const payBtn = document.querySelector('.cart-btn');
payBtn.addEventListener('click', () => {
  console.log(JSON.parse(localStorage.getItem('cartItems')));
  fetch('/https://decor-deck.onrender.com/stripe-checkout', { // Update the base URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify({
      items: JSON.parse(localStorage.getItem('cartItems')),
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Invalid URL Received from the server:', data.url);
      }
      clearcart();
    })
    .catch((err) => console.error(err));
});
