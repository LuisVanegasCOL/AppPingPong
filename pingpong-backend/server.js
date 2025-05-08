const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { authenticateToken } = require('./auth');
const { registerUser, loginUser } = require('./auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'metro.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'oqGbovQrXwNXmirvhLxacWSbKsdNFtty',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 53902,
  connectTimeout: 10000, // 10 segundos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verificar la conexión
pool.getConnection()
  .then(connection => {
    console.log('\n🚀 ===========================================');
    console.log('📡 Estado de la conexión:');
    console.log('✅ Conexión exitosa con MySQL en Railway');
    console.log(`📊 Base de datos: ${process.env.DB_NAME || 'railway'}`);
    console.log(`🌐 Host: ${process.env.DB_HOST || 'metro.proxy.rlwy.net'}`);
    console.log(`🔌 Puerto: ${process.env.DB_PORT || 53902}`);
    console.log('===========================================\n');
    connection.release();
  })
  .catch(err => {
    console.error('\n❌ ===========================================');
    console.error('❌ Error al conectar con MySQL en Railway:');
    console.error('❌ Detalles del error:', err.message);
    console.error('❌ Variables de entorno:');
    console.error('   DB_HOST:', process.env.DB_HOST);
    console.error('   DB_USER:', process.env.DB_USER);
    console.error('   DB_NAME:', process.env.DB_NAME);
    console.error('   DB_PORT:', process.env.DB_PORT);
    console.error('===========================================\n');
    process.exit(1);
  });

// Middleware CORS
app.use(cors({
  origin: [
    'http://localhost:19006', 
    'http://localhost:19000', 
    'http://localhost:3000',
    'https://luisvanegascol.github.io'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Middleware para loguear peticiones
app.use((req, res, next) => {
  console.log('📥 ===========================================');
  console.log('📥 Nueva petición recibida:');
  console.log('📥 Método:', req.method);
  console.log('📥 URL:', req.url);
  console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📥 Body:', JSON.stringify(req.body, null, 2));
  console.log('📥 ===========================================');
  next();
});

// Rutas de autenticación
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    await registerUser(username, password);
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Intentando login para usuario:', username);
    const result = await loginUser(username, password);
    res.json(result);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(401).json({ error: error.message });
  }
});

// Ruta para obtener todos los jugadores
app.get('/players', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM players ORDER BY victories DESC');
    console.log('✅ Jugadores obtenidos:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener jugadores:', err);
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
});

// Ruta para crear un nuevo jugador
app.post('/players', async (req, res) => {
  const { name } = req.body;
  console.log('📥 Creando nuevo jugador:', name);

  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO players (name, victories) VALUES (?, 0)',
      [name]
    );
    const [newPlayer] = await pool.query('SELECT * FROM players WHERE id = ?', [result.insertId]);
    console.log('✅ Jugador creado:', newPlayer[0]);
    res.status(201).json(newPlayer[0]);
  } catch (err) {
    console.error('❌ Error al crear jugador:', err);
    res.status(500).json({ error: 'Error al crear jugador' });
  }
});

// Ruta para actualizar un jugador
app.put('/players/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  console.log('📥 Actualizando jugador:', id, name);

  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  try {
    await pool.query('UPDATE players SET name = ? WHERE id = ?', [name, id]);
    console.log('✅ Jugador actualizado');
    res.json({ id, name });
  } catch (err) {
    console.error('❌ Error al actualizar jugador:', err);
    res.status(500).json({ error: 'Error al actualizar jugador' });
  }
});

// Ruta para registrar una victoria
app.post('/players/:id/victory', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log('📥 Registrando victoria para jugador:', id);

  try {
    await pool.query('UPDATE players SET victories = victories + 1 WHERE id = ?', [id]);
    console.log('✅ Victoria registrada');
    res.json({ message: 'Victoria registrada con éxito' });
  } catch (err) {
    console.error('❌ Error al registrar victoria:', err);
    res.status(500).json({ error: 'Error al registrar victoria' });
  }
});

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Proteger las rutas sensibles
app.post('/players/:id/delete', authenticateToken, async (req, res) => {
  // Solo permitir a administradores eliminar jugadores
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
  }

  const id = parseInt(req.params.id);
  
  console.log('🔍 ===========================================');
  console.log('🔍 Recibida petición POST para eliminar jugador:', { id });
  console.log('🔍 Usuario que realiza la acción:', req.user.username);
  console.log('🔍 ===========================================');
  
  try {
    const [result] = await pool.query('DELETE FROM players WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      console.log('⚠️ Jugador no encontrado:', id);
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    
    console.log('✅ Jugador eliminado exitosamente');
    res.json({ message: 'Jugador eliminado exitosamente' });
  } catch (err) {
    console.error('❌ Error al eliminar jugador:', err);
    res.status(500).json({ error: 'Error al eliminar jugador' });
  }
});

