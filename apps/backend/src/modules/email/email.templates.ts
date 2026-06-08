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

export function helpRequestTemplate(
  orderId: string,
  customerName: string,
  customerEmail: string,
  orderPhone: string | null,
  contactPhone: string | null,
  message: string,
) {
  return `
    <div style="font-family:Arial;padding:24px;color:#111">

      <h1>Nuevo mensaje de soporte</h1>

      <div style="margin-top:20px">

        <p>
          <strong>Pedido:</strong>
          #${orderId.slice(0, 8)}
        </p>

        <p>
          <strong>Cliente:</strong>
          ${customerName}
        </p>

        <p>
          <strong>Email:</strong>
          ${customerEmail}
        </p>

        <p>
          <strong>Teléfono pedido:</strong>
          ${orderPhone || "-"}
        </p>

        <p>
          <strong>Teléfono contacto:</strong>
          ${contactPhone || "-"}
        </p>

      </div>

      <div
        style="
          margin-top:24px;
          padding:16px;
          border:1px solid #ddd;
          border-radius:12px;
        "
      >
        <strong>Mensaje:</strong>

        <p style="white-space:pre-wrap">
          ${message}
        </p>
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
            Camarguette
          </h1>

          <p
            style="
              margin-top:10px;
              color:#bdbdbd;
              font-size:14px;
            "
          >
            Atención personalizada
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
            Hola ${customerName},
          </h2>

          <p
            style="
              margin-top:18px;
              color:#555;
              line-height:1.7;
              font-size:15px;
            "
          >
            Hemos revisado personalmente tu solicitud
            y queremos darte una respuesta.
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
              Si no estás de acuerdo con la solución propuesta
              o prefieres no continuar con el pedido, puedes
              cancelarlo y solicitar el reembolso desde el
              siguiente enlace.
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
              Cancelar pedido
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
            Si necesitas cualquier otra ayuda,
            estaremos encantados de ayudarte.
          </p>

          <p
            style="
              margin-top:24px;
              color:#111;
              font-weight:600;
            "
          >
            Equipo Camarguette Collective
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
          Gracias por confiar en nosotros ❤️
        </div>

      </div>
    </div>
  `;
}
