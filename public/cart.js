document.getElementById('cartToggle').addEventListener('click', function(event) {
    event.preventDefault();
    var cart = document.querySelector('.shopping-cart');
    cart.classList.toggle('open');
  });

function calculateTotalPrice(cart) {
  let totalPrice = 0;
  cart.forEach(item => {
    if (item.price) {
      totalPrice += item.price;
    }
  });
  return totalPrice.toFixed(2); // Assuming you want to display the total with two decimal places
}