const adminUrl = process.env.ADMIN_PANEL_URL || "http://localhost:3000";

export function orderConfirmationTemplate(
  customerName: string,
  orderId: string,
  publicOrderUrl: string,
) {
  return `
    <div
      style="
        max-width:640px;
        margin:0 auto;
        font-family:Arial,Helvetica,sans-serif;
        color:#111;
        padding:32px;
      "
    >

      <div
        style="
          background:#111;
          padding:28px;
          border-radius:16px;
          text-align:center;
        "
      >
        <h1
          style="
            margin:0;
            color:#fff;
            font-size:28px;
          "
        >
          Camarguette Store
        </h1>
      </div>

      <h2
        style="
          margin-top:32px;
          font-size:28px;
        "
      >
        Order Confirmed
      </h2>

      <p>
        Hi ${customerName},
      </p>

      <p>
        Thank you for your purchase.
        Your order has been successfully confirmed.
      </p>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border:1px solid #e5e5e5;
          border-radius:16px;
          background:#fafafa;
        "
      >
        <strong>Order Number</strong>

        <p style="margin-top:8px">
          #${orderId.slice(0, 8)}
        </p>
      </div>

      <a
        href="${publicOrderUrl}"
        style="
          display:inline-block;
          margin-top:24px;
          padding:14px 24px;
          background:#111;
          color:white;
          text-decoration:none;
          border-radius:12px;
          font-weight:600;
        "
      >
        View Order
      </a>

      <p style="margin-top:24px">
        Your invoice is attached as a PDF.
      </p>

      <hr
        style="
          margin:32px 0;
          border:none;
          border-top:1px solid #eee;
        "
      />

      <p
        style="
          color:#666;
          font-size:14px;
        "
      >
        Need help? Contact us at
        ${process.env.SUPPORT_EMAIL}
      </p>

    </div>
  `;
}

export function shipmentConfirmationTemplate(
  fullName: string,
  orderId: string,
  carrier: string,
  trackingNumber: string,
  orderUrl: string,
) {
  return `
    <div style="max-width:640px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#111;padding:32px;">

      <div style="background:#111;padding:28px;border-radius:16px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">
          Camarguette Store
        </h1>
      </div>

      <h2 style="margin-top:32px;font-size:28px;">
        Your Order Has Shipped
      </h2>

      <p>Hi ${fullName},</p>

      <p>
        Great news. Your order has been shipped and is now on its way.
      </p>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border:1px solid #e5e5e5;
          border-radius:16px;
          background:#fafafa;
        "
      >
        <p>
          <strong>Order Number</strong><br/>
          #${orderId.slice(0, 8)}
        </p>

        <p>
          <strong>Carrier</strong><br/>
          ${carrier}
        </p>

        <p>
          <strong>Tracking Number</strong><br/>
          ${trackingNumber}
        </p>
      </div>

      <a
        href="${orderUrl}"
        style="
          display:inline-block;
          margin-top:24px;
          padding:14px 24px;
          background:#111;
          color:#fff;
          text-decoration:none;
          border-radius:12px;
          font-weight:600;
        "
      >
        Track Order
      </a>

      <hr
        style="
          margin:32px 0;
          border:none;
          border-top:1px solid #eee;
        "
      />

      <p style="color:#666;font-size:14px;">
        Need help? Contact us at ${process.env.SUPPORT_EMAIL}
      </p>

    </div>
  `;
}