// Ruta para obtener todas las partidas
app.get('/matches', async (req, res) => {
  console.log('📊 Obteniendo todas las partidas');
  
  const query = `
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
    ORDER BY m.match_date DESC`;

  try {
    const [rows] = await pool.query(query);
    console.log('✅ Partidas obtenidas:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener las partidas:', err);
    res.status(500).json({ error: 'Error al obtener las partidas' });
  }
});

// Ruta para eliminar un jugador
app.delete('/players/:id', async (req, res) => {
  const playerId = req.params.id;
  console.log('🗑️ Intentando eliminar jugador con ID:', playerId);

  try {
    // Primero eliminar los partidos asociados
    const [matchesResult] = await pool.query(
      'DELETE FROM matches WHERE player1_id = ? OR player2_id = ?',
      [playerId, playerId]
    );
    console.log('✅ Partidos eliminados:', matchesResult.affectedRows);

    // Luego eliminar el jugador
    const [playerResult] = await pool.query('DELETE FROM players WHERE id = ?', [playerId]);
    
    if (playerResult.affectedRows === 0) {
      console.log('⚠️ No se encontró el jugador con ID:', playerId);
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    console.log('✅ Jugador eliminado correctamente');
    res.json({ message: 'Jugador eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar jugador:', err);
    res.status(500).json({ error: 'Error al eliminar jugador' });
  }
});

// Ruta para agregar una nueva partida
app.post('/matches', authenticateToken, async (req, res) => {
  const { player1_id, player2_id, player1_result, player2_result } = req.body;
  console.log('📝 Recibida solicitud de nueva partida:', { player1_id, player2_id, player1_result, player2_result });

  if (!player1_id || !player2_id || !player1_result || !player2_result) {
    console.log('❌ Faltan campos requeridos');
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  // Determinar el ganador
  const winner_id = player1_result === 'win' ? player1_id : player2_id;

  try {
    // Registrar la partida
    const [result] = await pool.query(
      'INSERT INTO matches (player1_id, player2_id, player1_result, player2_result, match_date, winner_id) VALUES (?, ?, ?, ?, NOW(), ?)',
      [player1_id, player2_id, player1_result, player2_result, winner_id]
    );

    // Actualizar estadísticas de los jugadores
    await pool.query(
      'UPDATE players SET victories = victories + ? WHERE id = ?',
      [player1_result === 'win' ? 1 : 0, player1_id]
    );
    await pool.query(
      'UPDATE players SET victories = victories + ? WHERE id = ?',
      [player2_result === 'win' ? 1 : 0, player2_id]
    );

    // Obtener los datos actualizados de los jugadores
    const [players] = await pool.query('SELECT * FROM players WHERE id IN (?, ?)', [player1_id, player2_id]);

    const response = {
      id: result.insertId,
      player1_id,
      player2_id,
      player1_result,
      player2_result,
      winner_id,
      match_date: new Date(),
      player1_name: players.find(p => p.id === player1_id)?.name || 'Jugador 1',
      player2_name: players.find(p => p.id === player2_id)?.name || 'Jugador 2',
      winner_name: players.find(p => p.id === winner_id)?.name || 'Ganador',
      message: 'Partida registrada con éxito'
    };

    console.log('✅ Enviando respuesta:', response);
    res.status(200).json(response);
  } catch (err) {
    console.error('❌ Error al registrar la partida:', err);
    res.status(500).json({ error: 'Error al registrar la partida' });
  }
});

// Ruta para eliminar una partida
app.post('/matches/:id/delete', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  console.log('Recibida petición para eliminar partida ID:', id);

  if (isNaN(id)) {
    console.error('ID inválido:', req.params.id);
    return res.status(400).json({ error: 'ID de partida inválido' });
  }

  // Primero verificamos si la partida existe
  pool.getConnection()
    .then(connection => {
      connection.query('SELECT * FROM matches WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error('❌ Error al verificar partida:', err);
          return res.status(500).json({ error: 'Error al verificar la partida' });
        }

        if (results.length === 0) {
          console.log('Partida no encontrada');
          return res.status(404).json({ error: 'Partida no encontrada' });
        }

        // Eliminamos la partida
        connection.query('DELETE FROM matches WHERE id = ?', [id], (err, result) => {
          if (err) {
            console.error('❌ Error al eliminar la partida:', err);
            return res.status(500).json({ error: 'Error al eliminar la partida' });
          }

          console.log('Partida eliminada correctamente');
          res.json({ message: 'Partida eliminada con éxito' });
        });
      });
    })
    .catch(err => {
      console.error('❌ Error al obtener conexión:', err);
      res.status(500).json({ error: 'Error al obtener conexión' });
    });
});

