export const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAYMENT_PROCESSING: "Procesando pago",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  FAILED: "Fallido",
  PARTIALLY_REFUNDED: "Reembolso parcial",
  REFUNDED: "Reembolsado",
};

export const shipmentStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
};

export const colorLabels: Record<string, string> = {
  WHITE: "Blanco",
  BLACK: "Negro",
  BLUE: "Azul",
  RED: "Rojo",
  GREEN: "Verde",
  YELLOW: "Amarillo",
  GREY: "Gris",
};

export const countryLabels: Record<string, string> = {
  
  // España y Europa

  ES: "España",
  PT: "Portugal",
  FR: "Francia",
  IT: "Italia",
  DE: "Alemania",
  BE: "Bélgica",
  NL: "Países Bajos",
  LU: "Luxemburgo",
  IE: "Irlanda",
  AT: "Austria",
  CH: "Suiza",
  DK: "Dinamarca",
  SE: "Suecia",
  NO: "Noruega",
  FI: "Finlandia",
  PL: "Polonia",
  CZ: "República Checa",
  SK: "Eslovaquia",
  HU: "Hungría",
  RO: "Rumanía",
  BG: "Bulgaria",
  HR: "Croacia",
  SI: "Eslovenia",
  EE: "Estonia",
  LV: "Letonia",
  LT: "Lituania",
  GR: "Grecia",

  // Reino Unido

  GB: "Reino Unido",

  // América

  US: "Estados Unidos",
  CA: "Canadá",
  MX: "México",

  AR: "Argentina",
  BO: "Bolivia",
  BR: "Brasil",
  CL: "Chile",
  CO: "Colombia",
  CR: "Costa Rica",
  CU: "Cuba",
  DO: "República Dominicana",
  EC: "Ecuador",
  SV: "El Salvador",
  GT: "Guatemala",
  HN: "Honduras",
  NI: "Nicaragua",
  PA: "Panamá",
  PY: "Paraguay",
  PE: "Perú",
  PR: "Puerto Rico",
  UY: "Uruguay",
  VE: "Venezuela",

  // Asia

  JP: "Japón",
  CN: "China",
  KR: "Corea del Sur",
  IN: "India",
  SG: "Singapur",
  TH: "Tailandia",
  MY: "Malasia",
  ID: "Indonesia",
  PH: "Filipinas",
  VN: "Vietnam",
  HK: "Hong Kong",
  TW: "Taiwán",

  // Oceanía

  AU: "Australia",
  NZ: "Nueva Zelanda",

  // Oriente Medio

  AE: "Emiratos Árabes Unidos",
  SA: "Arabia Saudí",
  QA: "Catar",
  KW: "Kuwait",
  IL: "Israel",
  TR: "Turquía",

  // África

  ZA: "Sudáfrica",
  MA: "Marruecos",
  EG: "Egipto",
  NG: "Nigeria",
  KE: "Kenia",
  TN: "Túnez",
  DZ: "Argelia",
};

export const timelineLabels: Record<string, string> = {
  ORDER_CREATED: "Pedido creado",
  PAYMENT_SUCCEEDED: "Pago confirmado",
  ORDER_UPDATED: "Email de confirmación enviado",
  ORDER_SHIPPED: "Pedido enviado",
  ORDER_DELIVERED: "Pedido entregado",
  REFUND_CREATED: "Solicitud de devolución",
  REFUND_COMPLETED: "Reembolso completado",
};

export const refundReasonLabels: Record<string, string> = {
  CUSTOMER_RETURN: "Ya no lo quiero",
  DAMAGED: "Producto dañado",
  WRONG_ITEM: "Producto incorrecto",
  FRAUD: "Fraude",
  ORDER_CANCELLED: "Pedido cancelado",
  OTHER: "Otro motivo",
};

export const refundStatusLabels: Record<string, string> = {
  PENDING_REVIEW: "Pendiente revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  SUCCEEDED: "Reembolsada",
  FAILED: "Fallida",
};

export const statusStyles: Record<string, string> = {
  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-300",

  PAYMENT_PROCESSING: "border-sky-500/20 bg-sky-500/10 text-sky-300",

  PAID: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

  SHIPPED: "border-violet-500/20 bg-violet-500/10 text-violet-300",

  DELIVERED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

  CANCELLED: "border-red-500/20 bg-red-500/10 text-red-300",

  FAILED: "border-red-500/20 bg-red-500/10 text-red-300",

  PARTIALLY_REFUNDED: "border-orange-500/20 bg-orange-500/10 text-orange-300",

  REFUNDED: "border-neutral-500/20 bg-neutral-500/10 text-neutral-300",
};

export const refundStatusStyles: Record<string, string> = {
  PENDING_REVIEW: "border-amber-500/20 bg-amber-500/10 text-amber-300",

  APPROVED: "border-sky-500/20 bg-sky-500/10 text-sky-300",

  REJECTED: "border-red-500/20 bg-red-500/10 text-red-300",

  SUCCEEDED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

  FAILED: "border-red-500/20 bg-red-500/10 text-red-300",
};
