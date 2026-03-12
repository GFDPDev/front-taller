import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddendaService } from '../../../services/addenda.service';
import {
  AddendaMabeData,
  AddendaFormData,
} from '../../../interfaces/addenda';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addenda',
  standalone: false,
  templateUrl: './addenda.component.html',
  styleUrl: './addenda.component.scss',
})
export class AddendaComponent implements OnInit {
  addendaForm!: FormGroup;
  xmlContent: string = '';
  addendaData: AddendaMabeData | null = null;
  xmlFileName: string = '';
  showPreview: boolean = false;

  constructor(
    private fb: FormBuilder,
    private addendaService: AddendaService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.addendaForm = this.fb.group({
      ordenCompra: ['', [Validators.required, Validators.minLength(1)]],
      referencia1: ['', [Validators.required, Validators.minLength(1)]],
      codigoProveedor: ['5002359', [Validators.required]],
      plantaEntrega: ['D161', [Validators.required]],
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.xmlFileName = file.name;
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.xmlContent = e.target.result;

        // Parsear el XML y extraer datos
        this.addendaData = this.addendaService.parseXmlCFDI(this.xmlContent);

        if (this.addendaData) {
          // Actualizar valores por defecto en el formulario
          this.addendaForm.patchValue({
            codigoProveedor: this.addendaData.codigoProveedor,
            plantaEntrega: this.addendaData.plantaEntrega,
          });
          this.showPreview = true;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo parsear el archivo XML. Verifica que sea un CFDI válido.',
          });
        }
      };

      reader.readAsText(file);
    }
  }

  generateAndDownload(): void {
    if (!this.addendaForm.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Validación',
        text: 'Por favor completa todos los campos requeridos.',
      });
      return;
    }

    if (!this.addendaData || !this.xmlContent) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Primero carga un archivo XML válido.',
      });
      return;
    }

    try {
      // Actualizar los datos de la addenda con los valores del formulario
      const formValue = this.addendaForm.value as AddendaFormData;

      const updatedAddendaData: AddendaMabeData = {
        ...this.addendaData,
        ordenCompra: formValue.ordenCompra,
        referencia1: formValue.referencia1,
        codigoProveedor: formValue.codigoProveedor,
        plantaEntrega: formValue.plantaEntrega,
      };

      // Agregar addenda al XML
      const newXmlContent = this.addendaService.addAddendaToXml(
        this.xmlContent,
        updatedAddendaData
      );

      // Generar nombre del archivo de salida
      const outputFileName =
        this.xmlFileName.replace('.xml', '') + '_con_addenda.xml';

      // Descargar
      this.addendaService.downloadXml(newXmlContent, outputFileName);

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'El XML con la addenda ha sido generado y descargado correctamente.',
      });

      // Limpiar
      this.resetForm();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al procesar el XML.',
      });
    }
  }

  resetForm(): void {
    this.addendaForm.reset({
      codigoProveedor: '5002359',
      plantaEntrega: 'D161',
    });
    this.xmlContent = '';
    this.addendaData = null;
    this.xmlFileName = '';
    this.showPreview = false;
  }

  get orderCompraError(): string {
    const control = this.addendaForm.get('ordenCompra');
    if (control?.hasError('required')) {
      return 'Número de orden de compra requerido';
    }
    return '';
  }

  get referencia1Error(): string {
    const control = this.addendaForm.get('referencia1');
    if (control?.hasError('required')) {
      return 'Referencia requerida';
    }
    return '';
  }
}
