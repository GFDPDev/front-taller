// To parse this data:
//
//   import { Convert, Damaged } from "./file";
//
//   const damaged = Convert.toDamaged(json);

export interface ReportesMes {
    user_month:     UserMonth[];
    earnings_month: SMonth[];
    services_month: ServicesMonth;
    express_month:  SMonth[];
    external_month: ExternalMonth[];
}

export interface SMonth {
    id_encargado: string;
    encargado:    string;
    servicios:    string;
    porcentaje?:  string;
    importe:      string;
}

export interface ExternalMonth {
    id_encargado: string;
    encargado:    string;
    servicios:    string;
    porcentaje:   string;
    pendientes:   string;
    agendado:     string;
    terminados:   string;
    importe:   string;

}
export interface ServicesMonth {
    porAutorizar:   string;
    noAutorizado:   string;
    pendiente:      string;
    entregado:      string;
    terminado:      string;
    total:          string;
    porcPA:         string;
    porcNA:         string;
    porcP:          string;
    porcE:          string;
    porcT:          string;
    importeTotal:   string;
}

export interface UserMonth {
    id_encargado:  string;
    encargado:     string;
    servicios:     string;
    porcentaje:    string;
    pendientes:    string;
    no_autorizado: string;
    por_autorizar: string;
    entregados:    string;
    terminados:    string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toReporte(json: string): ReportesMes {
        return JSON.parse(json);
    }

    public static reporteToJson(value: ReportesMes): string {
        return JSON.stringify(value);
    }
}
