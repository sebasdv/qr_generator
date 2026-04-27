# Generador de Códigos QR — UAI Ingeniería y Ciencias

Herramienta web para generar códigos QR con la identidad visual de la Facultad de Ingeniería y Ciencias de la Universidad Adolfo Ibáñez. Sin instalación, sin servidor, funciona directamente desde el navegador.

**Demo en vivo:** *(sebasdv.github.io/qr_generator/)*

---

## Características

- Genera QR para **URLs** y **texto libre**
- **Logo institucional UAI/FIC** incrustado en el centro del código QR
- Tres tamaños: Pequeño (200 px), Mediano (300 px), Grande (400 px)
- Descarga el QR como **PNG** con el logo incluido
- Los códigos generados **no tienen fecha de expiración** — son permanentes mientras el enlace destino exista
- Diseño responsive, funciona en móvil y desktop
- 100% client-side: no envía datos a ningún servidor

---

## Autores

**Sebastián Duarte**
Facultad de Ingeniería y Ciencias · Universidad Adolfo Ibáñez
Contacto: [dec@uai.cl](mailto:dec@uai.cl)

---

## Tecnologías y créditos

Este proyecto utiliza los siguientes recursos de código abierto:

| Proyecto | Autor | Licencia | Uso |
|---|---|---|---|
| [qrcodejs](https://github.com/davidshimjs/qrcodejs) | Shim Sangmin (davidshimjs) | MIT | Generación del código QR en canvas |
| [Inter](https://rsms.me/inter/) | Rasmus Andersson | SIL OFL 1.1 | Tipografía de la interfaz |

El logo y la identidad visual son propiedad de la Universidad Adolfo Ibáñez.

---

## Uso local

Se requiere un servidor local para que el logo cargue correctamente (restricción CORS de los navegadores con `file://`):

```bash
# Node.js
npx serve .

# Python
python -m http.server 8080
```

Luego abre `http://localhost:3000` (o el puerto que indique el servidor).

---

## Agregar o actualizar el logo

Reemplaza `assets/logo-uai.svg` con el archivo SVG oficial actualizado. Si prefieres PNG, guárdalo como `assets/logo-uai.png` — la app lo tomará primero automáticamente.

Recomendaciones para el PNG:
- Fondo transparente
- Mínimo 256×256 px

---

## Deploy en GitHub Pages

1. Sube todos los archivos a un repositorio GitHub
2. Ve a **Settings → Pages**
3. En *Source*: **Deploy from a branch → `main` → `/ (root)`**
4. En ~2 minutos el sitio estará disponible en `https://<usuario>.github.io/<repositorio>/`
5. Actualiza el enlace "Demo en vivo" al inicio de este README

---

## Estructura del proyecto

```
├── index.html              ← página principal
├── style.css               ← estilos (identidad UAI, responsive)
├── app.js                  ← lógica de generación y descarga
├── assets/
│   ├── qrcode.min.js       ← librería qrcodejs (MIT, davidshimjs)
│   ├── logo-uai.svg        ← logo institucional UAI/FIC
│   └── favicon.svg         ← ícono del navegador
├── LICENSE
└── README.md
```

---

## Licencia

MIT © 2026 Sebastián Duarte

Ver [LICENSE](LICENSE) para el texto completo.
