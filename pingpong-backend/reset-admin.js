const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1616',
  database: 'pingpong_db',
  port: 3306
};

async function resetAdmin() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');

    // Eliminar el usuario admin existente si existe
    await connection.query('DELETE FROM users WHERE username = ?', ['admin']);
    console.log('✅ Usuario admin anterior eliminado');

    // Crear nuevo usuario admin
    const hashedPassword = await bcrypt.hash('admin', 10);
    await connection.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hashedPassword, 'admin']
    );
    console.log('✅ Nuevo usuario admin creado');
    console.log('Credenciales:');
    console.log('Usuario: admin');
    console.log('Contraseña: admin');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Conexión cerrada');
    }
  }
}

resetAdmin(); 