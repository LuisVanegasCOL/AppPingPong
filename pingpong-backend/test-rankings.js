const axios = require('axios');

const API_URL = 'http://localhost:8080';

async function testRankings() {
  try {
    // 1. Crear jugadores
    console.log('📝 Creando jugadores...');
    const jugadores = [
      { name: 'Juan Pérez' },
      { name: 'María García' },
      { name: 'Carlos López' }
    ];

    const jugadoresIds = [];
    for (const jugador of jugadores) {
      const response = await axios.post(`${API_URL}/players`, jugador);
      jugadoresIds.push(response.data.id);
      console.log(`✅ Jugador creado: ${jugador.name} (ID: ${response.data.id})`);
    }

    // 2. Crear un torneo
    console.log('\n📝 Creando torneo...');
    const torneoResponse = await axios.post(`${API_URL}/torneos`, {
      nombre: 'Torneo de Prueba',
      fecha_inicio: '2024-03-20',
      fecha_fin: '2024-03-25',
      estado: 'activo'
    });
    const torneoId = torneoResponse.data.id_torneo;
    console.log('✅ Torneo creado con ID:', torneoId);

    // 3. Crear rankings para los jugadores
    const rankings = [
      { id_jugador: jugadoresIds[0], partidas_ganadas: 5, partidas_perdidas: 2 },
      { id_jugador: jugadoresIds[1], partidas_ganadas: 4, partidas_perdidas: 3 },
      { id_jugador: jugadoresIds[2], partidas_ganadas: 6, partidas_perdidas: 1 }
    ];

    console.log('\n📝 Agregando rankings...');
    for (const ranking of rankings) {
      await axios.post(`${API_URL}/rankings`, {
        id_torneo: torneoId,
        ...ranking
      });
      console.log(`✅ Ranking agregado para jugador ID ${ranking.id_jugador}`);
    }

    // 4. Ver rankings del torneo
    console.log('\n📊 Rankings del torneo:');
    const rankingsResponse = await axios.get(`${API_URL}/rankings/torneo/${torneoId}`);
    console.table(rankingsResponse.data.map(r => ({
      Posición: r.posicion,
      Jugador: r.nombre_jugador,
      'Partidas Ganadas': r.partidas_ganadas,
      'Partidas Perdidas': r.partidas_perdidas,
      'Total Partidas': r.total_partidas,
      '% Victorias': r.porcentaje_victorias
    })));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Ejecutar el test
testRankings(); 