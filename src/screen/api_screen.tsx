import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import { Modal, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "./services/firebaseConfig";

export default function ApiScreen({ navigation }: any) {
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

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.title}>Integração API</Text>
      </View>

      {/* CONTEÚDO PRINCIPAL VAZIO POR ENQUANTO */}
      <View style={styles.content}>
        <Ionicons name="code-slash-outline" size={60} color="#8B5CF6" style={{ marginBottom: 20 }} />
        <Text style={styles.infoText}>Aqui você poderá configurar integrações com APIs externas para trazer mais músicas e dados.</Text>
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
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Search")}>
          <Ionicons name="search" size={24} color="#858585" />
          <Text style={styles.tabText}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Playlist")}>
          <Ionicons name="list" size={24} color="#858585" />
          <Text style={styles.tabText}>Playlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="code-slash" size={24} color="#FFFFFF" />
          <Text style={styles.tabTextActive}>API</Text>
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
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  infoText: {
    color: "#A7A7A7",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
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

