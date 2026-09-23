import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import { Modal, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "./services/firebaseConfig";

export default function SearchScreen({ navigation }: any) {
  const [logoutModal, setLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      console.log("Erro ao sair", error);
    }
  };

  const confirmLogout = () => {
    setLogoutModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* CABEÇALHO E BARRA DE BUSCA */}
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#858585" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="O que você quer ouvir?"
            placeholderTextColor="#858585"
          />
        </View>
      </View>

      {/* CONTEÚDO PRINCIPAL VAZIO POR ENQUANTO */}
      <View style={styles.content}>
        <Text style={styles.emptyText}>Procure por artistas, músicas ou podcasts</Text>
      </View>

      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
      <Modal
        visible={logoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <View style={{ width: "100%", backgroundColor: "#2A2A2A", borderRadius: 16, padding: 20, paddingVertical: 30, alignItems: "center" }}>
            <Ionicons name="log-out-outline" size={50} color="#8B5CF6" style={{ marginBottom: 15 }} />
            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Sair da conta</Text>
            <Text style={{ color: "#A7A7A7", fontSize: 14, textAlign: "center", marginBottom: 25 }}>
              Tem certeza que deseja encerrar a sessão?
            </Text>
            
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <TouchableOpacity style={{ flex: 1, padding: 15, alignItems: "center", marginRight: 10, backgroundColor: "#404040", borderRadius: 8 }} onPress={() => setLogoutModal(false)}>
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{ flex: 1, padding: 15, alignItems: "center", marginLeft: 10, backgroundColor: "#8B5CF6", borderRadius: 8 }} onPress={handleLogout}>
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MENU INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={24} color="#858585" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
          <Text style={styles.tabTextActive}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Playlist")}>
          <Ionicons name="list" size={24} color="#858585" />
          <Text style={styles.tabText}>Playlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Api")}>
          <Ionicons name="code-slash-outline" size={24} color="#858585" />
          <Text style={styles.tabText}>API</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={24} color="#858585" />
          <Text style={styles.tabText}>Encerrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    height: "100%",
    outlineStyle: "none" as any,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyText: {
    color: "#A7A7A7",
    fontSize: 14,
    textAlign: "center",
  },
  bottomBar: {
    height: 60,
    backgroundColor: "rgba(12, 12, 12, 0.98)",
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

