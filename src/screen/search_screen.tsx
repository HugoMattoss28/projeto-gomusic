import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Playlist, usePlaylists } from "../context/PlaylistContext";
import { MusicaJson } from "../models/musica";
import { listarMusicas } from "../services/api";
import { userService } from "./services/userService";

type FiltroTipo = "tudo" | "playlists" | "musicas";

export default function SearchScreen({ navigation }: any) {
  const { playlists, carregarPlaylists } = usePlaylists();

  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>("tudo");
  const [musicas, setMusicas] = useState<MusicaJson[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [imagensComErro, setImagensComErro] = useState<Record<string, boolean>>({});
  const [logoutModal, setLogoutModal] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const carregarDadosIniciais = useCallback(async () => {
    try {
      setCarregando(true);
      const [listaMusicas] = await Promise.all([
        listarMusicas().catch(() => [] as MusicaJson[]),
        carregarPlaylists(),
      ]);
      setMusicas(listaMusicas);
    } finally {
      setCarregando(false);
    }
  }, [carregarPlaylists]);

  const atualizarLista = useCallback(async () => {
    try {
      setAtualizando(true);
      const [listaMusicas] = await Promise.all([
        listarMusicas().catch(() => [] as MusicaJson[]),
        carregarPlaylists(),
      ]);
      setMusicas(listaMusicas);
    } finally {
      setAtualizando(false);
    }
  }, [carregarPlaylists]);

  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  const handleLogout = async () => {
    try {
      await userService.logout();
      navigation.replace("Login");
    } catch (error) {
      console.log("Erro ao sair", error);
    }
  };

  const confirmLogout = () => {
    setLogoutModal(true);
  };

  const termo = busca.trim().toLowerCase();

  // Filtra playlists conforme o usuário digita (se vazio, mostra todas)
  const playlistsFiltradas = playlists.filter((item: Playlist) => {
    if (!termo) return true;
    return (
      item.nome?.toLowerCase().includes(termo) ||
      item.descricao?.toLowerCase().includes(termo) ||
      item.genero?.toLowerCase().includes(termo) ||
      item.autor?.toLowerCase().includes(termo) ||
      item.clima?.toLowerCase().includes(termo)
    );
  });

  // Filtra músicas conforme o usuário digita (se vazio, mostra todas)
  const musicasFiltradas = musicas.filter((item: MusicaJson) => {
    if (!termo) return true;
    return (
      item.nome?.toLowerCase().includes(termo) ||
      item.artista?.toLowerCase().includes(termo) ||
      item.album?.toLowerCase().includes(termo) ||
      item.genero?.toLowerCase().includes(termo)
    );
  });

  const mostrarPlaylists = filtroAtivo === "tudo" || filtroAtivo === "playlists";
  const mostrarMusicas = filtroAtivo === "tudo" || filtroAtivo === "musicas";

  const nenhumResultado =
    (mostrarPlaylists ? playlistsFiltradas.length === 0 : true) &&
    (mostrarMusicas ? musicasFiltradas.length === 0 : true);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* CABEÇALHO E BARRA DE BUSCA */}
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>

        <View style={styles.searchBar}>
          <TouchableOpacity
            onPress={() => inputRef.current?.focus()}
            style={styles.searchIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color="#8B5CF6" />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Buscar playlists, músicas, artistas ou gêneros..."
            placeholderTextColor="#858585"
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
          />

          {busca.length > 0 && (
            <TouchableOpacity
              onPress={() => setBusca("")}
              style={styles.clearBtn}
            >
              <Ionicons name="close-circle" size={20} color="#858585" />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTROS RÁPIDOS (TUDO / PLAYLISTS / MÚSICAS) */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filtroAtivo === "tudo" && styles.filterChipActive,
            ]}
            onPress={() => setFiltroAtivo("tudo")}
          >
            <Text
              style={[
                styles.filterChipText,
                filtroAtivo === "tudo" && styles.filterChipTextActive,
              ]}
            >
              Tudo ({playlistsFiltradas.length + musicasFiltradas.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filtroAtivo === "playlists" && styles.filterChipActive,
            ]}
            onPress={() => setFiltroAtivo("playlists")}
          >
            <Text
              style={[
                styles.filterChipText,
                filtroAtivo === "playlists" && styles.filterChipTextActive,
              ]}
            >
              Playlists ({playlistsFiltradas.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filtroAtivo === "musicas" && styles.filterChipActive,
            ]}
            onPress={() => setFiltroAtivo("musicas")}
          >
            <Text
              style={[
                styles.filterChipText,
                filtroAtivo === "musicas" && styles.filterChipTextActive,
              ]}
            >
              Músicas ({musicasFiltradas.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTEÚDO PRINCIPAL COM LISTAGEM IMEDIATA E FILTRO EM TEMPO REAL */}
      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>
            Carregando playlists e músicas...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizarLista}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          {nenhumResultado ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#404040" />
              <Text style={styles.emptyTitle}>Nenhum resultado encontrado</Text>
              <Text style={styles.emptyText}>
                {busca.trim()
                  ? `Não encontramos playlists ou músicas para "${busca}".`
                  : "Nenhuma playlist ou música disponível no momento."}
              </Text>
            </View>
          ) : (
            <>
              {/* SEÇÃO: PLAYLISTS */}
              {mostrarPlaylists && playlistsFiltradas.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Playlists</Text>
                    <Text style={styles.sectionCount}>
                      {playlistsFiltradas.length}{" "}
                      {playlistsFiltradas.length === 1 ? "item" : "itens"}
                    </Text>
                  </View>

                  {playlistsFiltradas.map((playlist) => (
                    <TouchableOpacity
                      key={`playlist-${playlist.id}`}
                      style={styles.card}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate("Playlist")}
                    >
                      <View
                        style={[
                          styles.playlistCover,
                          { backgroundColor: playlist.color || "#8B5CF6" },
                        ]}
                      >
                        <Ionicons
                          name="musical-notes"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>

                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {playlist.nome}
                        </Text>
                        <Text style={styles.cardSubtitle} numberOfLines={1}>
                          {playlist.autor} • {playlist.descricao}
                        </Text>
                        <View style={styles.metaRow}>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {(playlist.genero || "playlist").toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.metaText}>
                            {playlist.qtdFaixas}{" "}
                            {Number(playlist.qtdFaixas) === 1
                              ? "faixa"
                              : "faixas"}
                          </Text>
                        </View>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#666666"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* SEÇÃO: MÚSICAS */}
              {mostrarMusicas && musicasFiltradas.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Músicas</Text>
                    <Text style={styles.sectionCount}>
                      {musicasFiltradas.length}{" "}
                      {musicasFiltradas.length === 1 ? "música" : "músicas"}
                    </Text>
                  </View>

                  {musicasFiltradas.map((item) => {
                    const chaveImg = `${item.id}:${item.imagem || ""}`;
                    const usarFallback =
                      !item.imagem || imagensComErro[chaveImg];

                    return (
                      <TouchableOpacity
                        key={`musica-${item.id}`}
                        style={styles.card}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate("Api")}
                      >
                        {usarFallback ? (
                          <View
                            style={[
                              styles.musicCover,
                              styles.musicCoverFallback,
                            ]}
                          >
                            <Ionicons
                              name="musical-note"
                              size={24}
                              color="#FFFFFF"
                            />
                          </View>
                        ) : (
                          <Image
                            source={{ uri: item.imagem }}
                            style={styles.musicCover}
                            onError={() =>
                              setImagensComErro((prev) => ({
                                ...prev,
                                [chaveImg]: true,
                              }))
                            }
                          />
                        )}

                        <View style={styles.cardInfo}>
                          <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.nome}
                          </Text>
                          <Text style={styles.cardSubtitle} numberOfLines={1}>
                            {item.artista} • {item.album}
                          </Text>
                          <View style={styles.metaRow}>
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>
                                {(item.genero || "música").toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.durationWrap}>
                              <Ionicons
                                name="time-outline"
                                size={12}
                                color="#858585"
                              />
                              <Text style={styles.durationText}>
                                {item.duracao}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <Ionicons
                          name="play-circle"
                          size={28}
                          color="#8B5CF6"
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
      <Modal
        visible={logoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: "#2A2A2A",
              borderRadius: 16,
              padding: 20,
              paddingVertical: 30,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={50}
              color="#8B5CF6"
              style={{ marginBottom: 15 }}
            />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Sair da conta
            </Text>
            <Text
              style={{
                color: "#A7A7A7",
                fontSize: 14,
                textAlign: "center",
                marginBottom: 25,
              }}
            >
              Tem certeza que deseja encerrar a sessão?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 15,
                  alignItems: "center",
                  marginRight: 10,
                  backgroundColor: "#404040",
                  borderRadius: 8,
                }}
                onPress={() => setLogoutModal(false)}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 15,
                  alignItems: "center",
                  marginLeft: 10,
                  backgroundColor: "#8B5CF6",
                  borderRadius: 8,
                }}
                onPress={handleLogout}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Sair
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MENU INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home-outline" size={24} color="#858585" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
          <Text style={styles.tabTextActive}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Playlist")}
        >
          <Ionicons name="list" size={24} color="#858585" />
          <Text style={styles.tabText}>Playlist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Api")}
        >
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
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIconBtn: {
    marginRight: 10,
    padding: 2,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    height: "100%",
    outlineStyle: "none" as any,
  },
  clearBtn: {
    marginLeft: 8,
    padding: 2,
  },
  filterRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  filterChip: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#2E2E32",
  },
  filterChipActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  filterChipText: {
    color: "#A7A7A7",
    fontSize: 12,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#A7A7A7",
    fontSize: 14,
    marginTop: 12,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 12,
    color: "#858585",
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  playlistCover: {
    width: 54,
    height: 54,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  musicCover: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
  },
  musicCoverFallback: {
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "#A7A7A7",
    fontSize: 12,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
  },
  badgeText: {
    color: "#A78BFA",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  metaText: {
    color: "#858585",
    fontSize: 11,
  },
  durationWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    color: "#858585",
    fontSize: 11,
    marginLeft: 4,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    color: "#A7A7A7",
    fontSize: 13,
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
