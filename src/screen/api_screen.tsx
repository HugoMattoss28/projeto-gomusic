import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MusicaJson } from "../models/musica";
import {
  atualizarMusica,
  criarMusica,
  excluirMusica,
  listarMusicas,
} from "../services/api";
import { auth } from "./services/firebaseConfig";

export default function ApiScreen({ navigation }: any) {
  // Lista de músicas vinda do JSONBin.io
  const [musicas, setMusicas] = useState<MusicaJson[]>([]);
  const [busca, setBusca] = useState("");
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erroLista, setErroLista] = useState<string | null>(null);

  // Estados do Modal de Cadastro / Edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Campos do formulário de Música
  const [nome, setNome] = useState("");
  const [artista, setArtista] = useState("");
  const [album, setAlbum] = useState("");
  const [genero, setGenero] = useState("");
  const [duracao, setDuracao] = useState("");
  const [imagem, setImagem] = useState("");

  // Feedback visual inline
  const [mensagem, setMensagem] = useState<{
    texto: string;
    tipo: "sucesso" | "erro";
  } | null>(null);

  // Modais de exclusão e logout
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  // Controle de imagens que falharam no carregamento
  const [imagensComErro, setImagensComErro] = useState<Record<string, boolean>>(
    {}
  );

  // Carrega as músicas da API do JSONBin.io
  const carregarMusicas = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setAtualizando(true);
      } else {
        setCarregandoLista(true);
      }
      setErroLista(null);

      const dados = await listarMusicas();
      setMusicas(dados);
    } catch (error: any) {
      setErroLista(
        error?.message || "Erro ao conectar com o JSONBin.io. Verifique sua chave/bin."
      );
    } finally {
      setCarregandoLista(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarMusicas();
  }, [carregarMusicas]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      console.log("Erro ao sair", error);
    }
  };

  const exibirMensagem = (texto: string, tipo: "sucesso" | "erro") => {
    setMensagem({ texto, tipo });
    setTimeout(() => {
      setMensagem(null);
    }, 4000);
  };

  // Aplica máscara simples para duração (ex: 350 -> 3:50 ou 0350 -> 03:50)
  const formatarDuracao = (texto: string): string => {
    // Permite digitar ":" manualmente ou aplica nos dígitos
    const limpo = texto.replace(/[^\d:]/g, "");
    if (limpo.includes(":")) {
      const partes = limpo.split(":");
      const min = partes[0].slice(0, 2);
      const seg = (partes[1] || "").replace(/\D/g, "").slice(0, 2);
      return `${min}:${seg}`;
    }
    const digitos = limpo.replace(/\D/g, "").slice(0, 4);
    if (digitos.length <= 2) return digitos;
    if (digitos.length === 3) return `${digitos[0]}:${digitos.slice(1)}`;
    return `${digitos.slice(0, 2)}:${digitos.slice(2)}`;
  };

  const validarDuracao = (valor: string): boolean => {
    const match = valor.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return false;
    const segundos = parseInt(match[2], 10);
    return segundos >= 0 && segundos <= 59;
  };

  const limparFormulario = () => {
    setNome("");
    setArtista("");
    setAlbum("");
    setGenero("");
    setDuracao("");
    setImagem("");
    setEditingId(null);
    setMensagem(null);
  };

  const abrirModalCadastro = () => {
    limparFormulario();
    setModalVisible(true);
  };

  const abrirModalEdicao = (item: MusicaJson) => {
    setEditingId(item.id);
    setNome(item.nome || "");
    setArtista(item.artista || "");
    setAlbum(item.album || "");
    setGenero(item.genero || "");
    setDuracao(item.duracao || "");
    setImagem(item.imagem || "");
    setMensagem(null);
    setModalVisible(true);
  };

  const handleSalvar = async () => {
    setMensagem(null);

    if (
      !nome.trim() ||
      !artista.trim() ||
      !album.trim() ||
      !genero.trim() ||
      !duracao.trim()
    ) {
      exibirMensagem("Preencha todos os campos obrigatórios (*).", "erro");
      return;
    }

    if (!validarDuracao(duracao)) {
      exibirMensagem("Informe uma duração válida no formato MM:SS (ex: 3:50).", "erro");
      return;
    }

    try {
      setSalvando(true);

      if (editingId !== null) {
        await atualizarMusica(editingId, {
          nome: nome.trim(),
          artista: artista.trim(),
          album: album.trim(),
          genero: genero.trim(),
          duracao: duracao.trim(),
          imagem: imagem.trim(),
        });
        exibirMensagem("Música atualizada no JSONBin com sucesso!", "sucesso");
      } else {
        await criarMusica({
          nome: nome.trim(),
          artista: artista.trim(),
          album: album.trim(),
          genero: genero.trim(),
          duracao: duracao.trim(),
          imagem: imagem.trim(),
        });
        exibirMensagem("Música cadastrada no JSONBin com sucesso!", "sucesso");
      }

      await carregarMusicas(true);

      setTimeout(() => {
        setModalVisible(false);
        limparFormulario();
      }, 900);
    } catch (error: any) {
      exibirMensagem(
        error?.message || "Erro ao salvar música na API.",
        "erro"
      );
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (deleteId === null) return;

    try {
      setExcluindo(true);
      await excluirMusica(deleteId);
      await carregarMusicas(true);
      setDeleteId(null);
    } catch (error: any) {
      setErroLista(error?.message || "Erro ao excluir música.");
      setDeleteId(null);
    } finally {
      setExcluindo(false);
    }
  };

  // Filtra músicas em tempo real pela barra de busca
  const musicasFiltradas = musicas.filter((item) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    return (
      item.nome?.toLowerCase().includes(termo) ||
      item.artista?.toLowerCase().includes(termo) ||
      item.album?.toLowerCase().includes(termo) ||
      item.genero?.toLowerCase().includes(termo)
    );
  });

  const renderMusica = ({ item }: { item: MusicaJson }) => {
    const chaveImg = String(item.id);
    const usarFallback = !item.imagem || imagensComErro[chaveImg];

    return (
      <View style={styles.card}>
        {usarFallback ? (
          <View style={[styles.cover, styles.coverFallback]}>
            <Ionicons name="musical-notes" size={26} color="#FFFFFF" />
          </View>
        ) : (
          <Image
            source={{ uri: item.imagem }}
            style={styles.cover}
            onError={() =>
              setImagensComErro((prev) => ({ ...prev, [chaveImg]: true }))
            }
          />
        )}

        <View style={styles.cardInfo}>
          <Text style={styles.musicName} numberOfLines={1}>
            {item.nome}
          </Text>
          <Text style={styles.musicArtist} numberOfLines={1}>
            {item.artista} • {item.album}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.genreBadge}>
              <Text style={styles.genreText}>
                {(item.genero || "música").toUpperCase()}
              </Text>
            </View>
            <View style={styles.durationWrap}>
              <Ionicons name="time-outline" size={12} color="#858585" />
              <Text style={styles.durationText}>{item.duracao}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => abrirModalEdicao(item)}
            style={styles.actionBtn}
          >
            <Ionicons name="pencil" size={19} color="#858585" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDeleteId(item.id)}
            style={styles.actionBtn}
          >
            <Ionicons name="trash" size={19} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Catálogo API</Text>
          <Text style={styles.subtitle}>
            JSONBin.io • {musicas.length}{" "}
            {musicas.length === 1 ? "música" : "músicas"}
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => carregarMusicas(true)}
            disabled={carregandoLista || atualizando}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={abrirModalCadastro}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* BARRA DE FILTRO RÁPIDO */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#858585" />
          <TextInput
            style={styles.searchInput}
            placeholder="Filtrar por música, artista, álbum ou gênero..."
            placeholderTextColor="#858585"
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca("")}>
              <Ionicons name="close-circle" size={18} color="#858585" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* AVISO DE ERRO DE CONEXÃO */}
      {erroLista && (
        <View style={styles.erroBanner}>
          <Ionicons name="alert-circle" size={18} color="#E05A47" />
          <Text style={styles.erroBannerTexto}>{erroLista}</Text>
          <TouchableOpacity onPress={() => carregarMusicas()}>
            <Text style={styles.tentarNovamente}>Tentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LISTAGEM PRINCIPAL */}
      {carregandoLista ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>
            Buscando músicas no JSONBin.io...
          </Text>
        </View>
      ) : (
        <FlatList
          data={musicasFiltradas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMusica}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => carregarMusicas(true)}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="musical-notes-outline"
                size={48}
                color="#404040"
              />
              <Text style={styles.emptyText}>
                {busca
                  ? "Nenhuma música encontrada para esse filtro."
                  : "Nenhuma música cadastrada no JSONBin."}
              </Text>
            </View>
          }
        />
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO */}
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
                {editingId !== null ? "Editar Música" : "Nova Música (API)"}
              </Text>

              {mensagem && (
                <View
                  style={[
                    styles.mensagemBox,
                    mensagem.tipo === "sucesso"
                      ? styles.msgSucesso
                      : styles.msgErro,
                  ]}
                >
                  <Ionicons
                    name={
                      mensagem.tipo === "sucesso"
                        ? "checkmark-circle"
                        : "alert-circle"
                    }
                    size={18}
                    color={mensagem.tipo === "sucesso" ? "#10B981" : "#E05A47"}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.mensagemTexto,
                      mensagem.tipo === "sucesso"
                        ? styles.msgTextoSucesso
                        : styles.msgTextoErro,
                    ]}
                  >
                    {mensagem.texto}
                  </Text>
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Nome da Música *"
                placeholderTextColor="#858585"
                value={nome}
                onChangeText={(t) => {
                  setNome(t);
                  if (mensagem) setMensagem(null);
                }}
              />

              <TextInput
                style={styles.input}
                placeholder="Artista / Banda *"
                placeholderTextColor="#858585"
                value={artista}
                onChangeText={(t) => {
                  setArtista(t);
                  if (mensagem) setMensagem(null);
                }}
              />

              <TextInput
                style={styles.input}
                placeholder="Álbum *"
                placeholderTextColor="#858585"
                value={album}
                onChangeText={(t) => {
                  setAlbum(t);
                  if (mensagem) setMensagem(null);
                }}
              />

              <TextInput
                style={styles.input}
                placeholder="Gênero (ex: pop, trap, mpb, rock) *"
                placeholderTextColor="#858585"
                value={genero}
                onChangeText={(t) => {
                  setGenero(t);
                  if (mensagem) setMensagem(null);
                }}
              />

              <TextInput
                style={styles.input}
                placeholder="Duração MM:SS (ex: 3:50) *"
                placeholderTextColor="#858585"
                value={duracao}
                maxLength={5}
                onChangeText={(t) => {
                  setDuracao(formatarDuracao(t));
                  if (mensagem) setMensagem(null);
                }}
              />

              <TextInput
                style={styles.input}
                placeholder="URL da Capa (opcional - https://...)"
                placeholderTextColor="#858585"
                value={imagem}
                autoCapitalize="none"
                onChangeText={(t) => {
                  setImagem(t);
                  if (mensagem) setMensagem(null);
                }}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                  disabled={salvando}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, salvando && { opacity: 0.7 }]}
                  onPress={handleSalvar}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingId !== null ? "Atualizar" : "Salvar"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <Modal
        visible={deleteId !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingVertical: 30, alignItems: "center" },
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={50}
              color="#E05A47"
              style={{ marginBottom: 15 }}
            />
            <Text style={styles.modalTitle}>Excluir Música</Text>
            <Text
              style={{
                color: "#A7A7A7",
                fontSize: 14,
                textAlign: "center",
                marginBottom: 25,
              }}
            >
              Tem certeza que deseja remover esta música do JSONBin.io?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteId(null)}
                disabled={excluindo}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: "#E05A47" },
                  excluindo && { opacity: 0.7 },
                ]}
                onPress={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Excluir</Text>
                )}
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
          <View
            style={[
              styles.modalContent,
              { paddingVertical: 30, alignItems: "center" },
            ]}
          >
            <Ionicons
              name="log-out-outline"
              size={50}
              color="#8B5CF6"
              style={{ marginBottom: 15 }}
            />
            <Text style={styles.modalTitle}>Sair da conta</Text>
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleLogout}
              >
                <Text style={styles.saveButtonText}>Sair</Text>
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
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Search")}
        >
          <Ionicons name="search" size={24} color="#858585" />
          <Text style={styles.tabText}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Playlist")}
        >
          <Ionicons name="list" size={24} color="#858585" />
          <Text style={styles.tabText}>Playlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="code-slash" size={24} color="#FFFFFF" />
          <Text style={styles.tabTextActive}>API</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setLogoutModal(true)}
        >
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "#A7A7A7",
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    backgroundColor: "#2A2A2A",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#8B5CF6",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
    height: "100%",
    outlineStyle: "none" as any,
  },
  erroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(224, 90, 71, 0.15)",
    borderWidth: 1,
    borderColor: "#E05A47",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
  },
  erroBannerTexto: {
    flex: 1,
    color: "#E05A47",
    fontSize: 13,
    marginHorizontal: 8,
  },
  tentarNovamente: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "#E05A47",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  loadingText: {
    color: "#A7A7A7",
    fontSize: 14,
    marginTop: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cover: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
  },
  coverFallback: {
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  musicName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },
  musicArtist: {
    color: "#A7A7A7",
    fontSize: 13,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  genreBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
  },
  genreText: {
    color: "#A78BFA",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
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
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  actionBtn: {
    padding: 6,
    marginLeft: 6,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#858585",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContent: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  mensagemBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  msgSucesso: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  msgErro: {
    backgroundColor: "rgba(224, 90, 71, 0.15)",
    borderWidth: 1,
    borderColor: "#E05A47",
  },
  mensagemTexto: {
    fontSize: 13,
    flex: 1,
    fontWeight: "500",
  },
  msgTextoSucesso: {
    color: "#10B981",
  },
  msgTextoErro: {
    color: "#E05A47",
  },
  input: {
    backgroundColor: "#1C1C1E",
    color: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 12,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 6,
    width: "100%",
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
