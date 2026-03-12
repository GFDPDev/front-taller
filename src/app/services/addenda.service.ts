import { Injectable } from '@angular/core';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import {
  AddendaDetalleItem,
  AddendaMabeData,
} from '../interfaces/addenda';

@Injectable({
  providedIn: 'root',
})
export class AddendaService {
  constructor() {}

  /**
   * Convierte número a letras en español
   */
  private numberToWords(num: number): string {
    const unidades = [
      'CERO',
      'UN',
      'DOS',
      'TRES',
      'CUATRO',
      'CINCO',
      'SEIS',
      'SIETE',
      'OCHO',
      'NUEVE',
    ];
    const decenas = [
      'DIEZ',
      'ONCE',
      'DOCE',
      'TRECE',
      'CATORCE',
      'QUINCE',
      'DIECISÉIS',
      'DIECISIETE',
      'DIECIOCHO',
      'DIECINUEVE',
    ];
    const decenasMultiplos = [
      '',
      '',
      'VEINTE',
      'TREINTA',
      'CUARENTA',
      'CINCUENTA',
      'SESENTA',
      'SETENTA',
      'OCHENTA',
      'NOVENTA',
    ];
    const centenas = [
      '',
      'CIENTO',
      'DOSCIENTOS',
      'TRESCIENTOS',
      'CUATROCIENTOS',
      'QUINIENTOS',
      'SEISCIENTOS',
      'SETECIENTOS',
      'OCHOCIENTOS',
      'NOVECIENTOS',
    ];

    if (num === 0) return 'CERO';

    let entero = Math.floor(num);
    let decimal = Math.round((num - entero) * 100);

    let palabras = '';

    if (entero >= 1000000) {
      const millones = Math.floor(entero / 1000000);
      if (millones === 1) {
        palabras += 'UN MILLÓN ';
      } else {
        palabras += this.convertirHastaSeiscientos(millones) + ' MILLONES ';
      }
      entero %= 1000000;
    }

    if (entero >= 1000) {
      const miles = Math.floor(entero / 1000);
      if (miles === 1) {
        palabras += 'MIL ';
      } else {
        palabras += this.convertirHastaSeiscientos(miles) + ' MIL ';
      }
      entero %= 1000;
    }

    if (entero > 0) {
      palabras += this.convertirHastaSeiscientos(entero);
    }

    palabras += ' PESOS ';

    if (decimal > 0) {
      palabras += decimal.toString().padStart(2, '0') + '/100 M.N.';
    } else {
      palabras += '00/100 M.N.';
    }

    return palabras.trim();
  }

  /**
   * Normaliza la unidad a máximo 3 caracteres válidos para Mabe
   */
  private normalizeUnidad(unidad: string): string {
    const unidadMap: Record<string, string> = {
      'UNIDAD': 'UN',
      'XUN': 'UN',
      'PIEZA': 'PIZ',
      'METRO': 'MTR',
      'KILOGRAMO': 'KGM',
      'LITRO': 'LTR',
      'HORA': 'HRA',
      'SERVICIO': 'SRV',
    };

    const normalized = unidadMap[unidad] || unidad;
    return normalized.substring(0, 3).toUpperCase();
  }

  private convertirHastaSeiscientos(num: number): string {
    const unidades = [
      '',
      'UN',
      'DOS',
      'TRES',
      'CUATRO',
      'CINCO',
      'SEIS',
      'SIETE',
      'OCHO',
      'NUEVE',
    ];
    const decenas = [
      'DIEZ',
      'ONCE',
      'DOCE',
      'TRECE',
      'CATORCE',
      'QUINCE',
      'DIECISÉIS',
      'DIECISIETE',
      'DIECIOCHO',
      'DIECINUEVE',
    ];
    const decenasMultiplos = [
      '',
      '',
      'VEINTE',
      'TREINTA',
      'CUARENTA',
      'CINCUENTA',
      'SESENTA',
      'SETENTA',
      'OCHENTA',
      'NOVENTA',
    ];
    const centenas = [
      '',
      'CIENTO',
      'DOSCIENTOS',
      'TRESCIENTOS',
      'CUATROCIENTOS',
      'QUINIENTOS',
      'SEISCIENTOS',
      'SETECIENTOS',
      'OCHOCIENTOS',
      'NOVECIENTOS',
    ];

    let palabras = '';

    // Centenas
    if (num >= 100) {
      palabras += centenas[Math.floor(num / 100)] + ' ';
      num %= 100;
    }

    // Decenas y unidades
    if (num >= 20) {
      palabras += decenasMultiplos[Math.floor(num / 10)];
      if (num % 10 > 0) {
        palabras += ' Y ' + unidades[num % 10];
      }
    } else if (num >= 10) {
      palabras += decenas[num - 10];
    } else if (num > 0) {
      palabras += unidades[num];
    }

    return palabras.trim();
  }

