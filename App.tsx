// Arq que contem as rotas do app, ou seja, a navegação entre as telas que o user podera acessar
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar"; // <-- Adicionado para controlar a barra de status

// Importa todas a telas do app
import LoginScreen from "./src/screen/login_screen";
import RegisterScreen from "./src/screen/register_screen";
import SplashScreen from "./src/screen/splash_screen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* "light" deixa os ícones do topo do celular brancos, combinando com o fundo escuro */}
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}