// Rutas para torneos
app.get('/torneos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM torneos ORDER BY fecha_inicio DESC');
    console.log('✅ Torneos obtenidos:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener torneos:', err);
    res.status(500).json({ error: 'Error al obtener torneos' });
  }
});

app.get('/torneos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [rows] = await pool.query('SELECT * FROM torneos WHERE id_torneo = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }
    console.log('✅ Torneo obtenido:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error al obtener torneo:', err);
    res.status(500).json({ error: 'Error al obtener torneo' });
  }
});

app.post('/torneos', authenticateToken, async (req, res) => {
  const { nombre, fecha_inicio, fecha_fin, estado } = req.body;
  console.log('📥 Creando nuevo torneo:', { nombre, fecha_inicio, fecha_fin, estado });

  if (!nombre || !fecha_inicio || !fecha_fin || !estado) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO torneos (nombre, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?)',
      [nombre, fecha_inicio, fecha_fin, estado]
    );
    const [newTournament] = await pool.query('SELECT * FROM torneos WHERE id_torneo = ?', [result.insertId]);
    console.log('✅ Torneo creado:', newTournament[0]);
    res.status(201).json(newTournament[0]);
  } catch (err) {
    console.error('❌ Error al crear torneo:', err);
    res.status(500).json({ error: 'Error al crear torneo' });
  }
});

app.put('/torneos/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, fecha_inicio, fecha_fin, estado } = req.body;
  console.log('📥 Actualizando torneo:', { id, nombre, fecha_inicio, fecha_fin, estado });

  if (!nombre || !fecha_inicio || !fecha_fin || !estado) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    await pool.query(
      'UPDATE torneos SET nombre = ?, fecha_inicio = ?, fecha_fin = ?, estado = ? WHERE id_torneo = ?',
      [nombre, fecha_inicio, fecha_fin, estado, id]
    );
    console.log('✅ Torneo actualizado');
    res.json({ id_torneo: id, nombre, fecha_inicio, fecha_fin, estado });
  } catch (err) {
    console.error('❌ Error al actualizar torneo:', err);
    res.status(500).json({ error: 'Error al actualizar torneo' });
  }
});

app.delete('/torneos/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  console.log('🗑️ Intentando eliminar torneo con ID:', id);

  try {
    const [result] = await pool.query('DELETE FROM torneos WHERE id_torneo = ?', [id]);
    
    if (result.affectedRows === 0) {
      console.log('⚠️ No se encontró el torneo con ID:', id);
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }

    console.log('✅ Torneo eliminado correctamente');
    res.json({ message: 'Torneo eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar torneo:', err);
    res.status(500).json({ error: 'Error al eliminar torneo' });
  }
});

