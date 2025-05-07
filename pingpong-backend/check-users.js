const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1616',
  database: 'pingpong_db',
  port: 3306
};

async function checkUsers() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');

    // Verificar usuarios existentes
    const [users] = await connection.query('SELECT * FROM users');
    console.log('Usuarios en la base de datos:', users);

    // Si no hay usuarios, crear el admin
    if (users.length === 0) {
      console.log('No hay usuarios, creando admin...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      await connection.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Usuario admin creado');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Conexión cerrada');
    }
  }
}

checkUsers(); 