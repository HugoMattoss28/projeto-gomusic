import React from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function HomeScreen({ navigation }: any) {
  // =====================================================
  // DADOS COM AS SUAS IMAGENS
  // =====================================================
  // =====================================================
  // DADOS COM AS SUAS IMAGENS (LOCAL - SEM BUG DO SPOTIFY)
  // =====================================================
  const recomendados = [
    {
      id: "1",
      title: "Starboy",
      artist: "The Weeknd",
      image: require("../../assets/imagens/3.jpeg"), 
    },
    {
      id: "2",
      title: "CAOS",
      artist: "Alee",
      image: require("../../assets/imagens/2.jpeg"),
    },
    {
      id: "3",
      title: "Ausência",
      artist: "Veigh",
      image: require("../../assets/imagens/1.jpeg"),
    },
  ];

  const playlists = [
    { id: "4", title: "Trap & Phonk", artist: "Veigh, NBSPLV...", color: "#8B5CF6" },
    { id: "5", title: "Foco total", artist: "Instrumental", color: "#10B981" },
    { id: "6", title: "Top 50 Brasil", artist: "Os mais tocados", color: "#E05A47" },
  ];

  // =====================================================
  // INTERFACE
  // =====================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* CONTEÚDO PRINCIPAL (COM ESPAÇO NO FINAL PARA NÃO FICAR ATRÁS DO PLAYER) */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        
        {/* =================================================
            CABEÇALHO
            ================================================= */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Boa tarde</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* =================================================
            SEÇÃO: SEUS ÁLBUNS
            ================================================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tocadas recentemente</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {recomendados.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <Image source={item.image} style={styles.albumCover} />
                <Text style={styles.albumTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.albumArtist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* =================================================
            SEÇÃO: MIXES E PLAYLISTS
            ================================================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feito para você</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {playlists.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <View style={[styles.albumCover, { backgroundColor: item.color, justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="musical-notes" size={40} color="#FFFFFF" style={{ opacity: 0.5 }} />
                </View>
                <Text style={styles.albumTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.albumArtist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* =================================================
          MINI PLAYER FLUTUANTE
          ================================================= */}
      <TouchableOpacity style={styles.miniPlayer} activeOpacity={0.9}>
        <View style={styles.miniPlayerContent}>
          <View style={styles.miniPlayerLeft}>
           {/* Usando a imagem local no Mini Player */}
            <Image source={require("../../assets/imagens/1.jpeg")} style={styles.miniPlayerImage} />
            <View>
              <Text style={styles.miniPlayerTitle}>Novo Balanço</Text>
              <Text style={styles.miniPlayerArtist}>Veigh</Text>
            </View>
          </View>
          <View style={styles.miniPlayerControls}>
            <TouchableOpacity style={{ marginRight: 15 }}>
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="play" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </TouchableOpacity>

      {/* =================================================
          MENU INFERIOR (BOTTOM TABS FAKE)
          ================================================= */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={24} color="#FFFFFF" />
          <Text style={styles.tabTextActive}>Início</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="search" size={24} color="#858585" />
          <Text style={styles.tabText}>Buscar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="library-outline" size={24} color="#858585" />
          <Text style={styles.tabText}>Sua Biblioteca</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// =====================================================
// ESTILOS
// =====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Fundo super escuro padrao Spotify
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 25,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 15,
    paddingHorizontal: 20,
    letterSpacing: -0.5,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 5,
  },
  card: {
    width: 150,
    marginRight: 15,
  },
  albumCover: {
    width: 150,
    height: 150,
    backgroundColor: "#282828",
    marginBottom: 10,
    borderRadius: 4, // Borda leve
  },
  albumTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 13,
    color: "#A7A7A7",
    fontWeight: "500",
  },
  
  // -- ESTILOS DO MINI PLAYER --
  miniPlayer: {
    position: "absolute",
    bottom: 65, // Fica acima da barra inferior
    left: 10,
    right: 10,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 5,
  },
  miniPlayerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
  },
  miniPlayerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniPlayerImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  miniPlayerTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  miniPlayerArtist: {
    color: "#A7A7A7",
    fontSize: 12,
  },
  miniPlayerControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  progressBar: {
    height: 2,
    backgroundColor: "#404040",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    width: "35%", // Simula a música tocando
  },

  // -- ESTILOS DO MENU INFERIOR --
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(18, 18, 18, 0.95)", // Fundo meio transparente
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 0,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
  },
  tabText: {
    color: "#858585",
    fontSize: 10,
    marginTop: 4,
  },
});