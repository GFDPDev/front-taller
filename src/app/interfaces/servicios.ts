
export interface ServiciosRes {
  id:                string;
  id_cliente?:       string;
  id_usuario?:       string;
  nombre_cliente?:   string;
  curp?:             string;
  telefono_cliente?: string;
  encargado?:        string;
  fecha_ingreso?:    Date;
  producto?:         string;
  id_marca?:         string;
  marca?:            string;
  modelo?:           string;
  tipo?:             string;
  serie?:            string;
  garantia?:         string;
  falla_detectada?:  string;
  cotizacion?:       string;
  fecha_terminado?:  null;
  fecha_entrega?:    null;
  importe?:          string;
  estatus?:          string;
  observaciones?:    string;
  efectividad?:      string;
  modificador?:      string;
  impreso?:      string;
  avisado?:      string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toServiciosRes(json: string): ServiciosRes[] {
      return JSON.parse(json);
  }

  public static serviciosResToJson(value: ServiciosRes[]): string {
      return JSON.stringify(value);
  }
}
