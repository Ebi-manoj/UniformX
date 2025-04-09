import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
