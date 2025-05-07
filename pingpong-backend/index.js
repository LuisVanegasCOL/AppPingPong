const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // 👈 Importante para permitir peticiones desde tu app
const { authenticateToken } = require('./middleware/auth'); // Implied import for authenticateToken

const app = express();
const port = 8080; // Cambiado a un puerto más alto

// Configuración de la conexión a MySQL usando variables de entorno
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1616',
  database: process.env.DB_NAME || 'pingpong_db',
  port: process.env.DB_PORT || 3306,
  connectTimeout: 10000, // 10 segundos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Manejar errores de conexión
db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
    return;
  }
  console.log('✅ Conexión exitosa con MySQL');
});

// Middleware para loguear todas las peticiones
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

// Middleware CORS más permisivo
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 204
}));
app.use(express.json());

// Ruta para obtener lista de jugadores
app.get('/players', (req, res) => {
  db.query('SELECT id, name, victories, stats_wins, stats_losses, stats_draws FROM players ORDER BY victories DESC', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener jugadores:', err);
      res.status(500).send('Error al obtener jugadores');
    } else {
      res.json(results);
    }
  });
});

// Ruta para registrar una victoria
app.post('/players/:id/victory', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE players SET victories = victories + 1 WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('❌ Error al registrar victoria:', err);
      res.status(500).send('Error al registrar victoria');
    } else {
      db.query('SELECT * FROM players WHERE id = ?', [id], (err, player) => {
        if (err) {
          console.error('❌ Error al obtener el jugador actualizado:', err);
          res.status(500).send('Error al obtener el jugador actualizado');
        } else {
          res.json(player[0]);
        }
      });
    }
  });
});

// Ruta para crear un nuevo jugador
app.post('/players', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send('El nombre es requerido');
  }

  const query = 'INSERT INTO players (name, victories) VALUES (?, 0)';
  db.query(query, [name], (err, result) => {
    if (err) {
      console.error('Error al agregar jugador:', err);
      return res.status(500).send('Error al agregar jugador');
    }
    res.status(201).send({ id: result.insertId, name, victories: 0 });
  });
});

// Ruta para agregar una nueva partida
app.post('/matches', (req, res) => {
  const { player1_id, player2_id, player1_result, player2_result } = req.body;
  console.log('📝 Recibida solicitud de nueva partida:', { player1_id, player2_id, player1_result, player2_result });

  if (!player1_id || !player2_id || !player1_result || !player2_result) {
    console.log('❌ Faltan campos requeridos');
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  // Determinar el ganador
  const winner_id = player1_result === 'win' ? player1_id : player2_id;

  // Registrar la partida en la tabla matches
  const query = 'INSERT INTO matches (player1_id, player2_id, player1_result, player2_result, match_date, winner_id) VALUES (?, ?, ?, ?, NOW(), ?)';
  console.log('📝 Ejecutando query de inserción:', query);
  
  db.query(query, [player1_id, player2_id, player1_result, player2_result, winner_id], (err, result) => {
    if (err) {
      console.error('❌ Error al registrar la partida:', err);
      return res.status(500).json({ error: 'Error al registrar la partida' });
    }
    console.log('✅ Partida registrada con ID:', result.insertId);

    // Actualizar las estadísticas de los jugadores
    const updateStats = (playerId, isWinner) => {
      return new Promise((resolve, reject) => {
        const updateQuery = `
          UPDATE players 
          SET 
            victories = victories + ?,
            stats_wins = stats_wins + ?,
            stats_losses = stats_losses + ?
          WHERE id = ?`;
        
        const values = isWinner ? [1, 1, 0, playerId] : [0, 0, 1, playerId];
        
        db.query(updateQuery, values, (err, updateResult) => {
          if (err) {
            console.error('❌ Error al actualizar estadísticas:', err);
            reject(err);
          } else {
            console.log('✅ Estadísticas actualizadas para jugador:', playerId);
            resolve(updateResult);
          }
        });
      });
    };

    // Actualizar estadísticas y enviar respuesta
    const updateAndRespond = async () => {
      try {
        // Actualizar estadísticas del jugador 1
        await updateStats(player1_id, player1_result === 'win');
        
        // Actualizar estadísticas del jugador 2
        await updateStats(player2_id, player2_result === 'win');

        // Obtener los datos actualizados de los jugadores
        const getPlayersQuery = 'SELECT * FROM players WHERE id IN (?, ?)';
        db.query(getPlayersQuery, [player1_id, player2_id], (err, players) => {
          if (err) {
            console.error('❌ Error al obtener jugadores actualizados:', err);
            return res.status(500).json({ error: 'Error al obtener jugadores actualizados' });
          }

          // Devolver un objeto JSON con la información de la partida
          const response = {
            id: result.insertId,
            player1_id: player1_id,
            player2_id: player2_id,
            player1_result: player1_result,
            player2_result: player2_result,
            winner_id: winner_id,
            match_date: new Date(),
            player1_name: players.find(p => p.id === player1_id)?.name || 'Jugador 1',
            player2_name: players.find(p => p.id === player2_id)?.name || 'Jugador 2',
            winner_name: players.find(p => p.id === winner_id)?.name || 'Ganador',
            message: 'Partida registrada con éxito'
          };
          console.log('✅ Enviando respuesta:', response);
          res.status(200).json(response);
        });
      } catch (error) {
        console.error('❌ Error en el proceso de actualización:', error);
        res.status(500).json({ error: 'Error al actualizar las estadísticas' });
      }
    };

    updateAndRespond();
  });
});

// Ruta para obtener todas las partidas de un jugador específico
app.get('/matches/player/:playerId', (req, res) => {
  const { playerId } = req.params;

  const query = `
    SELECT 
      matches.id,
      matches.player1_id,
      matches.player2_id,
      matches.player1_result,
      matches.player2_result,
      matches.match_date
    FROM 
      pingpong_db.matches
    WHERE 
      matches.player1_id = ? OR matches.player2_id = ?`;

  db.query(query, [playerId, playerId], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener las partidas del jugador:', err);
      return res.status(500).send('Error al obtener las partidas del jugador');
    }
    res.json(results);
  });
});

