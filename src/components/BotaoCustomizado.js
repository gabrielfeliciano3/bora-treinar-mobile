import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function BotaoCheckin({ onPress, texto }) {
  return (
    <TouchableOpacity style={styles.btnCheckin} onPress={onPress}>
      <Text style={styles.btnCheckinText}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnCheckin: { backgroundColor: '#008000', padding: 10, borderRadius: 6, alignItems: 'center' },
  btnCheckinText: { color: '#fff', fontWeight: 'bold' }
});