// Rutas para rankings
app.get('/rankings/torneo/:id', async (req, res) => {
  const torneoId = parseInt(req.params.id);
  try {
    console.log('📊 Obteniendo rankings para torneo:', torneoId);
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        p.name as nombre_jugador,
        t.nombre as nombre_torneo,
        (r.partidas_ganadas + r.partidas_perdidas) as total_partidas,
        CASE 
          WHEN (r.partidas_ganadas + r.partidas_perdidas) > 0 
          THEN ROUND((r.partidas_ganadas / (r.partidas_ganadas + r.partidas_perdidas)) * 100, 2)
          ELSE 0 
        END as porcentaje_victorias
      FROM rankings r
      JOIN players p ON r.id_jugador = p.id
      JOIN torneos t ON r.id_torneo = t.id_torneo
      WHERE r.id_torneo = ?
      ORDER BY r.posicion ASC, r.partidas_ganadas DESC
    `, [torneoId]);
    console.log('✅ Rankings obtenidos:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener rankings:', err);
    res.status(500).json({ error: 'Error al obtener rankings' });
  }
});

app.get('/rankings/jugador/:id', async (req, res) => {
  const jugadorId = parseInt(req.params.id);
  try {
    console.log('📊 Obteniendo rankings para jugador:', jugadorId);
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        p.name as nombre_jugador,
        t.nombre as nombre_torneo,
        (r.partidas_ganadas + r.partidas_perdidas) as total_partidas,
        CASE 
          WHEN (r.partidas_ganadas + r.partidas_perdidas) > 0 
          THEN ROUND((r.partidas_ganadas / (r.partidas_ganadas + r.partidas_perdidas)) * 100, 2)
          ELSE 0 
        END as porcentaje_victorias
      FROM rankings r
      JOIN players p ON r.id_jugador = p.id
      JOIN torneos t ON r.id_torneo = t.id_torneo
      WHERE r.id_jugador = ?
      ORDER BY t.fecha_inicio DESC
    `, [jugadorId]);
    console.log('✅ Rankings obtenidos:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener rankings del jugador:', err);
    res.status(500).json({ error: 'Error al obtener rankings del jugador' });
  }
});

// Función para calcular posiciones de ranking
async function calcularPosicionesRanking(idTorneo) {
  try {
    console.log('📊 Calculando posiciones para torneo:', idTorneo);
    
    // Obtener todos los rankings del torneo ordenados por victorias
    const [rankings] = await pool.query(`
      SELECT * FROM rankings 
      WHERE id_torneo = ? 
      ORDER BY partidas_ganadas DESC, partidas_perdidas ASC
    `, [idTorneo]);

    // Actualizar las posiciones
    for (let i = 0; i < rankings.length; i++) {
      const ranking = rankings[i];
      const nuevaPosicion = i + 1;
      
      if (ranking.posicion !== nuevaPosicion) {
        await pool.query(
          'UPDATE rankings SET posicion = ? WHERE id_rankings = ?',
          [nuevaPosicion, ranking.id_rankings]
        );
        console.log(`✅ Actualizada posición de ranking ${ranking.id_rankings} a ${nuevaPosicion}`);
      }
    }

    console.log('✅ Posiciones calculadas correctamente');
    return rankings;
  } catch (error) {
    console.error('❌ Error al calcular posiciones:', error);
    throw error;
  }
}

// Modificar la ruta POST de rankings para incluir el cálculo automático
app.post('/rankings', authenticateToken, async (req, res) => {
  const { id_torneo, id_jugador, partidas_ganadas, partidas_perdidas } = req.body;
  console.log('📥 Creando nuevo ranking:', { id_torneo, id_jugador, partidas_ganadas, partidas_perdidas });

  if (!id_torneo || !id_jugador || partidas_ganadas === undefined || partidas_perdidas === undefined) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    // Verificar si ya existe un ranking para este jugador en este torneo
    const [existing] = await pool.query(
      'SELECT * FROM rankings WHERE id_torneo = ? AND id_jugador = ?',
      [id_torneo, id_jugador]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe un ranking para este jugador en este torneo' });
    }

    // Insertar el nuevo ranking con posición temporal
    const [result] = await pool.query(
      'INSERT INTO rankings (id_torneo, id_jugador, posicion, partidas_ganadas, partidas_perdidas) VALUES (?, ?, 0, ?, ?)',
      [id_torneo, id_jugador, partidas_ganadas, partidas_perdidas]
    );

    // Recalcular todas las posiciones del torneo
    await calcularPosicionesRanking(id_torneo);

    // Obtener el ranking actualizado
    const [newRanking] = await pool.query(`
      SELECT 
        r.*,
        p.name as nombre_jugador,
        t.nombre as nombre_torneo,
        (r.partidas_ganadas + r.partidas_perdidas) as total_partidas,
        CASE 
          WHEN (r.partidas_ganadas + r.partidas_perdidas) > 0 
          THEN ROUND((r.partidas_ganadas / (r.partidas_ganadas + r.partidas_perdidas)) * 100, 2)
          ELSE 0 
        END as porcentaje_victorias
      FROM rankings r
      JOIN players p ON r.id_jugador = p.id
      JOIN torneos t ON r.id_torneo = t.id_torneo
      WHERE r.id_rankings = ?
    `, [result.insertId]);

    console.log('✅ Ranking creado:', newRanking[0]);
    res.status(201).json(newRanking[0]);
  } catch (err) {
    console.error('❌ Error al crear ranking:', err);
    res.status(500).json({ error: 'Error al crear ranking' });
  }
});