export function helpRequestTemplate(
  orderId: string,
  customerName: string,
  customerEmail: string,
  orderPhone: string | null,
  contactPhone: string | null,
  message: string,
) {
  return `
    <div style="max-width:640px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#111;padding:32px;">

      <div style="background:#111;padding:28px;border-radius:16px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">
          Camarguette Store
        </h1>
      </div>

      <h2 style="margin-top:32px;font-size:28px;">
        New Support Request
      </h2>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border:1px solid #e5e5e5;
          border-radius:16px;
          background:#fafafa;
        "
      >
        <p>
          <strong>Order Number</strong><br>
          #${orderId.slice(0, 8)}
        </p>

        <p>
          <strong>Customer</strong><br>
          ${customerName}
        </p>

        <p>
          <strong>Email</strong><br>
          ${customerEmail}
        </p>

        <p>
          <strong>Order Phone</strong><br>
          ${orderPhone || "-"}
        </p>

        <p>
          <strong>Contact Phone #2</strong><br>
          ${contactPhone || "-"}
        </p>
      </div>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border:1px solid #e5e5e5;
          border-radius:16px;
        "
      >
        <p>
          <strong>Message</strong>
        </p>

        <p style="white-space:pre-wrap;">
          ${message}
        </p>
      </div>
      <div style="margin-top:24px;">
        <a
          href="${adminUrl}/dashboard/orders/${orderId}"
          style="
            display:inline-block;
            padding:14px 24px;
            background:#111;
            color:#fff;
            text-decoration:none;
            border-radius:12px;
            font-weight:600;
          "
        >
          Open Order in Dashboard
        </a>
      </div>
    </div>
  `;
}

export function customerReplyTemplate(
  customerName: string,
  message: string,
  cancelUrl?: string,
) {
  return `
    <div
      style="
        background:#f7f7f7;
        padding:40px 20px;
        font-family:Arial, Helvetica, sans-serif;
      "
    >
      <div
        style="
          max-width:640px;
          margin:0 auto;
          background:white;
          border-radius:20px;
          overflow:hidden;
          border:1px solid #ececec;
        "
      >

        <div
          style="
            background:#111;
            padding:32px;
            text-align:center;
          "
        >
          <h1
            style="
              margin:0;
              color:white;
              font-size:28px;
              font-weight:600;
            "
          >
            Camarguette Store
          </h1>

          <p
            style="
              margin-top:10px;
              color:#bdbdbd;
              font-size:14px;
            "
          >
            Personal Support
          </p>
        </div>

        <div style="padding:40px">
          <h2
            style="
              margin:0;
              color:#111;
              font-size:24px;
            "
          >
            Hi ${customerName},
          </h2>

          <p
            style="
              margin-top:18px;
              color:#555;
              line-height:1.7;
              font-size:15px;
            "
          >
            We have personally reviewed your request
            and would like to provide an update.
          </p>

          <div
            style="
              margin-top:28px;
              padding:22px;
              background:#fafafa;
              border:1px solid #e8e8e8;
              border-radius:16px;
              color:#222;
              white-space:pre-wrap;
              line-height:1.7;
            "
          >
            ${message}
          </div>

          ${
            cancelUrl
              ? `
          <div
            style="
              margin-top:28px;
              padding:20px;
              border-radius:16px;
              background:#fff7f7;
              border:1px solid #ffd7d7;
            "
          >
            <p
              style="
                margin:0;
                color:#7f1d1d;
                line-height:1.7;
              "
            >
              If you do not agree with the proposed solution
              or prefer not to continue with your order,
              you can cancel it and request a refund using
              the link below.
            </p>

            <a
              href="${cancelUrl}"
              style="
                display:inline-block;
                margin-top:16px;
                padding:14px 22px;
                background:#dc2626;
                color:white;
                text-decoration:none;
                border-radius:12px;
                font-weight:600;
              "
            >
              Cancel Order
            </a>
          </div>
          `
              : ""
          }

          <p
            style="
              margin-top:32px;
              color:#666;
              line-height:1.7;
            "
          >
            If you need any further assistance,
            we will be happy to help.
          </p>

          <p
            style="
              margin-top:24px;
              color:#111;
              font-weight:600;
            "
          >
            The Camarguette Store Team
          </p>
        </div>

        <div
          style="
            padding:24px;
            text-align:center;
            border-top:1px solid #f1f1f1;
            color:#888;
            font-size:13px;
          "
        >
          Thank you for shopping with us.
        </div>

      </div>
    </div>
  `;
}

