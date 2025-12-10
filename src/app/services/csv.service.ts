import { Injectable } from '@angular/core';


@Injectable()
export class CSVService {

    downloadFile(data: any, filename='data', headers: any) {
        data = data.replace(/(\r\n|\n|\r)/gm, "");

        let csvData = this.ConvertToCSV(data, headers);
        let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
        let dwldLink = document.createElement("a");
        let url = URL.createObjectURL(blob);
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
            dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", filename + ".csv");
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }

    formatCSVValue(value: any): string {
        if (value === null || value === undefined) {
            return '""'; // Campo vacío entre comillas
        }

        // Convertir el valor a cadena para manejar números, fechas, etc.
        let stringValue = String(value);

        // ESCAPE: Reemplazar todas las comillas dobles internas (") con doble comilla doble ("").
        // Ej: "Dato con comillas" -> ""Dato con comillas""
        stringValue = stringValue.replace(/"/g, '""');

        // ENVOLTURA: Encerrar el valor escapado en comillas dobles.
        // Ej: Dato sin comillas -> "Dato sin comillas"
        return `"${stringValue}"`;
    }


    /**
     * 2. Función principal ConvertToCSV modificada.
     * - Cambia el separador de ';' a ','.
     * - Utiliza formatCSVValue para cada celda.
     */
    ConvertToCSV(objArray: any, headerList: any) {
        let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';
        
        // Cambiar la cabecera 'registro;' por 'registro,'
        let row = this.formatCSVValue('registro'); 

        // Construcción de la fila de cabeceras
        for (let index in headerList) {
            // Usar ',' como separador y formatCSVValue para envolver el nombre de la columna
            row += ',' + this.formatCSVValue(headerList[index]); 
        }
        
        // No es necesario row = row.slice(0, -1); porque no hay un separador al final

        str += row + '\r\n'; // Agregar salto de línea

        // Construcción de las filas de datos
        for (let i = 0; i < array.length; i++) {
            // Iniciar la línea con el número de registro formateado
            let line = this.formatCSVValue(i + 1); 
            
            for (let index in headerList) {
                let head = headerList[index];
                let cellValue = array[i][head];

                // Usar ',' como separador y formatCSVValue para formatear el valor de la celda
                line += ',' + this.formatCSVValue(cellValue);
            }
            str += line + '\r\n'; // Agregar la línea completa con salto de línea
        }
        
        return str;
    }
}
