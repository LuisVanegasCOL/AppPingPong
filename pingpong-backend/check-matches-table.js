const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1616',
  database: 'pingpong_db',
  port: 3306
};

async function checkMatchesTable() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');

    // Verificar estructura de la tabla
    const [columns] = await connection.query('DESCRIBE matches');
    console.log('\n📋 Estructura de la tabla matches:');
    console.log(columns);

    // Verificar datos existentes
    const [matches] = await connection.query(`
      SELECT 
        m.id,
        m.player1_id,
        m.player2_id,
        m.player1_result,
        m.player2_result,
        m.match_date,
        m.winner_id,
        p1.name as player1_name,
        p2.name as player2_name,
        w.name as winner_name
      FROM matches m
      LEFT JOIN players p1 ON m.player1_id = p1.id
      LEFT JOIN players p2 ON m.player2_id = p2.id
      LEFT JOIN players w ON m.winner_id = w.id
      ORDER BY m.match_date DESC
    `);
    
    console.log('\n📊 Partidas existentes:', matches.length);
    console.log(matches);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Conexión cerrada');
    }
  }
}

checkMatchesTable(); 