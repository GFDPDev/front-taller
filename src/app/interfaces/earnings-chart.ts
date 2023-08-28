// To parse this data:
//
//   import { Convert } from "./file";
//
//   const earningsChart = Convert.toEarningsChart(json);

export interface EarningsChart {
    main:  number;
    total: number;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toEarningsChart(json: string): EarningsChart[] {
        return JSON.parse(json);
    }

    public static earningsChartToJson(value: EarningsChart[]): string {
        return JSON.stringify(value);
    }
}
