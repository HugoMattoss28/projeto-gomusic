import React, { useState, useEffect } from "react";
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
  Modal, // Importação necessária
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }: any) {
  // =====================================================
  // ESTADOS E LÓGICA DO MODO PREMIUM
  // =====================================================
  
  // Controla se a tela flutuante (Modal) está visível ou não
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // useEffect para disparar o aviso após um tempo
  useEffect(() => {
    // Simulando o Spotify: Espera 3 segundos após carregar a Home e mostra o Premium
    const timer = setTimeout(() => {
      setShowPremiumModal(true);
    }, 3000); 

    // Limpeza do timer caso o usuário saia da tela antes dos 3 segundos
    return () => clearTimeout(timer);
  }, []);

  // =====================================================
  // DADOS FAKES (MANTIDOS DAS VERSÕES ANTERIORES)
  // =====================================================
  const recomendados = [
    { id: "1", title: "Starboy", artist: "The Weeknd", image: require("../../assets/imagens/3.jpeg"),  },
    { id: "2", title: "CAOS", artist: "Alee", image: require("../../assets/imagens/2.jpeg"), },
    { id: "3", title: "Ausência", artist: "Veigh", image: require("../../assets/imagens/1.jpeg"), },
  ];

  const playlists = [
    { id: "4", title: "Trap & Phonk", artist: "Veigh, NBSPLV...", color: "#8B5CF6" },
    { id: "5", title: "Foco total", artist: "Instrumental", color: "#10B981" },
  ];

  // =====================================================
  // INTERFACE PRINCIPAL
  // =====================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* CONTEÚDO DA HOME (ScrollView) */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        
        {/* CABEÇALHO */}
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

        {/* SEÇÃO: TOCADAS RECENTEMENTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tocadas recentemente</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {recomendados.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <Image source={item.image} style={styles.albumCover} />
                <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.albumArtist} numberOfLines={1}>{item.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SEÇÃO: FEITO PARA VOCÊ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feito para você</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {playlists.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <View style={[styles.albumCover, { backgroundColor: item.color, justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="musical-notes" size={40} color="#FFFFFF" style={{ opacity: 0.5 }} />
                </View>
                <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.albumArtist} numberOfLines={1}>{item.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* MINI PLAYER FLUTUANTE */}
      <TouchableOpacity style={styles.miniPlayer} activeOpacity={0.9}>
        <View style={styles.miniPlayerContent}>
          <View style={styles.miniPlayerLeft}>
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

      {/* MENU INFERIOR (BOTTOM TABS FAKE) */}
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

      {/* =====================================================
          TELA FLUTUANTE PREMIUM (MODAL) - O SEU PEDIDO
          ===================================================== */}
      <Modal
        visible={showPremiumModal} // Controla a visibilidade
        transparent={true} // Fundo transparente para ver a Home atrás
        animationType="slide" // Animação subindo
        onRequestClose={() => setShowPremiumModal(false)} // Para Android back button
      >
        {/* CONTAINER DO OVERLAY (Fundo escuro semi-transparente) */}
        <View style={styles.modalOverlay}>
          
          {/* CARTÃO DO MODAL (Conteúdo Premium) */}
          <View style={styles.modalContent}>
            
            {/* Botão Fechar (X) */}
            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setShowPremiumModal(false)}
            >
              <Ionicons name="close" size={28} color="#A7A7A7" />
            </TouchableOpacity>

            {/* Ícone ou Ilustração Premium */}
            <View style={styles.premiumIconContainer}>
              <MaterialIcons name="workspace-premium" size={80} color="#8B5CF6" />
              {/* Efeito de brilho neon atrás do ícone */}
              <View style={styles.premiumGlow} />
            </View>

            {/* Textos */}
            <Text style={styles.premiumTitle}>Mude para o goMusic Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Curta músicas sem anúncios, modo offline e qualidade de áudio superior.
            </Text>

            {/* Lista de Benefícios (Simulando o Spotify) */}
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                <Text style={styles.benefitText}>Músicas sem interrupções de anúncios</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                <Text style={styles.benefitText}>Baixe para ouvir offline onde quiser</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                <Text style={styles.benefitText}>Áudio em altíssima qualidade (320kbps)</Text>
              </View>
            </View>

            {/* BOTÃO DE AÇÃO PREMIUM NEON (PÍLULA) */}
            <TouchableOpacity style={styles.subscribeButton} activeOpacity={0.8}>
              <Text style={styles.subscribeButtonText}>ASSINAR AGORA</Text>
            </TouchableOpacity>

            {/* Botão "Talvez mais tarde" */}
            <TouchableOpacity 
              style={styles.laterButton} 
              onPress={() => setShowPremiumModal(false)}
            >
              <Text style={styles.laterButtonText}>Talvez mais tarde</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// =====================================================
