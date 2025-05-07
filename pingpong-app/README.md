# PingPong App 🏓

Una aplicación móvil moderna full-stack para el seguimiento de partidos de ping pong, estadísticas de jugadores y torneos, desarrollada con React Native.

## Origen y Motivación 💡

Esta aplicación nació durante mi participación en el Bootcamp de Desarrollo Fullstack en el edificio REDESSA. Durante los breaks y momentos de descanso entre clases, los estudiantes nos reuníamos para jugar ping pong, lo que rápidamente se convirtió en una actividad social y competitiva muy esperada.

La necesidad de registrar nuestras partidas, llevar un seguimiento de victorias, derrotas y organizar pequeños torneos entre compañeros fue la chispa que inspiró este proyecto.

## Características Implementadas 🌟

### Frontend (pingpong-app)
- **Gestión de Jugadores**
  - Perfiles de jugadores con nombre y estadísticas
  - Captura de fotos de perfil usando la cámara del dispositivo
  - Seguimiento de victorias y derrotas
  - Visualización de estadísticas básicas

- **Estadísticas**
  - Gráficos de progreso usando Victory Native
  - Estadísticas básicas de partidos
  - Porcentaje de victorias
  - Historial de partidos

### Backend (pingpong-backend)
- **API REST**
  - Gestión de jugadores (CRUD)
  - Registro de partidos
  - Consulta de estadísticas
  - Sistema de puntuación

## Stack Tecnológico Actual 💻

### Frontend 📱
- **React Native**: Framework principal para desarrollo móvil
- **TypeScript**: Lenguaje tipado
- **Expo**: Plataforma de desarrollo
- **React Native Paper**: Biblioteca de componentes UI
- **Victory Native**: Visualización de datos y gráficos
- **Expo Camera**: Integración con la cámara
- **AsyncStorage**: Almacenamiento local
- **Moment.js**: Manejo de fechas
- **React Navigation**: Navegación entre pantallas
- **React Native Vector Icons**: Iconos
- **React Native Sound**: Efectos de sonido

### Backend 🔧
- **Node.js**: Entorno de ejecución
- **Express.js**: Framework web
- **MySQL**: Base de datos relacional
- **MySQL2**: Driver para MySQL
- **CORS**: Middleware para permitir peticiones cross-origin

## Estructura del Proyecto 📁

```
pingpong-app/
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── screens/           # Pantallas principales
│   ├── assets/            # Recursos estáticos
│   ├── App.tsx            # Componente principal
│   └── index.ts           # Punto de entrada
├── webpack.config.js      # Configuración de webpack
├── babel.config.js        # Configuración de babel
├── tsconfig.json          # Configuración de TypeScript
└── package.json           # Dependencias y scripts

pingpong-backend/
├── index.js              # Servidor principal
├── test-db.js           # Scripts de prueba de base de datos
├── update_database.sql  # Scripts de actualización de BD
└── package.json         # Dependencias y scripts
```

## Base de Datos 💾

### Esquema MySQL
```sql
-- Jugadores
CREATE TABLE players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  victories INT DEFAULT 0,
  stats_wins INT DEFAULT 0,
  stats_losses INT DEFAULT 0,
  stats_draws INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partidos
CREATE TABLE matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player1_id INT,
  player2_id INT,
  winner_id INT,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player1_id) REFERENCES players(id),
  FOREIGN KEY (player2_id) REFERENCES players(id),
  FOREIGN KEY (winner_id) REFERENCES players(id)
);
```

## Instalación y Uso 🚀

1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
```

2. Instalar dependencias del frontend
```bash
cd pingpong-app
npm install
```

3. Instalar dependencias del backend
```bash
cd pingpong-backend
npm install
```

4. Configurar la base de datos MySQL
- Crear una base de datos llamada `pingpong_db`
- Ejecutar los scripts SQL proporcionados

5. Iniciar el backend
```bash
cd pingpong-backend
npm start
```

6. Ejecutar la aplicación
```bash
cd pingpong-app
npm start
```

## Características Futuras 🔮

- [ ] Sistema de torneos
- [ ] Autenticación de usuarios
- [ ] Perfiles más detallados
- [ ] Estadísticas avanzadas
- [ ] Modo multijugador en línea
- [ ] Rankings y clasificaciones
- [ ] Notificaciones push
- [ ] Exportación de datos
- [ ] Modo espectador
- [ ] Análisis de rendimiento

## Desarrollador 👨‍💻

Diseñado, desarrollado y mantenido por **Luis Vanegas**.

## Licencia 📄

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

© 2024 Luis Vanegas. Todos los derechos reservados. 