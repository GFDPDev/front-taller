// To parse this data:
//
//   import { Convert } from "./file";
//
//   const toolService = Convert.toToolService(json);

export interface ToolService {
    id:               number;
    id_cliente:       number;
    id_usuario:       number;
    fecha_ingreso:    Date;
    producto:         string;
    marca:            string;
    modelo:           string;
    tipo:             string;
    serie:            string;
    falla_detectada:  string;
    cotizacion:       string;
    garantia:         number;
    fecha_terminado:  null;
    fecha_entrega:    null;
    importe:          number;
    estatus:          string;
    observaciones:    string;
    avisado:          number;
    id_marca:         number;
    impreso:          number;
    id_modificado:    number;
    nombre_cliente:   string;
    telefono_cliente: string;
    encargado:        string;
    modificador:      string;
}


// Converts JSON strings to/from your types
export class Convert {
    public static toToolService(json: string): ToolService[] {
        return JSON.parse(json);
    }

    public static toolServiceToJson(value: ToolService[]): string {
        return JSON.stringify(value);
    }
}