// ESTILOS
// =====================================================
const styles = StyleSheet.create({
  // ... (Estilos da Home mantidos das versões anteriores) ...
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, marginBottom: 25 },
  greeting: { fontSize: 24, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.5 },
  headerIcons: { flexDirection: "row" },
  iconButton: { marginLeft: 15 },
  section: { marginBottom: 35 },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginBottom: 15, paddingHorizontal: 20, letterSpacing: -0.5 },
  horizontalScroll: { paddingLeft: 20, paddingRight: 5 },
  card: { width: 150, marginRight: 15 },
  albumCover: { width: 150, height: 150, backgroundColor: "#282828", marginBottom: 10, borderRadius: 4 },
  albumTitle: { fontSize: 13, fontWeight: "700", color: "#FFFFFF", marginBottom: 4 },
  albumArtist: { fontSize: 13, color: "#A7A7A7", fontWeight: "500" },
  miniPlayer: { position: "absolute", bottom: 65, left: 10, right: 10, backgroundColor: "#2A2A2A", borderRadius: 8, overflow: "hidden", elevation: 5 },
  miniPlayerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 8 },
  miniPlayerLeft: { flexDirection: "row", alignItems: "center" },
  miniPlayerImage: { width: 40, height: 40, borderRadius: 4, marginRight: 12 },
  miniPlayerTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  miniPlayerArtist: { color: "#A7A7A7", fontSize: 12 },
  miniPlayerControls: { flexDirection: "row", alignItems: "center", paddingRight: 10 },
  progressBar: { height: 2, backgroundColor: "#404040", width: "100%" },
  progressFill: { height: "100%", backgroundColor: "#FFFFFF", width: "35%" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60, backgroundColor: "rgba(12, 12, 12, 0.98)", flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopWidth: 0 },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabTextActive: { color: "#FFFFFF", fontSize: 10, marginTop: 4, fontWeight: "600" },
  tabText: { color: "#858585", fontSize: 10, marginTop: 4 },

  // =====================================================
  // NOVO: ESTILOS DO MODAL PREMIUM
  // =====================================================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)", // Fundo escuro atrás do modal
    justifyContent: "center", // Centraliza o cartão verticalmente
    alignItems: "center", // Centraliza o cartão horizontalmente
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#1C1C1E", // Cinza bem escuro para o cartão
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
    elevation: 20, // Sombra Android
    shadowColor: "#000", // Sombra iOS
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  closeModalButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  premiumIconContainer: {
    marginTop: 20,
    marginBottom: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    backgroundColor: "#8B5CF6", // Roxo base
    borderRadius: 50,
    opacity: 0.2, // Mantém suave
    
    // SUBSTITUÍMOS O blurRadius POR SOMBRAS (No View)
    // Funciona super bem no iOS para fazer Glow
    shadowColor: "#8B5CF6", // Mesma cor do roxo
    shadowOffset: { width: 0, height: 0 }, // Sombra centralizada
    shadowOpacity: 1, // Full opacidade na sombra para destacar
    shadowRadius: 20, // Esse cria o efeito de blur suave no iOS
    
    // Configuração básica para Android não ignorar totalmente
    elevation: 5, 
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "#A7A7A7",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  benefitsList: {
    width: "100%",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 13,
    color: "#FFFFFF",
    marginLeft: 10,
    fontWeight: "600",
  },
  subscribeButton: {
    width: "100%",
    height: 55,
    backgroundColor: "#8B5CF6", // Roxo goMusic
    borderRadius: 30, // Formato pílula
    alignItems: "center",
    justifyContent: "center",
    // Efeito Neon de sombra
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 15,
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  laterButton: {
    padding: 10,
  },
  laterButtonText: {
    color: "#A7A7A7",
    fontSize: 13,
    fontWeight: "700",
  },
});