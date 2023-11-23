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

function deleteComment(commentId) {
  fetch("/api/comment/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId: commentId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Refresh the page or update the comment section
        location.reload();
      } else {
        console.error(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}