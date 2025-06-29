# TiendaRopa 📦👕📊

Este proyecto simula el manejo básico de una tienda de ropa utilizando **Node.js** y **MongoDB**. Permite registrar usuarios, administrar marcas y prendas de ropa, registrar ventas, actualizar documentos y realizar consultas analíticas sobre los datos.

## 🧠 Descripción del Proyecto

- Conexión a una base de datos MongoDB.
- Inserción de documentos en colecciones: `Usuarios`, `Marcas`, `Prendas`, `Ventas`.
- Ejecución de operaciones CRUD (crear, leer, actualizar, eliminar).
- Consultas de agregación sobre ventas, marcas y prendas.
- Uso de variables de entorno con `.env`.

## 🗂️ Ejemplos de Documentos (JSON)

### `Usuarios`
```json
{
  "nombre": "Carlos Pérez",
  "correo": "carlos@gmail.com",
  "telefono": "8888-9999"
}

### `Usuarios`
{
  "nombre": "Nike"
}

### Prendas
{
  "nombre": "Camiseta Deportiva",
  "marca_id": "ObjectId('...')",
  "stock": 50,
  "precio": 20000
}

### Ventas
{
  "usuario_id": "ObjectId('...')",
  "fecha": "2024-06-25T00:00:00.000Z",
  "detalles": [
    {
      "prenda_id": "ObjectId('...')",
      "cantidad": 2,
      "precio_unitario": 20000
    }
  ]
}
```

## 👥 Integrantes del Proyecto

- Roger Barquero Ramírez

## 🚀 Cómo Ejecutar

Instalar dependencias:
- bash
- npm install
- Crear un archivo .env con la siguiente variable:

- env
- MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/TiendaRopa
- Ejecutar el script:

- bash
- node index.js
