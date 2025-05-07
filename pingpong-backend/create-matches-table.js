const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1616',
  database: 'pingpong_db',
  port: 3306
};

async function createMatchesTable() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');

    // Crear tabla matches si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player1_id INT NOT NULL,
        player2_id INT NOT NULL,
        player1_result ENUM('win', 'lose') NOT NULL,
        player2_result ENUM('win', 'lose') NOT NULL,
        match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        winner_id INT,
        FOREIGN KEY (player1_id) REFERENCES players(id),
        FOREIGN KEY (player2_id) REFERENCES players(id),
        FOREIGN KEY (winner_id) REFERENCES players(id)
      )
    `);
    console.log('✅ Tabla matches creada o ya existente');

    // Insertar algunos datos de ejemplo si la tabla está vacía
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM matches');
    if (rows[0].count === 0) {
      console.log('📝 Insertando datos de ejemplo...');
      await connection.query(`
        INSERT INTO matches (player1_id, player2_id, player1_result, player2_result, winner_id)
        VALUES 
          (1, 2, 'win', 'lose', 1),
          (2, 3, 'win', 'lose', 2),
          (3, 1, 'win', 'lose', 3)
      `);
      console.log('✅ Datos de ejemplo insertados');
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

createMatchesTable(); 