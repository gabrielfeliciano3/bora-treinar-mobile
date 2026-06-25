import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import BotaoCustomizado from '../components/BotaoCustomizado';


const IP_DO_SEU_PC = '192.168.0.2';

export default function CheckinsScreen() {
  const [listaCheckins, setListaCheckins] = useState([]);

  const carregarHistorico = async () => {
    try {
      const urlBackend = `http://${IP_DO_SEU_PC}:3000/checkins`;
      const response = await axios.get(urlBackend);
      setListaCheckins(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os check-ins do servidor Node.');
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.botaoAtualizar} onPress={carregarHistorico}>
        <Text style={styles.textoBotao}> Atualizar Histórico</Text>
      </TouchableOpacity>

      {listaCheckins.length === 0 ? (
        <Text style={styles.vazio}>Nenhum treino registrado no banco ainda.</Text>
      ) : (
        <FlatList 
          data={listaCheckins}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>{item.academiaNome}</Text>
              <Text style={styles.aluno}>Atleta: {item.usuario}</Text>
              <Text style={styles.data}>{item.dataHora}</Text>
              <Text style={styles.gps}>Local: {item.bairroReal}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  botaoAtualizar: { backgroundColor: '#4f46e5', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
  vazio: { textAlign: 'center', marginTop: 50, fontSize: 15, color: '#94a3b8' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#10b981', elevation: 1 },
  nome: { fontWeight: 'bold', fontSize: 16, color: '#0f172a' },
  aluno: { color: '#475569', marginTop: 4 },
  data: { color: '#64748b', fontSize: 12, marginTop: 4 },
  gps: { color: '#94a3b8', fontSize: 11, marginTop: 2 }
});