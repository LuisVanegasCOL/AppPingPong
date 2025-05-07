-- Tabla de usuarios
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de jugadores
CREATE TABLE players (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    victories INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de partidas
CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    player1_id BIGINT REFERENCES players(id),
    player2_id BIGINT REFERENCES players(id),
    player1_result VARCHAR(10),
    player2_result VARCHAR(10),
    match_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    winner_id BIGINT REFERENCES players(id)
);

-- Tabla de torneos
CREATE TABLE torneos (
    id_torneo BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(50)
);

-- Tabla de rankings
CREATE TABLE rankings (
    id_rankings BIGSERIAL PRIMARY KEY,
    id_torneo BIGINT REFERENCES torneos(id_torneo),
    id_jugador BIGINT REFERENCES players(id),
    posicion INTEGER,
    partidas_ganadas INTEGER DEFAULT 0,
    partidas_perdidas INTEGER DEFAULT 0
);

-- Insertar usuario administrador por defecto
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')
ON CONFLICT (username) DO NOTHING; 