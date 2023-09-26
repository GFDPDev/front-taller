// To parse this data:
//
//   import { Convert } from "./file";
//
//   const earningsChart = Convert.toEarningsChart(json);

export interface Chart {
    main:  number;
    total: number;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toChart(json: string): Chart[] {
        return JSON.parse(json);
    }

    public static chartToJson(value: Chart[]): string {
        return JSON.stringify(value);
    }
}
