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

export function refundApprovedTemplate(
  customerName: string,
  orderUrl: string,
) {
  return `
    <div style="font-family:Arial;padding:32px;max-width:640px;margin:auto">

      <h1>
        Tu devolución ha sido aprobada ✅
      </h1>

      <p>
        Hola ${customerName},
      </p>

      <p>
        Hemos revisado tu solicitud de devolución y ha sido aprobada.
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
        <h3>
          Próximos pasos
        </h3>

        <ol style="padding-left:20px;line-height:1.8">
          <li>Empaqueta correctamente el producto.</li>
          <li>Conserva el justificante de envío.</li>
          <li>Cuando lo hayas enviado, marca el pedido como enviado desde tu área de pedido, introduciendo la empresa y el nro de rastreo.</li>
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
        <h3>
          Dirección de devolución
        </h3>

        <p>
          Camarguette Collective<br/>
          DIRECCIÓN PENDIENTE DE CONFIGURAR
        </p>

        <p>
          Incluye el número de pedido dentro del paquete.
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
        <strong>
          Información importante
        </strong>

        <p>
          Los gastos de devolución corren actualmente por cuenta del cliente.
        </p>

        <p>
          Recomendamos utilizar un envío con seguimiento.
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
        "
      >
        Ver mi pedido
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

      <h1>Solicitud de devolución rechazada</h1>

      <p>
        Hola ${customerName},
      </p>

      <p>
        Hemos revisado tu solicitud.
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
        <strong>Motivo:</strong>

        <p>
          ${reason}
        </p>
      </div>

      <p style="margin-top:20px">
        Si crees que se trata de un error puedes responder desde la página de tu pedido.
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
        Ver pedido
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
    <div style="font-family:Arial;padding:32px;max-width:640px;margin:auto">

      <h1>Reembolso procesado 💸</h1>

      <p>
        Hola ${customerName},
      </p>

      <p>
        Hemos procesado correctamente tu devolución.
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
        <strong>Importe reembolsado:</strong>

        <p>${amount}</p>
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
        "
      >
        Ver pedido
      </a>

    </div>
  `;
}

export function abandonedCheckoutEmail1Template(
  customerName: string,
  orderUrl: string,
) {
  return `
    <div style="font-family:Arial;padding:32px;max-width:640px;margin:auto">

      <h1>Tu pedido sigue esperándote 🛒</h1>

      <p>Hola ${customerName},</p>

      <p>
        Hemos guardado tu pedido para que puedas completarlo cuando quieras.
      </p>

      <p>
        Algunos productos pueden agotarse pronto.
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
        "
      >
        Completar pedido
      </a>

    </div>
  `;
}

export function abandonedCheckoutEmail2Template(
  customerName: string,
  orderUrl: string,
) {
  return `
    <div style="font-family:Arial;padding:32px;max-width:640px;margin:auto">

      <h1>No olvides tu pedido</h1>

      <p>Hola ${customerName},</p>

      <p>
        Tu pedido sigue disponible y todavía puedes finalizar la compra.
      </p>

      <p>
        Si estabas esperando el momento adecuado, este es un buen recordatorio.
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
        "
      >
        Continuar pago
      </a>

    </div>
  `;
}

export function abandonedCheckoutEmail3Template(
  customerName: string,
  orderUrl: string,
) {
  return `
    <div style="font-family:Arial;padding:32px;max-width:640px;margin:auto">

      <h1>Última oportunidad</h1>

      <p>Hola ${customerName},</p>

      <p>
        Tu pedido pendiente será cancelado automáticamente si no se completa.
      </p>

      <p>
        Si todavía quieres los productos, finaliza el pago ahora.
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
        "
      >
        Finalizar pedido
      </a>

    </div>
  `;
}