export function refundApprovedTemplate(customerName: string, orderUrl: string) {

  return `
    <div style="max-width:640px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#111;padding:32px;">

      <div style="background:#111;padding:28px;border-radius:16px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">
          Camarguette Store
        </h1>
      </div>

      <h2 style="margin-top:32px;font-size:28px;">
        Return Request Approved
      </h2>

      <p>
        Hi ${customerName},
      </p>

      <p>
        We have reviewed your return request and it has been approved.
      </p>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border:1px solid #e5e5e5;
          border-radius:16px;
          background:#fafafa;
        "
      >
        <h3>Next Steps</h3>

        <ol style="padding-left:20px;line-height:1.8;">
          <li>Pack the item securely.</li>
          <li>Keep your shipping receipt.</li>
          <li>
            Once shipped, update the return from your order page
            and provide the carrier and tracking number.
          </li>
        </ol>
      </div>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border:1px solid #e5e5e5;
          border-radius:16px;
          background:#fafafa;
        "
      >
        <h3>Return Address</h3>

        <p>
          Camarguette Store<br/>
          RETURN ADDRESS TO BE CONFIGURED
        </p>

        <p>
          Please include your order number inside the package.
        </p>
      </div>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border-radius:16px;
          background:#fff7ed;
          border:1px solid #fed7aa;
        "
      >
        <strong>Important Information</strong>

        <p>
          Return shipping costs are currently the responsibility of the customer.
        </p>

        <p>
          We strongly recommend using a tracked shipping service.
        </p>
      </div>

      <a
        href="${orderUrl}"
        style="
          display:inline-block;
          margin-top:24px;
          padding:14px 22px;
          background:#111;
          color:white;
          text-decoration:none;
          border-radius:12px;
          font-weight:600;
        "
      >
        View Order
      </a>

    </div>
  `;
}

export function refundRejectedTemplate(
  customerName: string,
  reason: string,
  orderUrl: string,
) {
  return `
    <div style="font-family:Arial;padding:32px;max-width:640px;margin:auto">

      <h1>Refund request rejected</h1>

      <p>
        Hello ${customerName},
      </p>

      <p>
        We have reviewed your application.
      </p>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border-radius:16px;
          background:#fff5f5;
          border:1px solid #fecaca;
        "
      >
        <strong>Reason:</strong>

        <p>
          ${reason}
        </p>
      </div>

      <p style="margin-top:20px">
        If you believe this is an error, you can reply from your order page.
      </p>

      <a
        href="${orderUrl}"
        style="
          display:inline-block;
          margin-top:20px;
          padding:14px 22px;
          background:#111;
          color:white;
          text-decoration:none;
          border-radius:12px;
        "
      >
        View Order
      </a>

    </div>
  `;
}

export function refundCompletedTemplate(
  customerName: string,
  amount: string,
  orderUrl: string,
) {
  return `
    <div style="max-width:640px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#111;padding:32px;">

      <div style="background:#111;padding:28px;border-radius:16px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">
          Camarguette Store
        </h1>
      </div>

      <h2 style="margin-top:32px;font-size:28px;">
        Refund Processed
      </h2>

      <p>
        Hi ${customerName},
      </p>

      <p>
        Your refund has been successfully processed.
      </p>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border-radius:16px;
          background:#f0fdf4;
          border:1px solid #bbf7d0;
        "
      >
        <strong>Refund Amount</strong>

        <p style="margin-top:8px;">
          ${amount}
        </p>
      </div>

      <p style="margin-top:24px;">
        Depending on your bank or payment provider,
        it may take a few business days for the refund
        to appear on your account.
      </p>

      <a
        href="${orderUrl}"
        style="
          display:inline-block;
          margin-top:24px;
          padding:14px 22px;
          background:#111;
          color:white;
          text-decoration:none;
          border-radius:12px;
          font-weight:600;
        "
      >
        View Order
      </a>

      <hr
        style="
          margin:32px 0;
          border:none;
          border-top:1px solid #eee;
        "
      />

      <p
        style="
          color:#666;
          font-size:14px;
        "
      >
        Need help? Contact us at ${process.env.SUPPORT_EMAIL}
      </p>

    </div>
  `;
}

