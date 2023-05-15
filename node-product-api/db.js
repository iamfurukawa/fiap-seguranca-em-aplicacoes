const { randomUUID } = require('crypto');
const mysql = require("mysql2/promise");

async function connect() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: 3306,
    user: 'test',
    password: 'test',
    database: 'finalProjectSubst',
    multipleStatements: true
  });
  console.log("Conectou no MySQL!");
  return connection;
}

async function getAllProducts() {
  const conn = await connect();

  const query = `SELECT * FROM products LIMIT 1000;`;
  console.log(`Executando query: ${query}`);

  const [rows, fields] = await conn.execute(query);
  console.log(`Rows: ${JSON.stringify(rows)}`);
  conn.end();
  return rows;
}

async function getProductById(id) {
  const conn = await connect();

  const query = `SELECT * FROM products WHERE id = ?;`;
  console.log(`Executando query: ${query}`);

  const [rows, fields] = await conn.execute(query, [id]);
  conn.end();
  return rows;
}

async function updateProductById(id, name, description, value) {
  try {
    const conn = await connect();

    const query = `UPDATE products SET name = ?, description = ?, value = ? WHERE id = ?;`;
    console.log(`Executando query: ${query}`);

    const [rows] = await conn.execute(query, [name, description, value, id]);
    conn.end();
    return rows;
  } catch (err) {
    throw { code: 500, message: 'Erro inesperado ao tentar atualizar o produto' };
  }
}

async function deleteProductById(id) {
  const conn = await connect();

  const query = `DELETE FROM products WHERE id = ?;`;
  console.log(`Executando query: ${query}`);

  await conn.execute(query, [id]);
  conn.end();
}

async function insertProduct(name, description, value) {
  const conn = await connect();

  // Validação de entrada
  if (!name || !description || !value) {
    throw { code: 400, message: 'Todos os campos são obrigatórios' };
  }

  const id = randomUUID();
  const query = `INSERT INTO products(id, name, description, value) VALUES (?, ?, ?, ?);`;
  console.log(`Executando query: ${query}`);

  try {
    // Prepared statement
    await conn.execute(query, [id, name, description, value]);
    conn.end();
  } catch (err) {
    if (err.errno === 1062) {
      throw { code: 400, message: 'Já existe um produto cadastrado com este nome!' };
    } else {
      throw { code: 500, message: 'Erro inesperado ao tentar cadastrar o produto' };
    }
  }
}

module.exports = { getProductById, getAllProducts, insertProduct, updateProductById, deleteProductById }
