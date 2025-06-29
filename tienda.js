require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const insertarDocumentos = async (coleccion, datos) =>
  Array.isArray(datos) ? await coleccion.insertMany(datos) : await coleccion.insertOne(datos);

const actualizarDocumento = (col, filtro, actualizacion) => col.updateOne(filtro, actualizacion);

const eliminarDocumento = (col, filtro) => col.deleteOne(filtro);

const realizarConsulta = async (ventas, pipeline, titulo) => {
  console.log(titulo);
  const resultado = await ventas.aggregate(pipeline).toArray();
  console.log(resultado);
};

async function main() {
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    const db = client.db('TiendaRopa');
    const [usuarios, marcas, prendas, ventas] = ['Usuarios', 'Marcas', 'Prendas', 'Ventas'].map(c => db.collection(c));

    const usuario = { nombre: 'Carlos Pérez', correo: 'carlos@gmail.com', telefono: '8888-9999' };
    const { insertedId: usuarioId } = await insertarDocumentos(usuarios, usuario);
    console.log('Usuario insertado');

    const marcasDatos = [{ nombre: 'Nike' }, { nombre: 'Adidas' }, { nombre: 'Puma' }];
    const marcasResult = await insertarDocumentos(marcas, marcasDatos);
    const [nikeId, adidasId] = [0, 1].map(i => marcasResult.insertedIds[i]);
    console.log('Marcas insertadas');

    const prendasResult = await insertarDocumentos(prendas, [
      { nombre: 'Camiseta Deportiva', marca_id: nikeId, stock: 50, precio: 20000 },
      { nombre: 'Pantalón Deportivo', marca_id: adidasId, stock: 30, precio: 30000 }
    ]);
    const prendaId = prendasResult.insertedIds[0];
    console.log('Prendas insertadas');

    await insertarDocumentos(ventas, {
      usuario_id: usuarioId,
      fecha: new Date('2024-06-25'),
      detalles: [{ prenda_id: prendaId, cantidad: 2, precio_unitario: 20000 }]
    });
    console.log('Venta insertada');

    await Promise.all([
      actualizarDocumento(usuarios, { _id: usuarioId }, { $set: { telefono: '8888-1234' } }),
      actualizarDocumento(prendas, { _id: prendaId }, { $inc: { stock: -2 } }),
      eliminarDocumento(marcas, { nombre: 'Puma' })
    ]);
    console.log('Usuario y stock actualizados, marca eliminada');

    await realizarConsulta(
      ventas,
      [
        { $match: { fecha: new Date('2024-06-25') } },
        { $unwind: '$detalles' },
        { $group: { _id: '$detalles.prenda_id', totalVendidas: { $sum: '$detalles.cantidad' } } }
      ],
      'Consulta 1: Cantidad vendida por fecha'
    );

    await realizarConsulta(
      ventas,
      [
        { $unwind: '$detalles' },
        {
          $lookup: {
            from: 'Prendas',
            localField: 'detalles.prenda_id',
            foreignField: '_id',
            as: 'prenda'
          }
        },
        { $unwind: '$prenda' },
        {
          $lookup: {
            from: 'Marcas',
            localField: 'prenda.marca_id',
            foreignField: '_id',
            as: 'marca'
          }
        },
        { $unwind: '$marca' },
        { $group: { _id: '$marca.nombre' } }
      ],
      'Consulta 2: Marcas con al menos una venta'
    );

    await realizarConsulta(
      ventas,
      [
        { $unwind: '$detalles' },
        { $group: { _id: '$detalles.prenda_id', totalVendidas: { $sum: '$detalles.cantidad' } } },
        {
          $lookup: {
            from: 'Prendas',
            localField: '_id',
            foreignField: '_id',
            as: 'prenda'
          }
        },
        { $unwind: '$prenda' },
        {
          $project: {
            nombre: '$prenda.nombre',
            totalVendidas: 1,
            stockRestante: '$prenda.stock'
          }
        }
      ],
      'Consulta 3: Prendas vendidas y stock restante'
    );

    await realizarConsulta(
      ventas,
      [
        { $unwind: '$detalles' },
        {
          $lookup: {
            from: 'Prendas',
            localField: 'detalles.prenda_id',
            foreignField: '_id',
            as: 'prenda'
          }
        },
        { $unwind: '$prenda' },
        { $group: { _id: '$prenda.marca_id', totalVendidas: { $sum: '$detalles.cantidad' } } },
        {
          $lookup: {
            from: 'Marcas',
            localField: '_id',
            foreignField: '_id',
            as: 'marca'
          }
        },
        { $unwind: '$marca' },
        {
          $project: {
            nombreMarca: '$marca.nombre',
            totalVendidas: 1
          }
        },
        { $sort: { totalVendidas: -1 } },
        { $limit: 5 }
      ],
      'Consulta 4: Top 5 marcas más vendidas'
    );
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
    console.log('🔒 Conexión cerrada');
  }
}

main();
