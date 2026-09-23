import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Playlist, usePlaylists } from "../context/PlaylistContext";
import { auth } from "./services/firebaseConfig";

export default function PlaylistScreen({ navigation }: any) {
  const { playlists, addPlaylist, updatePlaylist, deletePlaylist: deletePlaylistContext } = usePlaylists();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [genreInput, setGenreInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [moodInput, setMoodInput] = useState("");
  const [formError, setFormError] = useState(""); // Novo estado de erro
  const [deleteId, setDeleteId] = useState<string | null>(null);
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

  const openAddModal = () => {
    setEditingId(null);
    setNameInput("");
    setDescInput("");
    setGenreInput("");
    setAuthorInput("");
    setMoodInput("");
    setFormError(""); // Limpa o erro ao abrir o modal
    setModalVisible(true);
  };

  const openEditModal = (playlist: Playlist) => {
    setEditingId(playlist.id);
    setNameInput(playlist.name);
    setDescInput(playlist.description);
    setGenreInput(playlist.genre);
    setAuthorInput(playlist.author);
    setMoodInput(playlist.mood);
    setFormError(""); // Limpa o erro ao abrir o modal
    setModalVisible(true);
  };

  const savePlaylist = () => {
    if (!nameInput.trim() || !descInput.trim() || !genreInput.trim() || !authorInput.trim() || !moodInput.trim()) {
      setFormError("Todos os campos devem ser preenchidos.");
      return;
    }
    
    setFormError(""); // Limpa o erro em caso de sucesso

    const playlistData = {
      name: nameInput,
      description: descInput,
      genre: genreInput,
      author: authorInput,
      mood: moodInput
    };

    if (editingId) {
      updatePlaylist(editingId, playlistData);
    } else {
      addPlaylist(playlistData);
    }
    setModalVisible(false);
  };

  const deletePlaylist = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deletePlaylistContext(deleteId);
      setDeleteId(null);
    }
  };

  const renderItem = ({ item }: { item: Playlist }) => (
    <View style={styles.playlistCard}>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.playlistDesc}>{item.description}</Text>
        <Text style={styles.playlistMeta}>Gênero: {item.genre || "-"} | Autor: {item.author || "-"}</Text>
        <Text style={styles.playlistMeta}>Clima: {item.mood || "-"}</Text>
      </View>
      <View style={styles.playlistActions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
          <Ionicons name="pencil" size={20} color="#858585" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deletePlaylist(item.id)} style={styles.actionButton}>
          <Ionicons name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.title}>Playlists</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* LISTA DE PLAYLISTS */}
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma playlist criada.</Text>
          </View>
        }
      />

      {/* MODAL DE CRUD */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingId ? "Editar Playlist" : "Nova Playlist"}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Nome da Playlist *"
                placeholderTextColor="#858585"
                value={nameInput}
                onChangeText={(t) => { setNameInput(t); if(formError) setFormError(""); }}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Descrição"
                placeholderTextColor="#858585"
                value={descInput}
                onChangeText={(t) => { setDescInput(t); if(formError) setFormError(""); }}
              />

              <TextInput
                style={styles.input}
                placeholder="Gênero"
                placeholderTextColor="#858585"
                value={genreInput}
                onChangeText={(t) => { setGenreInput(t); if(formError) setFormError(""); }}
              />

              <TextInput
                style={styles.input}
                placeholder="Autor/Criador"
                placeholderTextColor="#858585"
                value={authorInput}
                onChangeText={(t) => { setAuthorInput(t); if(formError) setFormError(""); }}
              />

              <TextInput
                style={styles.input}
                placeholder="Clima (ex: Focado, Relax)"
                placeholderTextColor="#858585"
                value={moodInput}
                onChangeText={(t) => { setMoodInput(t); if(formError) setFormError(""); }}
              />
              
              {formError !== "" && (
                <Text style={styles.errorText}>{formError}</Text>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={savePlaylist}
                >
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <Modal
        visible={!!deleteId}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingVertical: 30, alignItems: "center" }]}>
            <Ionicons name="trash-outline" size={50} color="#E05A47" style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>Excluir Playlist</Text>
            <Text style={{ color: "#A7A7A7", fontSize: 14, textAlign: "center", marginBottom: 25 }}>
              Tem certeza que deseja excluir esta playlist? Essa ação não pode ser desfeita.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setDeleteId(null)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: "#E05A47" }]} onPress={confirmDelete}>
                <Text style={styles.saveButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
      <Modal
        visible={logoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingVertical: 30, alignItems: "center" }]}>
            <Ionicons name="log-out-outline" size={50} color="#8B5CF6" style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>Sair da conta</Text>
            <Text style={{ color: "#A7A7A7", fontSize: 14, textAlign: "center", marginBottom: 25 }}>
              Tem certeza que deseja encerrar a sessão?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setLogoutModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: "#8B5CF6" }]} onPress={handleLogout}>
                <Text style={styles.saveButtonText}>Sair</Text>
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
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="list" size={24} color="#FFFFFF" />
          <Text style={styles.tabTextActive}>Playlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Api")}>
          <Ionicons name="code-slash-outline" size={24} color="#858585" />
          <Text style={styles.tabText}>API</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={24} color="#858585" />
          <Text style={styles.tabText}>Sair</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: "#8B5CF6",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  playlistCard: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  playlistDesc: {
    color: "#A7A7A7",
    fontSize: 13,
    marginBottom: 6,
  },
  playlistMeta: {
    color: "#858585",
    fontSize: 11,
    marginTop: 2,
  },
  playlistActions: {
    flexDirection: "row",
    marginLeft: 15,
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    color: "#858585",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContent: {
    width: "100%",
    maxHeight: "100%",
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1C1C1E",
    color: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  errorText: {
    color: "#E05A47",
    fontSize: 12,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#404040",
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#8B5CF6",
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
