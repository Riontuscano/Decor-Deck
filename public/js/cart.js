const payBtn = document.querySelector('.cart-btn');
payBtn.addEventListener('click', () => {
  fetch('/stripe-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    })
    .catch((err) => console.error(err));
});