// Modificar la ruta PUT de rankings para incluir el cálculo automático
app.put('/rankings/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { partidas_ganadas, partidas_perdidas } = req.body;
  console.log('📥 Actualizando ranking:', { id, partidas_ganadas, partidas_perdidas });

  if (partidas_ganadas === undefined || partidas_perdidas === undefined) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    // Obtener el id_torneo del ranking
    const [ranking] = await pool.query('SELECT id_torneo FROM rankings WHERE id_rankings = ?', [id]);
    
    if (ranking.length === 0) {
      return res.status(404).json({ error: 'Ranking no encontrado' });
    }

    // Actualizar las estadísticas
    await pool.query(
      'UPDATE rankings SET partidas_ganadas = ?, partidas_perdidas = ? WHERE id_rankings = ?',
      [partidas_ganadas, partidas_perdidas, id]
    );

    // Recalcular todas las posiciones del torneo
    await calcularPosicionesRanking(ranking[0].id_torneo);

    // Obtener el ranking actualizado
    const [updatedRanking] = await pool.query(`
      SELECT 
        r.*,
        p.name as nombre_jugador,
        t.nombre as nombre_torneo,
        (r.partidas_ganadas + r.partidas_perdidas) as total_partidas,
        CASE 
          WHEN (r.partidas_ganadas + r.partidas_perdidas) > 0 
          THEN ROUND((r.partidas_ganadas / (r.partidas_ganadas + r.partidas_perdidas)) * 100, 2)
          ELSE 0 
        END as porcentaje_victorias
      FROM rankings r
      JOIN players p ON r.id_jugador = p.id
      JOIN torneos t ON r.id_torneo = t.id_torneo
      WHERE r.id_rankings = ?
    `, [id]);

    console.log('✅ Ranking actualizado:', updatedRanking[0]);
    res.json(updatedRanking[0]);
  } catch (err) {
    console.error('❌ Error al actualizar ranking:', err);
    res.status(500).json({ error: 'Error al actualizar ranking' });
  }
});

app.delete('/rankings/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  console.log('🗑️ Intentando eliminar ranking con ID:', id);

  try {
    const [result] = await pool.query('DELETE FROM rankings WHERE id_rankings = ?', [id]);
    
    if (result.affectedRows === 0) {
      console.log('⚠️ No se encontró el ranking con ID:', id);
      return res.status(404).json({ error: 'Ranking no encontrado' });
    }

    console.log('✅ Ranking eliminado correctamente');
    res.json({ message: 'Ranking eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar ranking:', err);
    res.status(500).json({ error: 'Error al eliminar ranking' });
  }
});

// Iniciar el servidor
const startServer = async () => {
  try {
    console.log('\n🚀 ===========================================');
    console.log('📡 Iniciando servidor...');
    console.log(`🔌 Puerto: ${port}`);
    console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log('===========================================\n');

    // Verificar la conexión a la base de datos primero
    const connection = await pool.getConnection();
    console.log('\n✅ Conexión a la base de datos establecida');
    connection.release();

    // Iniciar el servidor Express
    app.listen(port, '0.0.0.0', () => {
      console.log('\n🚀 ===========================================');
      console.log('📡 Servidor iniciado exitosamente');
      console.log(`🔌 Escuchando en el puerto ${port}`);
      console.log(`🌐 URL: http://0.0.0.0:${port}`);
      console.log('===========================================\n');
    });

  } catch (err) {
    console.error('\n❌ ===========================================');
    console.error('❌ Error al iniciar el servidor:');
    console.error('❌ Detalles del error:', err.message);
    console.error('❌ Stack trace:', err.stack);
    console.error('===========================================\n');
    process.exit(1);
  }
};

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('\n❌ ===========================================');
  console.error('❌ Error no manejado:');
  console.error('❌ Detalles del error:', err.message);
  console.error('❌ Stack trace:', err.stack);
  console.error('===========================================\n');
});

process.on('uncaughtException', (err) => {
  console.error('\n❌ ===========================================');
  console.error('❌ Excepción no capturada:');
  console.error('❌ Detalles del error:', err.message);
  console.error('❌ Stack trace:', err.stack);
  console.error('===========================================\n');
  process.exit(1);
});

// Iniciar el servidor
startServer(); 