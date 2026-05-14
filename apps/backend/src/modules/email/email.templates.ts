export function orderConfirmationTemplate(
  customerName: string,
  orderId: string,
  publicOrderUrl: string,
) {
  return `
    <h2>Gracias por tu compra ${customerName} 🎉</h2>

    <p>Tu pedido ha sido confirmado.</p>

    <p>
      <strong>Número de pedido:</strong> ${orderId}
    </p>

    <p>
      Puedes ver tu pedido aquí:
      <a href="${publicOrderUrl}">
        Ver pedido
      </a>
    </p>

    <p>Adjuntamos tu factura en PDF.</p>

    <br/>

    <p>Gracias por confiar en nuestra tienda ❤️</p>
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
    <div style="font-family:Arial;padding:24px;color:#111">
      <h1>Tu pedido fue enviado 🚚</h1>

      <p>
        Hola ${fullName},
      </p>

      <p>
        Tu pedido <strong>#${orderId.slice(0, 8)}</strong>
        ya fue enviado.
      </p>

      <div style="margin-top:24px;padding:16px;border:1px solid #ddd;border-radius:12px">
        <p>
          <strong>Transportista:</strong>
          ${carrier}
        </p>

        <p>
          <strong>Tracking:</strong>
          ${trackingNumber}
        </p>
      </div>

      <a
        href="${orderUrl}"
        style="
          display:inline-block;
          margin-top:24px;
          padding:14px 20px;
          background:black;
          color:white;
          text-decoration:none;
          border-radius:10px;
        "
      >
        Ver pedido
      </a>
    </div>
  `;
}