  /**
   * Parsea un XML CFDI y extrae los datos necesarios para la addenda
   */
  parseXmlCFDI(xmlContent: string): AddendaMabeData | null {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      // Extraer datos del root (Comprobante)
      const rootElement = xmlDoc.documentElement;
      const folio = rootElement.getAttribute('Folio') || '';
      const fecha = rootElement.getAttribute('Fecha') || '';
      const subtotal = parseFloat(rootElement.getAttribute('SubTotal') || '0');
      const total = parseFloat(rootElement.getAttribute('Total') || '0');
      const totalImpuestos = total - subtotal;

      // Extraer conceptos usando métodos DOM nativos
      const conceptos: AddendaDetalleItem[] = [];
      let lineNum = 1;
      let tasaImpuesto = 0;

      // Usar getElementsByTagNameNS para acceder a elementos con namespace
      const CFDI_NS = 'http://www.sat.gob.mx/cfd/4';
      const conceptosNodes = rootElement.getElementsByTagNameNS(CFDI_NS, 'Concepto');

      Array.from(conceptosNodes).forEach((node: any) => {
        const noId = node.getAttribute('NoIdentificacion') || '';
        const cantidad = parseFloat(node.getAttribute('Cantidad') || '0');
        const descripcion = node.getAttribute('Descripcion') || '';
        const unidad = this.normalizeUnidad(node.getAttribute('Unidad') || 'UN');
        const valorUnitario = parseFloat(
          node.getAttribute('ValorUnitario') || '0'
        );
        const importe = parseFloat(node.getAttribute('Importe') || '0');

        // Extraer tasa del impuesto
        const impuestosNode = node.getElementsByTagNameNS(CFDI_NS, 'Impuestos')[0];
        if (impuestosNode && tasaImpuesto === 0) {
          const trasladoNode = impuestosNode.getElementsByTagNameNS(CFDI_NS, 'Traslado')[0];
          if (trasladoNode) {
            tasaImpuesto = parseFloat(
              (trasladoNode as any).getAttribute('TasaOCuota') || '0'
            );
          }
        }

        const impuesto = importe * tasaImpuesto;
        const importeConIva = importe + impuesto;

        conceptos.push({
          noLineaArticulo: lineNum,
          codigoArticulo: noId,
          descripcion: descripcion,
          unidad: unidad,
          cantidad: cantidad,
          precioSinIva: valorUnitario,
          precioConIva: valorUnitario * (1 + tasaImpuesto),
          importeSinIva: importe,
          importeConIva: importeConIva,
        });

        lineNum++;
      });

      // Generar importe con letra
      const importeConLetra = this.numberToWords(total);

      return {
        xmlns_mabe: 'https://recepcionfe.mabempresa.com/cfd/addenda/v1',
        xsi_schemaLocation:
          'https://recepcionfe.mabempresa.com/cfd/addenda/v1 https://recepcionfe.mabempresa.com/cfd/addenda/v1/mabev1.xsd',
        version: '1.0',
        tipoDocumento: 'FACTURA',
        tipoMoneda: 'MXN',
        tipoTraslado: 'IVA',
        codigoProveedor: '5002359', // Valor por defecto
        plantaEntrega: 'D161', // Valor por defecto
        folio: folio,
        fecha: fecha.split('T')[0], // Solo la fecha, sin la hora
        importeConLetra: importeConLetra,
        conceptos: conceptos,
        subtotal: subtotal,
        totalImpuestos: totalImpuestos,
        total: total,
        tasaImpuesto: tasaImpuesto,
        ordenCompra: '',
        referencia1: '',
      };
    } catch (error) {
      console.error('Error parsing XML:', error);
      return null;
    }
  }

  /**
   * Crea la sección de addenda y la inserta en el XML
   */
  addAddendaToXml(
    xmlContent: string,
    addendaData: AddendaMabeData
  ): string {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      const CFDI_NS = 'http://www.sat.gob.mx/cfd/4';
      const MABE_NS = 'https://recepcionfe.mabempresa.com/cfd/addenda/v1';

      // Obtener el elemento root (Comprobante)
      const rootElement = xmlDoc.documentElement;

      // Eliminar addenda si ya existe
      const existingAddendas = rootElement.getElementsByTagNameNS(CFDI_NS, 'Addenda');
      if (existingAddendas.length > 0) {
        rootElement.removeChild(existingAddendas[0]);
      }

      // Crear la estructura de addenda con namespace CFDI
      const addendaElement = xmlDoc.createElementNS(CFDI_NS, 'cfdi:Addenda');

      const facturaElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Factura');

      // Atributos de la factura Mabe
      facturaElement.setAttribute('version', addendaData.version);
      facturaElement.setAttribute('tipoDocumento', addendaData.tipoDocumento);
      facturaElement.setAttribute('folio', addendaData.folio);
      facturaElement.setAttribute('fecha', addendaData.fecha);
      facturaElement.setAttribute('ordenCompra', addendaData.ordenCompra);
      facturaElement.setAttribute('referencia1', addendaData.referencia1);

      // XML namespaces
      facturaElement.setAttribute(
        'xmlns:xsi',
        'http://www.w3.org/2001/XMLSchema-instance'
      );
      facturaElement.setAttribute(
        'xsi:schemaLocation',
        'https://recepcionfe.mabempresa.com/cfd/addenda/v1 https://recepcionfe.mabempresa.com/cfd/addenda/v1/mabev1.xsd'
      );

      // Moneda
      const monedaElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Moneda');
      monedaElement.setAttribute('tipoMoneda', addendaData.tipoMoneda);
      monedaElement.setAttribute(
        'importeConLetra',
        addendaData.importeConLetra
      );
      facturaElement.appendChild(monedaElement);

      // Proveedor
      const proveedorElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Proveedor');
      proveedorElement.setAttribute('codigo', addendaData.codigoProveedor);
      facturaElement.appendChild(proveedorElement);

      // Entrega
      const entregaElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Entrega');
      entregaElement.setAttribute('plantaEntrega', addendaData.plantaEntrega);
      facturaElement.appendChild(entregaElement);

      // Detalles
      const detallesElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Detalles');

      addendaData.conceptos.forEach((detalle) => {
        const detalleElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Detalle');

        detalleElement.setAttribute(
          'noLineaArticulo',
          detalle.noLineaArticulo.toString()
        );
        detalleElement.setAttribute('codigoArticulo', detalle.codigoArticulo);
        detalleElement.setAttribute('descripcion', detalle.descripcion);
        detalleElement.setAttribute('unidad', detalle.unidad);
        detalleElement.setAttribute('cantidad', detalle.cantidad.toString());
        detalleElement.setAttribute(
          'precioSinIva',
          detalle.precioSinIva.toFixed(2)
        );
        detalleElement.setAttribute(
          'precioConIva',
          detalle.precioConIva.toFixed(2)
        );
        detalleElement.setAttribute(
          'importeSinIva',
          detalle.importeSinIva.toFixed(2)
        );
        detalleElement.setAttribute(
          'importeConIva',
          detalle.importeConIva.toFixed(2)
        );

        detallesElement.appendChild(detalleElement);
      });

      facturaElement.appendChild(detallesElement);

      // Subtotal
      const subtotalElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Subtotal');
      subtotalElement.setAttribute('importe', addendaData.subtotal.toFixed(2));
      facturaElement.appendChild(subtotalElement);

      // Traslados
      const trasladosElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Traslados');

      const trasladoElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Traslado');
      trasladoElement.setAttribute('tipo', addendaData.tipoTraslado);
      trasladoElement.setAttribute(
        'tasa',
        addendaData.tasaImpuesto.toFixed(4)
      );
      trasladoElement.setAttribute(
        'importe',
        addendaData.totalImpuestos.toFixed(2)
      );

      trasladosElement.appendChild(trasladoElement);
      facturaElement.appendChild(trasladosElement);

      // Total
      const totalElement = xmlDoc.createElementNS(MABE_NS, 'mabe:Total');
      totalElement.setAttribute('importe', addendaData.total.toFixed(2));
      facturaElement.appendChild(totalElement);

      // Agregar factura a addenda
      addendaElement.appendChild(facturaElement);

      // Agregar addenda al root
      rootElement.appendChild(addendaElement);

      // Serializar el documento
      const serializer = new XMLSerializer();
      return serializer.serializeToString(xmlDoc);
    } catch (error) {
      console.error('Error adding addenda to XML:', error);
      return xmlContent;
    }
  }

  /**
   * Descargar XML como archivo
   */
  downloadXml(xmlContent: string, fileName: string = 'factura.xml'): void {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
