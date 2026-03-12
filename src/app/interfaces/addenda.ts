export interface AddendaDetalleItem {
  noLineaArticulo: number;
  codigoArticulo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precioSinIva: number;
  precioConIva: number;
  importeSinIva: number;
  importeConIva: number;
}

export interface AddendaMabeData {
  // Técnicos (constantes)
  xmlns_mabe: string; // https://recepcionfe.mabempresa.com/cfd/addenda/v1
  xsi_schemaLocation: string; // url del xsd
  version: string; // 1.0
  tipoDocumento: string; // FACTURA
  tipoMoneda: string; // MXN
  tipoTraslado: string; // IVA

  // De empresa (configurables)
  codigoProveedor: string; // Ej: 5002359
  plantaEntrega: string; // Ej: D161

  // Automáticos del CFDI
  folio: string;
  fecha: string;
  importeConLetra: string;
  conceptos: AddendaDetalleItem[];
  subtotal: number;
  totalImpuestos: number;
  total: number;
  tasaImpuesto: number;

  // Manuales del usuario
  ordenCompra: string;
  referencia1: string;
}

export interface AddendaFormData {
  ordenCompra: string;
  referencia1: string;
  codigoProveedor: string;
  plantaEntrega: string;
}
