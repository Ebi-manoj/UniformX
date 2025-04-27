import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoiceHTML = order => {
  const logo = fs.readFileSync(
    path.join(__dirname, '../public/images/logo.png'),
    'base64'
  );
  const imageTag = `<img src="data:image/png;base64,${logo}" class="watermark" alt="Logo" />`;
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Invoice</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          font-size: 14px;
          border: 3px solid black;
          height: auto;
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        table, th, td {
          border: 1px solid black;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
        .right {
          text-align: right;
        }
        .bottom-box {
          display: flex;
        }
        .totals {
          width: fit-content;
          display: flex;
          flex-direction: column;
          margin: 1rem 0 0 auto;
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20%;
          opacity: 0.2;
          transform: translate(-50%, -50%);
        }
      </style>
    </head>
    <body>
      <h1>Order Invoice</h1>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

      <h3>Shipping Address</h3>
      <p>
        ${order.shippingAddress.name}<br />
        ${order.shippingAddress.street_address}<br />
        ${order.shippingAddress.district}, ${order.shippingAddress.state}<br />
        ${order.shippingAddress.pincode}<br />
        Mobile: ${order.shippingAddress.mobile}
      </p>

      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              item => `
                <tr>
                  <td>${item.title || 'Product'}</td>
                  <td>${item.size || '-'}</td>
                  <td>${item.quantity}</td>
                  <td>Rs ${item.price.toFixed(2)}</td>
                  <td>Rs ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>

      <div class="totals">
        <p><strong>Subtotal:</strong> Rs ${order.subtotal.toFixed(2)}</p>
        <p><strong>Tax:</strong> Rs ${order.taxAmount.toFixed(2)}</p>
        <p><strong>Shipping:</strong> Rs ${order.shippingCost.toFixed(2)}</p>
        ${
          order.discount > 0
            ? `<p><strong>Discount:</strong> -Rs ${order.discount.toFixed(
                2
              )}</p>`
            : ''
        }
        <p><strong>Total Amount:</strong> Rs ${order.totalAmount.toFixed(2)}</p>
      </div>
     
         ${imageTag} 
          
    
    </body>
    </html>
  `;
};

export const generateSalesReportHTML = (
  metrics,
  orders,
  dateRange,
  filterType
) => {
  let logo = '';
  const imageTag = logo
    ? `<img src="data:image/png;base64,${logo}" class="watermark" alt="Logo" />`
    : '';

  const reportTitle =
    filterType === 'custom'
      ? `Sales Report (${dateRange.start} to ${dateRange.end})`
      : `${
          filterType.charAt(0).toUpperCase() + filterType.slice(1)
        } Sales Report`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${reportTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          font-size: 14px;
          border: 3px solid black;
          height: auto;
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        h3 {
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        table, th, td {
          border: 1px solid black;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
        .summary {
          margin-bottom: 20px;
        }
        .summary p {
          margin: 5px 0;
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20%;
          opacity: 0.2;
          transform: translate(-50%, -50%);
        }
      </style>
    </head>
    <body>
      <h1>${reportTitle}</h1>
      <p><strong>Generated on:</strong> ${moment().format('YYYY-MM-DD')}</p>
      <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Orders:</strong> ${metrics.totalOrders}</p>
        <p><strong>Total Revenue:</strong> Rs ${metrics.totalRevenue.toFixed(
          2
        )}</p>
        <p><strong>Total Discount:</strong> Rs ${metrics.totalDiscount.toFixed(
          2
        )}</p>
        <p><strong>Coupon Discount:</strong> Rs ${metrics.totalCouponDiscount.toFixed(
          2
        )}</p>
      </div>
      <h3>Order Details</h3>
      <table>
        <thead>
          <tr>
            <th>Order No.</th>
            <th>User</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Discount</th>
            <th>Coupon Discount</th>
            <th>Final Amount</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              order => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.user}</td>
                  <td>${order.date}</td>
                  <td>Rs ${order.totalAmount.toFixed(2)}</td>
                  <td>Rs ${order.discount.toFixed(2)}</td>
                  <td>Rs ${order.couponDiscount.toFixed(2)}</td>
                  <td>Rs ${order.finalAmount.toFixed(2)}</td>
                  <td>${order.paymentMethod}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
      ${imageTag}
    </body>
    </html>
  `;
};
