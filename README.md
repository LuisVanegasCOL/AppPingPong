# 🏓 App Ping Pong

Aplicación web para la gestión de torneos y partidos de ping pong.

Desarrollado por Luis Vanegas © 2025

## 👨‍💻 Sobre el Desarrollador

¡Hola! Soy Luis Vanegas, un desarrollador en constante evolución que encontró en la programación una pasión por crear soluciones que impacten positivamente. Este proyecto de gestión de torneos de ping pong representa mi primer paso en un viaje de aprendizaje continuo, donde cada desafío es una oportunidad para crecer.

### 🌱 Mi Enfoque

- **Aprendizaje Continuo**: Cada día es una oportunidad para aprender algo nuevo. Este proyecto me ha enseñado que con dedicación y curiosidad, podemos dominar nuevas tecnologías y conceptos.
- **Compromiso con la Excelencia**: Busco entender profundamente cada aspecto de mis proyectos, desde la interfaz de usuario hasta la arquitectura del backend.
- **Visión Holística**: Me apasiona entender cómo cada pieza del puzzle tecnológico se conecta para crear soluciones completas.
- **Resiliencia**: Veo los desafíos como oportunidades para crecer y mejorar, manteniendo una actitud positiva y proactiva.

### 💫 Mi Visión

"Creo en el poder de la tecnología para transformar ideas en realidades. Mi objetivo es seguir creciendo como desarrollador, aprendiendo de cada proyecto y contribuyendo con soluciones que marquen la diferencia. Estoy emocionado por los desafíos que vendrán y las oportunidades de seguir mejorando."

## 🛠️ Herramientas Utilizadas

### Frontend
- React Native Web
- Expo
- TypeScript
- React Navigation
- React Native Paper
- Victory Native (gráficos)
- Axios (peticiones HTTP)
- AsyncStorage (almacenamiento local)

### Backend
- Node.js
- Express.js
- MySQL
- Railway (despliegue)
- GitHub Pages (despliegue frontend)

## 📁 Estructura del Proyecto

```
ProyectoPingpong/
├── pingpong-app/           # Frontend (React Native Web)
│   ├── src/
│   │   ├── api/           # Servicios y configuración de API
│   │   ├── components/    # Componentes reutilizables
│   │   ├── screens/       # Pantallas de la aplicación
│   │   └── navigation/    # Configuración de navegación
│   └── package.json
│
└── pingpong-backend/       # Backend (Node.js + Express)
    ├── server.js          # Punto de entrada del servidor
    ├── auth.js           # Autenticación
    └── package.json
```

## 💻 Tecnologías

### Frontend
- React Native Web para desarrollo multiplataforma
- TypeScript para tipado estático
- Expo para desarrollo y construcción
- React Navigation para la navegación
- React Native Paper para UI components
- Victory Native para visualización de datos

### Backend
- Node.js como runtime
- Express.js como framework web
- MySQL como base de datos
- Railway para hosting y despliegue

## 🔤 Lenguajes de Programación

- TypeScript/JavaScript (Frontend y Backend)
- SQL (Consultas a base de datos)
- HTML/CSS (Web)

## 📦 Complementos y Dependencias

### Frontend
- @expo/vector-icons: Iconos
- @react-native-async-storage/async-storage: Almacenamiento local
- @react-navigation/native: Navegación
- react-native-paper: UI components
- victory-native: Gráficos
- axios: Cliente HTTP

### Backend
- express: Framework web
- mysql2: Cliente MySQL
- cors: Middleware CORS
- dotenv: Variables de entorno

## ⚙️ Funcionalidades

### Gestión de Jugadores
- Crear jugadores
- Ver lista de jugadores
- Actualizar información
- Eliminar jugadores
- Registrar victorias

### Gestión de Partidas
- Registrar partidas
- Ver historial de partidas
- Eliminar partidas
- Estadísticas de partidas

### Gestión de Torneos
- Crear torneos
- Ver torneos activos
- Actualizar estado de torneos
- Eliminar torneos

### Rankings
- Ver rankings por torneo
- Ver rankings por jugador
- Estadísticas de victorias/derrotas

## 🗄️ Base de Datos

### Tablas Principales
- players: Información de jugadores
- matches: Registro de partidas
- torneos: Información de torneos
- rankings: Posiciones y estadísticas

### Conexión
```javascript
{
  host: 'metro.proxy.rlwy.net',
  user: 'root',
  password: '***',
  database: 'railway',
  port: 53902
}
```

## 🔌 Conexiones y Despliegue

### Frontend
- URL: https://luisvanegascol.github.io/AppPingPong/
- Plataforma: GitHub Pages
- Build: `npm run build`
- Deploy: `npm run deploy`

### Backend
- URL: https://apppingpong-production.up.railway.app
- Plataforma: Railway
- Base de datos: MySQL en Railway

## 🚧 Obstáculos y Soluciones

### Despliegue
1. **Problema**: Configuración de CORS
   - **Solución**: Configuración específica para GitHub Pages y Railway

2. **Problema**: Conexión a base de datos
   - **Solución**: Uso de variables de entorno en Railway

3. **Problema**: Build de React Native Web
   - **Solución**: Configuración correcta de scripts en package.json

### Desarrollo
1. **Problema**: Compatibilidad entre plataformas
   - **Solución**: Uso de React Native Web y Expo

