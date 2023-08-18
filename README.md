# Sistema de Control del Taller de Servicios 3.0.0
## Ambiente de Desarrollo
- [Angular CLI](https://github.com/angular/angular-cli) : 15.2.8.
- [Angular Material](https://material.angular.io/) : 15.2.9
- [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/): 5.3.0
- [Typescript](https://www.typescriptlang.org/) : 4.9.4 

## Build and Run
### Development
1. Asegúrate de tener instalado [Node.js](https://nodejs.org/es)
2. Asegúrate de tener instalado el Angular CLI, para instalar la última versión, ejecuta `npm install -g @angular/cli` en una terminal o cmd, esto instalará la última versión disponible.
3. Abre la carpeta taller_dev en [VS Code](https://code.visualstudio.com/) y ejecuta en una neuva terminal el script `ng s --o`, esto abrirá automáticamente el proyecto en el navegador predeterminado, la dirección por default es localhost:4200.

### Production
1. Asegúrate de tener instalado [Node.js](https://nodejs.org/es)
2. Asegúrate de tener instalado el Angular CLI, para instalar la última versión, ejecuta `npm install -g @angular/cli` en una terminal o cmd, esto instalará la última versión disponible.
3. Abre la carpeta taller_dev en [VS Code](https://code.visualstudio.com/) y ejecuta en una neuva terminal el script `ng build`, esto creará dentro del la carpeta dist, la carpeta taller_prod con los archivos del sitio web para ponerlo en producción.
4. Clona el repositorio de [taller](https://bitbucket.org/gfdp/taller/src/master/), y reemplaza los archivos dentro de la carpeta recién clonada, por los archivos de taller_prod.
5. Sube los cambios con los nuevos archivos de producción y descargalos en la carpeta del servidor para realizar cambios en producción.
6. Asegúrate de probar tus cambios en un ambiente dev antes de pasarlos a la carpeta del servidor.