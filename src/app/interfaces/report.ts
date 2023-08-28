// To parse this data:
//
//   import { Convert, Report } from "./file";
//
//   const report = Convert.toReport(json);

export interface Report {
    user_report:     UserReport[];
    earnings_report: SReport[];
    service_report:  { [key: string]: number };
    express_report:  SReport[];
    external_report: ExternalReport[];
}

export interface SReport {
    id_encargado: number;
    encargado:    string;
    servicios:    number;
    porcentaje?:  number;
    importe:      number;
}

export interface ExternalReport {
    id_encargado: number;
    encargado:    string;
    servicios:    number;
    porcentaje:   number;
    pendientes:   number;
    agendado:     number;
    terminados:   number;
}

export interface UserReport {
    id_encargado:  number;
    encargado:     string;
    servicios:     number;
    porcentaje:    number;
    pendientes:    number;
    no_autorizado: number;
    por_autorizar: number;
    entregados:    number;
    terminados:    number;
}


// Converts JSON strings to/from your types
export class Convert {
    public static toReport(json: string): Report {
        return JSON.parse(json);
    }

    public static reportToJson(value: Report): string {
        return JSON.stringify(value);
    }
}
