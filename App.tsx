// Arq que contem as rotas do app, ou seja, a navegação entre as telas que o user podera acessar
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar"; // <-- Adicionado para controlar a barra de status
import React from "react";

// Importa todas a telas do app
import ApiScreen from "./src/screen/api_screen";
import HomeScreen from "./src/screen/home_screen";
import LoginScreen from "./src/screen/login_screen";
import PlaylistScreen from "./src/screen/playlist_screen";
import RegisterScreen from "./src/screen/register_screen";
import SearchScreen from "./src/screen/search_screen";
import SplashScreen from "./src/screen/splash_screen";

import { PlaylistProvider } from "./src/context/PlaylistContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PlaylistProvider>
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
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Api" component={ApiScreen} />
          <Stack.Screen name="Playlist" component={PlaylistScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PlaylistProvider>
  );
}