// Ruta para obtener todas las partidas
app.get('/matches', (req, res) => {
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

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener las partidas:', err);
      res.status(500).json({ error: 'Error al obtener las partidas' });
    } else {
      res.json(results);
    }
  });
});

// Ruta para actualizar un jugador
app.put('/players/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  db.query('UPDATE players SET name = ? WHERE id = ?', [name, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar el jugador:', err);
      return res.status(500).json({ error: 'Error al actualizar el jugador' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    db.query('SELECT * FROM players WHERE id = ?', [id], (err, player) => {
      if (err) {
        console.error('❌ Error al obtener el jugador actualizado:', err);
        return res.status(500).json({ error: 'Error al obtener el jugador actualizado' });
      }
      res.json(player[0]);
    });
  });
});

// Ruta para eliminar un jugador (POST)
app.post('/players/:id/delete', (req, res) => {
  const id = parseInt(req.params.id);
  
  console.log('🔍 ===========================================');
  console.log('🔍 Recibida petición POST para eliminar jugador:', { id });
  console.log('🔍 Headers de la petición:', JSON.stringify(req.headers, null, 2));
  console.log('🔍 Método de la petición:', req.method);
  console.log('🔍 URL de la petición:', req.url);
  console.log('🔍 ===========================================');
  
  if (isNaN(id)) {
    console.error('❌ ID inválido:', req.params.id);
    return res.status(400).json({ error: 'ID de jugador inválido' });
  }

  // Primero verificamos si el jugador existe
  db.query('SELECT * FROM players WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Error al verificar jugador:', err);
      return res.status(500).json({ error: 'Error al verificar el jugador' });
    }

    if (results.length === 0) {
      console.log('❌ Jugador no encontrado');
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    // Primero eliminamos las partidas relacionadas con el jugador
    console.log('🗑️ Eliminando partidas relacionadas...');
    db.query('DELETE FROM matches WHERE player1_id = ? OR player2_id = ?', [id, id], (err) => {
      if (err) {
        console.error('❌ Error al eliminar las partidas del jugador:', err);
        return res.status(500).json({ error: 'Error al eliminar las partidas del jugador' });
      }

      console.log('✅ Partidas eliminadas correctamente');

      // Luego eliminamos el jugador
      console.log('🗑️ Eliminando jugador...');
      db.query('DELETE FROM players WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.error('❌ Error al eliminar el jugador:', err);
          return res.status(500).json({ error: 'Error al eliminar el jugador' });
        }

        if (result.affectedRows === 0) {
          console.log('❌ No se pudo eliminar el jugador');
          return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        console.log('✅ Jugador eliminado correctamente');
        res.json({ message: 'Jugador eliminado con éxito' });
      });
    });
  });
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
  db.query('SELECT * FROM matches WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Error al verificar partida:', err);
      return res.status(500).json({ error: 'Error al verificar la partida' });
    }

    if (results.length === 0) {
      console.log('Partida no encontrada');
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    // Eliminamos la partida
    db.query('DELETE FROM matches WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('❌ Error al eliminar la partida:', err);
        return res.status(500).json({ error: 'Error al eliminar la partida' });
      }

      console.log('Partida eliminada correctamente');
      res.json({ message: 'Partida eliminada con éxito' });
    });
  });
});

// Ruta para probar el servidor
app.get('/test', (req, res) => {
  console.log('✅ Test endpoint hit');
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Middleware para manejar peticiones OPTIONS
app.options('/*', (req, res) => {
  console.log('🔄 Petición OPTIONS recibida:', req.url);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.status(204).end();
});

// Iniciar servidor Express
app.listen(port, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
});

// Exportar la aplicación para Vercel
module.exports = app;
