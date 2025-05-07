const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1616',
  database: process.env.DB_NAME || 'pingpong_db',
  port: process.env.DB_PORT || 3306
});

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
  console.log('🔍 Verificando token de autenticación...');
  console.log('📥 Headers recibidos:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('🔑 Header de autorización:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🎟️ Token extraído:', token ? 'Sí' : 'No');

  if (!token) {
    console.log('❌ No se proporcionó token');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Error al verificar token:', err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }
    console.log('✅ Token verificado correctamente');
    console.log('👤 Usuario autenticado:', user);
    req.user = user;
    next();
  });
};

// Función para registrar un nuevo usuario
const registerUser = async (username, password, role = 'user') => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role],
      (err, result) => {
        if (err) {
          console.error('Error en registerUser:', err);
          reject(err);
        }
        resolve(result);
      }
    );
  });
};

// Función para iniciar sesión
const loginUser = async (username, password) => {
  return new Promise((resolve, reject) => {
    console.log('Buscando usuario:', username);
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, results) => {
        if (err) {
          console.error('Error en la consulta SQL:', err);
          reject(new Error('Error al buscar usuario'));
          return;
        }
        
        console.log('Resultados de la búsqueda:', results);
        
        if (results.length === 0) {
          console.log('Usuario no encontrado');
          reject(new Error('Usuario no encontrado'));
          return;
        }

        const user = results[0];
        console.log('Usuario encontrado:', user.username);
        
        try {
          const validPassword = await bcrypt.compare(password, user.password);
          console.log('Contraseña válida:', validPassword);
          
          if (!validPassword) {
            reject(new Error('Contraseña incorrecta'));
            return;
          }

          const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          resolve({ 
            token, 
            user: { 
              id: user.id, 
              username: user.username, 
              role: user.role 
            } 
          });
        } catch (error) {
          console.error('Error al comparar contraseñas:', error);
          reject(new Error('Error al verificar la contraseña'));
        }
      }
    );
  });
};

module.exports = {
  authenticateToken,
  registerUser,
  loginUser
}; 