export function abandonedCheckoutEmail1Template(
  customerName: string,
  orderUrl: string,
) {
  return `
    <div style="max-width:640px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#111;padding:32px;">

      <div style="background:#111;padding:28px;border-radius:16px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">
          Camarguette Store
        </h1>
      </div>

      <h2 style="margin-top:32px;font-size:28px;">
        Your Order Is Waiting For You
      </h2>

      <p>
        Hi ${customerName},
      </p>

      <p>
        We have saved your order so you can complete your purchase whenever you're ready.
      </p>

      <p>
        Some items may become unavailable if stock runs out.
      </p>

      <a
        href="${orderUrl}"
        style="
          display:inline-block;
          margin-top:24px;
          padding:14px 22px;
          background:#111;
          color:white;
          text-decoration:none;
          border-radius:12px;
          font-weight:600;
        "
      >
        Complete Your Order
      </a>

      <hr
        style="
          margin:32px 0;
          border:none;
          border-top:1px solid #eee;
        "
      />

      <p
        style="
          color:#666;
          font-size:14px;
        "
      >
        Need help? Contact us at ${process.env.SUPPORT_EMAIL}
      </p>

    </div>
  `;
}

export function abandonedCheckoutEmail2Template(
  customerName: string,
  orderUrl: string,
) {
  return `
    <div style="max-width:640px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#111;padding:32px;">

      <div style="background:#111;padding:28px;border-radius:16px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">
          Camarguette Store
        </h1>
      </div>

      <h2 style="margin-top:32px;font-size:28px;">
        Still Thinking About It?
      </h2>

      <p>
        Hi ${customerName},
      </p>

      <p>
        We noticed you recently started an order but didn't complete your purchase.
      </p>

      <p>
        While that reservation has now expired, many of the products may still be available.
      </p>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border:1px solid #e5e5e5;
          border-radius:16px;
          background:#fafafa;
        "
      >
        Discover new arrivals, exclusive brands and limited stock pieces before they are gone.
      </div>

      <a
        href="${orderUrl}"
        style="
          display:inline-block;
          margin-top:24px;
          padding:14px 22px;
          background:#111;
          color:white;
          text-decoration:none;
          border-radius:12px;
          font-weight:600;
        "
      >
        Return to Store
      </a>

      <hr
        style="
          margin:32px 0;
          border:none;
          border-top:1px solid #eee;
        "
      />

      <p
        style="
          color:#666;
          font-size:14px;
        "
      >
        Need help? Contact us at ${process.env.SUPPORT_EMAIL}
      </p>

    </div>
  `;
}

export function abandonedCheckoutEmail3Template(
  customerName: string,
  orderUrl: string,
) {
  return `
    <div style="max-width:640px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#111;padding:32px;">

      <div style="background:#111;padding:28px;border-radius:16px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">
          Camarguette Store
        </h1>
      </div>

      <h2 style="margin-top:32px;font-size:28px;">
        Last Chance To Discover Something Special
      </h2>

      <p>
        Hi ${customerName},
      </p>

      <p>
        A few days ago you showed interest in our collection.
      </p>

      <p>
        The order you started has expired, but many unique pieces may still be available.
      </p>

      <div
        style="
          margin-top:24px;
          padding:20px;
          border:1px solid #e5e5e5;
          border-radius:16px;
          background:#fafafa;
        "
      >
        Explore independent brands, limited releases and carefully selected products before stock changes again.
      </div>

      <a
        href="${orderUrl}"
        style="
          display:inline-block;
          margin-top:24px;
          padding:14px 22px;
          background:#111;
          color:white;
          text-decoration:none;
          border-radius:12px;
          font-weight:600;
        "
      >
        Shop Now
      </a>

      <hr
        style="
          margin:32px 0;
          border:none;
          border-top:1px solid #eee;
        "
      />

      <p
        style="
          color:#666;
          font-size:14px;
        "
      >
        Need help? Contact us at ${process.env.SUPPORT_EMAIL}
      </p>

    </div>
  `;
}
