export function orderConfirmationTemplate(
  customerName: string,
  orderId: string,
  publicOrderUrl: string
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