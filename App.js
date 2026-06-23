import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

import AcademiasScreen from './src/screens/AcademiasScreen';
import CheckinsScreen from './src/screens/CheckinsScreen';
import PerfilScreen from './src/screens/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Academias') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Historico') iconName = focused ? 'calendar' : 'calendar-outline';
            else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Academias" component={AcademiasScreen} />
        <Tab.Screen name="Historico" component={CheckinsScreen} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}