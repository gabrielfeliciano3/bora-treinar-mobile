import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const IP_DO_SEU_PC = '192.168.0.2'; 

export default function PerfilScreen() {
  const [totalTreinos, setTotalTreinos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarContador();
  }, []);

  const carregarContador = async () => {
    try {
      const response = await axios.get(`http://${IP_DO_SEU_PC}:3000/checkins`);
      setTotalTreinos(response.data.length);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>GC</Text>
        </View>
        <Text style={styles.nome}>Gabriel Feliciano</Text>
        <Text style={styles.status}>Usuário Verificado</Text>

        <View style={styles.divisor} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            {loading ? <ActivityIndicator size="small" /> : <Text style={styles.statValue}>{totalTreinos}</Text>}
            <Text style={styles.statLabel}>Treinos Realizados</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalTreinos * 30}</Text>
            <Text style={styles.statLabel}>Kcal Estimadas</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 20 },
  header: { marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#0284c7', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  nome: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  status: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  divisor: { width: '100%', height: 1, backgroundColor: '#e2e8f0', marginVertical: 10 },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 10 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#0284c7' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: '500' }
});