2. **Problema**: Gestión de estado
   - **Solución**: Implementación de servicios y hooks personalizados

## 🔄 Flujo de Trabajo

1. Desarrollo local
2. Pruebas en entorno de desarrollo
3. Commit y push a GitHub
4. Despliegue automático en Railway (backend)
5. Build y deploy manual en GitHub Pages (frontend)

## 📱 Acceso a la Aplicación

- Frontend: https://luisvanegascol.github.io/AppPingPong/
- Backend: https://apppingpong-production.up.railway.app
- API Endpoints:
  - /test
  - /players
  - /matches
  - /torneos
  - /rankings 

## 🚀 Evolución y Mejoras Futuras

### Versión Actual (1.0)
Esta es la primera versión funcional de la aplicación, que demuestra las capacidades básicas de gestión de torneos. Aunque es un producto viable, reconozco que hay mucho espacio para mejora y evolución.

### 🔄 Próximas Mejoras Planificadas

#### Frontend
- **UI/UX Mejorada**
  - Diseño más moderno y atractivo
  - Animaciones y transiciones suaves
  - Modo oscuro/claro
  - Interfaz más intuitiva

- **Funcionalidades Adicionales**
  - Sistema de notificaciones en tiempo real
  - Estadísticas más detalladas
  - Filtros avanzados de búsqueda
  - Exportación de datos en múltiples formatos

#### Backend
- **Optimización de Rendimiento**
  - Caché de consultas frecuentes
  - Optimización de consultas SQL
  - Implementación de índices
  - Mejora en tiempos de respuesta

- **Nuevas Características**
  - Sistema de autenticación robusto
  - API más completa y documentada
  - WebSockets para actualizaciones en tiempo real
  - Sistema de respaldo automático

#### Seguridad
- **Mejoras de Seguridad**
  - Implementación de JWT
  - Validación de datos más robusta
  - Protección contra ataques comunes
  - Auditoría de seguridad

#### Escalabilidad
- **Arquitectura Mejorada**
  - Microservicios
  - Load balancing
  - Monitoreo avanzado
  - Auto-scaling


## ⏱️ Tiempo de Desarrollo Versión 1.0
- Inicio: Febrero 2025
- Finalización: Mayo 2025
- Duración total: 3 meses

## 🎓 Aprendizajes Adquiridos

### Desarrollo Frontend
- Implementación de React Native Web para aplicaciones multiplataforma
- Manejo de estado y navegación en aplicaciones React
- Creación de interfaces de usuario responsivas
- Integración de gráficos y visualizaciones de datos
- Gestión de formularios y validaciones
- Implementación de diseño material con React Native Paper

### Desarrollo Backend
- Creación de APIs RESTful con Express.js
- Diseño e implementación de bases de datos MySQL
- Manejo de conexiones y consultas a base de datos
- Implementación de middleware y controladores
- Gestión de CORS y seguridad
- Manejo de variables de entorno

### DevOps y Despliegue
- Despliegue de aplicaciones en Railway
- Configuración de GitHub Pages
- Gestión de dominios y certificados SSL
- Configuración de CI/CD
- Manejo de variables de entorno en producción
- Monitoreo y logs de aplicaciones

### Habilidades Blandas
- Gestión de proyectos
- Resolución de problemas
- Documentación técnica
- Trabajo con control de versiones
- Comunicación técnica

## 💼 Perfil Profesional

### 🚀 Stack Tecnológico Principal
- **Full Stack Development**
  - Frontend: React, React Native, TypeScript
  - Backend: Node.js, Express.js
  - Database: MySQL
  - APIs RESTful

- **Mobile Development**
  - React Native & Expo
  - Multiplatform Development
  - Native Features Integration

- **Cloud & DevOps**
  - Railway & GitHub Pages Deployment
  - CI/CD Implementation
  - Server Management
  - Performance Monitoring

### 💡 Habilidades Clave
1. **Arquitectura de Software**
   - Diseño de sistemas escalables
   - Patrones de diseño
   - Clean Code & SOLID principles
   - Microservicios

2. **Desarrollo de Productos**
   - UI/UX Implementation
   - Responsive Design
   - Performance Optimization
   - Security Best Practices

3. **Gestión de Datos**
   - Database Design & Optimization
   - Data Modeling
   - Query Optimization
   - Data Security

### ⭐ Valor para Empresas

1. **Desarrollo End-to-End**
   - Capacidad de llevar proyectos desde concepción hasta producción
   - Experiencia en ciclo completo de desarrollo
   - Implementación de soluciones robustas y escalables

2. **Innovación & Resolución**
   - Solución creativa de problemas complejos
   - Optimización de procesos
   - Implementación de mejores prácticas

3. **Liderazgo Técnico**
   - Documentación técnica clara
   - Mentoring y colaboración
   - Gestión de proyectos ágiles

4. **Adaptabilidad**
   - Aprendizaje rápido de nuevas tecnologías
   - Adaptación a diferentes entornos
   - Mejora continua

### 🛠️ Herramientas & Tecnologías
- **Version Control**: Git, GitHub
- **IDEs**: VS Code, Android Studio
- **Testing**: Jest, Postman
- **Cloud Services**: Railway, GitHub Pages
- **Design**: Figma, Material Design 