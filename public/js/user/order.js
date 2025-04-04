console.log('order js loaded');

const viewOrderBtn = document.querySelectorAll('.btn-view-order');
viewOrderBtn.forEach(el =>
  el.addEventListener('click', function (e) {
    const orderId = this.dataset.orderId;
    window.location.href = `/order/${orderId}`;
  })
);
