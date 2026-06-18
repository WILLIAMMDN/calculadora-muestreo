# Calculadora de Muestreo

Aplicacion web profesional para calcular y documentar muestras estadisticas. El proyecto fue construido con Angular para separar la logica en servicios, modelos e interfaces reutilizables.

![Angular](https://img.shields.io/badge/Angular-21.2-red?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Estado](https://img.shields.io/badge/Estado-Produccion-0f766e?style=for-the-badge)

## Funcionalidades

- Calculo de tamano de muestra para poblaciones finitas e infinitas.
- Asignacion proporcional para muestreo estratificado.
- Seleccion aleatoria por conglomerados.
- Muestreo sistematico con generador de poblacion e intervalo `k`.
- Historial local de los ultimos calculos.
- Interfaz responsive con estilo clasico, sobrio y orientado a herramienta.

## Tecnologias

- Angular 21 con componentes standalone.
- TypeScript con interfaces para solicitudes, resultados, estratos, conglomerados e historial.
- SCSS modular por componente.
- LocalStorage para persistencia ligera del historial.

## Estructura

```text
calculadora-muestreo/
+-- src/
|   +-- app/
|   |   +-- components/
|   |   |   +-- cluster-panel/
|   |   |   +-- history-panel/
|   |   |   +-- result-panel/
|   |   |   +-- sample-size-panel/
|   |   |   +-- stratified-panel/
|   |   |   +-- systematic-panel/
|   |   +-- models/
|   |   |   +-- sampling.models.ts
|   |   +-- services/
|   |   |   +-- sampling-calculator.service.ts
|   |   +-- app.html
|   |   +-- app.scss
|   |   +-- app.ts
|   |   +-- app.config.ts
|   +-- index.html
|   +-- main.ts
|   +-- styles.scss
+-- angular.json
+-- package.json
+-- README.md
```

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm start
```

La aplicacion se ejecuta por defecto en:

```text
http://localhost:4200/
```

## Build

```bash
npm run build
```

El resultado de produccion se genera en:

```text
dist/calculadora-muestreo/
```

## Formula principal

Para poblacion infinita:

```text
n = (Z^2 x p x q) / e^2
```

Para poblacion finita:

```text
n = (N x Z^2 x p x q) / ((N - 1) x e^2 + Z^2 x p x q)
```

Donde:

- `N`: tamano de poblacion.
- `Z`: valor critico segun nivel de confianza.
- `p`: proporcion esperada.
- `q`: `1 - p`.
- `e`: error maximo permitido.

## Autor

Desarrollado y mantenido por [William Medina](https://github.com/WILLIAMMDN).
