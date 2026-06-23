import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, 
  ActivityIndicator, SafeAreaView, StatusBar, TextInput, Linking 
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import BotaoCustomizado from '../components/BotaoCustomizado';

// =========================================================
// 🚨 GABRIEL: COLOQUE O SEU IP DO CMD AQUI:
const IP_DO_SEU_PC = '192.168.0.2'; 

// LINK OFICIAL DA API DO RECIFE:
const URL_API_RECIFE = 'https://dados.recife.pe.gov.br/api/3/action/datastore_search?resource_id=db9cfac3-a78b-43d5-9f5e-0fb26220364e';
// =========================================================

export default function AcademiasScreen({ navigation }) {
  const [academias, setAcademias] = useState([]);
  const [localizacao, setLocalizacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*rad) * Math.cos(lat2*rad) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  useEffect(() => {
    buscarDadosPrefeitura();
    capturarGps();
  }, []);

  const buscarDadosPrefeitura = async () => {
    try {
      const resposta = await axios.get(URL_API_RECIFE);
      setAcademias(resposta.data?.result?.records || []);
      setLoading(false);
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível carregar as academias da Prefeitura.");
      setLoading(false);
    }
  };

  const capturarGps = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    let local = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setLocalizacao({ latitude: local.coords.latitude, longitude: local.coords.longitude });
  };

  const listaExibida = useMemo(() => {
    if (academias.length === 0) return [];

    const listaComMetros = academias.map(polo => {
      const lat = parseFloat(String(polo.latitude || polo.lat || '').replace(',', '.'));
      const lon = parseFloat(String(polo.longitude || polo.lon || polo.lng || '').replace(',', '.'));
      let metros = null;
      if (!isNaN(lat) && !isNaN(lon) && localizacao) {
        metros = calcularDistancia(localizacao.latitude, localizacao.longitude, lat, lon);
      }
      return { ...polo, distanciaReal: metros };
    });

    const textoBusca = searchText.toLowerCase().trim();
    const listaFiltrada = listaComMetros.filter(item => {
      const nome = (item.nome || item.polo || '').toLowerCase();
      const bairro = (item.bairro || '').toLowerCase();
      return nome.includes(textoBusca) || bairro.includes(textoBusca);
    });

    return listaFiltrada.sort((a, b) => (a.distanciaReal || 999999) - (b.distanciaReal || 999999));
  }, [academias, localizacao, searchText]);

  const formatarDistancia = (metros) => {
    if (!metros) return '';
    return metros < 1000 ? `${Math.round(metros)} m` : `${(metros / 1000).toFixed(1)} km`;
  };

  // =========================================================
  // FUNÇÃO DE ROTA (O SEU DEEP LINK PRO GOOGLE MAPS)
  // =========================================================
  const abrirGoogleMaps = (latDestino, lonDestino, modoTransporte) => {
    if (!localizacao) {
      Alert.alert('Calma aí', 'Ainda estamos triangulando seu GPS...');
      return;
    }

    // travelmode=walking ou travelmode=driving
    const url = `https://www.google.com/maps/dir/?api=1&origin=${localizacao.latitude},${localizacao.longitude}&destination=${latDestino},${lonDestino}&travelmode=${modoTransporte}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o mapa no seu celular.');
    });
  };

  const dispararOpcaoRota = (itemPolo) => {
    const latStr = String(itemPolo.latitude || itemPolo.lat || '').replace(',', '.');
    const lonStr = String(itemPolo.longitude || itemPolo.lon || itemPolo.lng || '').replace(',', '.');
    
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert('Indisponível', 'A Prefeitura não cadastrou as coordenadas GPS exatas deste polo.');
      return;
    }

    const nome = itemPolo.nome || itemPolo.polo || 'este polo';

    Alert.alert(
      `Rota para ${nome}`,
      'Como você deseja ir?',
      [
        { text: '🚶 A pé', onPress: () => abrirGoogleMaps(lat, lon, 'walking') },
        { text: '🚗 De carro', onPress: () => abrirGoogleMaps(lat, lon, 'driving') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const fazerCheckin = async (nomeAcademia) => {
    if (!localizacao) {
      Alert.alert('Calma', 'Aguardando sinal do GPS...');
      return;
    }

    try {
      // Traduzindo coordenada para endereço
      let enderecoInfo = await Location.reverseGeocodeAsync({
        latitude: localizacao.latitude,
        longitude: localizacao.longitude
      });

      // Pega o nome do bairro, se não achar, pega o nome da cidade
      const localFormatado = enderecoInfo[0]?.subregion || enderecoInfo[0]?.city || "Recife";

      // Dispara o POST enviando o nome do bairro traduzido
      await axios.post(`http://${IP_DO_SEU_PC}:3000/checkins`, {
        usuario: "Gabriel Costa",
        academiaNome: nomeAcademia,
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
        bairroReal: localFormatado // <--- Novo campo enviado
      });

      Alert.alert('Check-in feito! 🏆', `Você está treinando em: ${localFormatado}`);
    } catch (err) {
      Alert.alert('Erro', `Falha ao registrar check-in: ${err.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.tituloApp}>Academias Próximas</Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Pesquisar por polo ou bairro..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#059669" style={{ marginTop: 100 }} />
        ) : (
          <FlatList 
            data={listaExibida}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const nome = item.nome || item.polo || "Academia Recife";
              const bairro = item.bairro || "Recife";
              const endereco = item.logradouro || item.endereco || "Endereço público";

              return (
                <View style={styles.card}>
                  
                  <View style={styles.cardTop}>
                    <View style={styles.infoLeft}>
                      <Text style={styles.cardTitle}>{nome}</Text>
                      <Text style={styles.cardRating}>★ 4.8 <Text style={styles.subText}>| Polo Gratuito</Text></Text>
                    </View>

                    {item.distanciaReal && (
                      <View style={styles.pill}>
                        <Text style={styles.pillText}>{formatarDistancia(item.distanciaReal)}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.address}>{endereco} ({bairro})</Text>

                  {/* RODAPÉ DO CARTÃO COM OS 2 BOTÕES LADO A LADO */}
                  <View style={styles.cardBottom}>
                    <Text style={styles.status}>Aberto até 21:00</Text>
                    
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.btnRota}
                        onPress={() => dispararOpcaoRota(item)}
                      >
                        <Text style={styles.btnRotaText}>Rota</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.btnCheckin}
                        onPress={() => fazerCheckin(nome)}
                      >
                        <Text style={styles.btnCheckinText}>Check-in</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                </View>
              );
            }}
          />
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tituloApp: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  linkHistorico: { fontSize: 14, fontWeight: '700', color: '#059669', backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 18, borderWidth: 1, borderColor: '#e2e8f0' },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#1e293b' },

  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f1f5f9', elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoLeft: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  cardRating: { fontSize: 12, fontWeight: '700', color: '#d97706' },
  subText: { color: '#64748b', fontWeight: '400' },

  pill: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  pillText: { fontSize: 12, fontWeight: '700', color: '#059669' },

  address: { fontSize: 13, color: '#64748b', marginVertical: 10 },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  status: { fontSize: 12, fontWeight: '700', color: '#059669' },
  
  // Agrupador dos botões Rota e Checkin
  actionButtons: { flexDirection: 'row', gap: 8 },
  
  btnRota: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  btnRotaText: { fontSize: 12, fontWeight: '700', color: '#475569' },

  btnCheckin: { backgroundColor: '#059669', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  btnCheckinText: { fontSize: 12, fontWeight: '700', color: '#ffffff' }
});