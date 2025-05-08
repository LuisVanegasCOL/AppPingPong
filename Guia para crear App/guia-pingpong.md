# Guía Completa para Desarrollar una Aplicación de Ping Pong
## Índice

### Parte 1: Fundamentos
1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Estructura del Proyecto](#estructura-del-proyecto)

### Parte 2: Desarrollo Backend
4. [Configuración del Backend](#configuración-del-backend)
5. [Base de Datos](#base-de-datos)
6. [Autenticación y Seguridad](#autenticación-y-seguridad)
7. [APIs y Endpoints](#apis-y-endpoints)

### Parte 3: Desarrollo Frontend
8. [Configuración del Frontend](#configuración-del-frontend)
9. [Componentes y Pantallas](#componentes-y-pantallas)
10. [Gestión de Estado](#gestión-de-estado)
11. [Navegación](#navegación)

### Parte 4: Funcionalidades Principales
12. [Sistema de Rankings](#sistema-de-rankings)
13. [Gestión de Partidos](#gestión-de-partidos)
14. [Perfiles de Usuario](#perfiles-de-usuario)

### Parte 5: Calidad y Optimización
15. [Testing](#testing)
16. [Optimización de Rendimiento](#optimización-de-rendimiento)
17. [Manejo de Errores](#manejo-de-errores)

### Parte 6: Despliegue y Mantenimiento
18. [Despliegue](#despliegue)
19. [Monitoreo y Logging](#monitoreo-y-logging)
20. [Mantenimiento](#mantenimiento)

### Parte 7: Mejores Prácticas
21. [Documentación](#documentación)
22. [CI/CD](#cicd)
23. [Seguridad](#seguridad)
24. [Checklist de Despliegue](#checklist-de-despliegue)

---

## Introducción

Esta guía proporciona una explicación detallada de cómo desarrollar una aplicación de ping pong completa, desde la configuración inicial hasta el despliegue en producción. Cada sección incluye ejemplos prácticos y mejores prácticas.

## Requisitos Previos

### Herramientas Necesarias
- Node.js (versión 14 o superior)
- npm o yarn
- PostgreSQL
- Git
- Cuenta en Railway (backend)
- Cuenta en Vercel (frontend)

### Verificación de Instalaciones
```bash
# Verificar Node.js
node --version
# Debería mostrar v14.x.x o superior

# Verificar npm
npm --version
# Debería mostrar 6.x.x o superior

# Verificar PostgreSQL
psql --version
# Debería mostrar 12.x o superior
```

## Estructura del Proyecto

### Organización de Carpetas
```
pingpong-app/
├── src/
│   ├── components/
│   │   ├── MatchCard.tsx
│   │   └── PlayerStats.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── utils/
│       └── api.ts
└── package.json

pingpong-backend/
├── routes/
│   ├── matches.js
│   └── users.js
├── config/
│   └── database.js
└── server.js
```

## Configuración del Backend

### Inicialización del Proyecto
```bash
mkdir pingpong-backend
cd pingpong-backend
npm init -y
```

### Dependencias Principales
```bash
npm install express pg bcrypt jsonwebtoken cors dotenv
```

### Servidor Básico
```javascript
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});
```

## Base de Datos

### Esquema de Base de Datos
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT false
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    player1_id INTEGER REFERENCES users(id),
    player2_id INTEGER REFERENCES users(id),
    score1 INTEGER,
    score2 INTEGER,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Autenticación y Seguridad

### Implementación de JWT
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (username, password) => {
    const user = await db.users.findOne({ username });
    if (!user) throw new Error('Usuario no encontrado');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta');

    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { token, user };
};
```

## Configuración del Frontend

### Creación del Proyecto
```bash
npx create-expo-app pingpong-app
cd pingpong-app
```

### Dependencias Frontend
```bash
npm install @react-navigation/native @react-navigation/stack axios react-native-paper
```

### Estructura de Navegación
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen}
                    options={{ title: 'Ping Pong App' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
```

## Componentes y Pantallas

### Componente de Partido
```typescript
interface MatchProps {
    player1: string;
    player2: string;
    score: [number, number];
    date: Date;
}

const Match: React.FC<MatchProps> = ({ player1, player2, score, date }) => {
    return (
        <View style={styles.matchContainer}>
            <Text style={styles.players}>
                {player1} vs {player2}
            </Text>
            <Text style={styles.score}>
                {score[0]} - {score[1]}
            </Text>
            <Text style={styles.date}>
                {new Date(date).toLocaleDateString()}
            </Text>
        </View>
    );
};
```

## Sistema de Rankings

### Cálculo ELO
```typescript
const calculateELO = (player1Rating: number, player2Rating: number, winner: 1 | 2) => {
    const K = 32;
    const expected1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));
    const expected2 = 1 - expected1;
    
    const actual1 = winner === 1 ? 1 : 0;
    const actual2 = 1 - actual1;
    
    const newRating1 = player1Rating + K * (actual1 - expected1);
    const newRating2 = player2Rating + K * (actual2 - expected2);
    
    return {
        player1NewRating: Math.round(newRating1),
        player2NewRating: Math.round(newRating2)
    };
};
```

## Testing

### Pruebas Unitarias
```typescript
describe('Match Service', () => {
    test('should create new match', async () => {
        const match = {
            player1: 'John',
            player2: 'Jane',
            score1: 11,
            score2: 9
        };

        const result = await createMatch(match);
        expect(result).toHaveProperty('id');
        expect(result.player1).toBe('John');
    });
});
```

## Optimización de Rendimiento

### Memoización
```typescript
const MemoizedPlayerList = React.memo(({ players }) => {
    return (
        <FlatList
            data={players}
            renderItem={({ item }) => (
                <PlayerCard
                    key={item.id}
                    {...item}
                />
            )}
            keyExtractor={item => item.id.toString()}
        />
    );
});
```

## Despliegue

### Configuración de Entorno
```javascript
const config = {
    development: {
        apiUrl: 'http://localhost:3000',
        database: {
            host: 'localhost',
            port: 5432,
            name: 'pingpong_dev'
        }
    },
    production: {
        apiUrl: process.env.API_URL,
        database: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            name: process.env.DB_NAME
        }
    }
}[process.env.NODE_ENV || 'development'];
```

## Monitoreo y Logging

### Configuración de Winston
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

## Checklist de Despliegue

### Verificaciones Pre-despliegue
```javascript
const deploymentCheck = async () => {
    const checks = [
        {
            name: 'Tests',
            run: async () => {
                const result = await runTests();
                return result.passed;
            }
        },
        {
            name: 'Database',
            run: async () => {
                const connection = await db.connect();
                return connection.isConnected;
            }
        },
        {
            name: 'Environment',
            run: async () => {
                return process.env.NODE_ENV === 'production';
            }
        }
    ];

    for (const check of checks) {
        const passed = await check.run();
        console.log(`${check.name}: ${passed ? '✅' : '❌'}`);
    }
};
```

---

## Recursos Adicionales

- [Documentación de React Native](https://reactnative.dev/)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [Documentación de Railway](https://railway.app/)
- [Documentación de Vercel](https://vercel.com/docs)

## Conclusión

Esta guía proporciona una visión completa del desarrollo de una aplicación de ping pong, desde la configuración inicial hasta el despliegue en producción. Cada sección incluye ejemplos prácticos y mejores prácticas para asegurar un desarrollo exitoso. 