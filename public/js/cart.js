const payBtn = document.querySelector('.cart-btn');
payBtn?.addEventListener('click', async () => {
  let items = [];
  try {
    items = JSON.parse(localStorage.getItem('cartItems')) || [];
  } catch (e) {
    items = [];
  }
  if (items.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  payBtn.disabled = true;
  try {
    const token = await getAuthToken();
    if (!token) {
      profilelogin();
      return;
    }

    const res = await fetch('/stripe-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: items.map(({ title, quantity }) => ({ title, quantity })),
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.url) {
      // The cart is cleared on the success page once Stripe confirms payment
      window.location.href = data.url;
      return;
    }
    if (res.status === 401) {
      profilelogin();
      return;
    }
    alert(data.error || 'Could not start checkout. Please try again.');
  } catch (err) {
    console.error(err);
    alert('Could not reach the server. Please check your connection and try again.');
  } finally {
    payBtn.disabled = false;
  }
});

// Re-enable the button when returning from Stripe via the back button (bfcache)
window.addEventListener('pageshow', () => {
  if (payBtn) payBtn.disabled = false;
});
