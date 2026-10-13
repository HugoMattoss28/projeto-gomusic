import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Playlist, usePlaylists } from "../context/PlaylistContext";
import { PlaylistModel } from "./models/PlaylistModel";
import { auth } from "./services/firebaseConfig";
import { PlaylistService } from "./services/playlistService";

export default function PlaylistScreen({ navigation }: any) {
    const { playlists, carregarPlaylists } = usePlaylists();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Campos do formulário da entidade do projeto (Playlist)
    const [nomePlaylist, setNomePlaylist] = useState("");
    const [descricao, setDescricao] = useState("");
    const [genero, setGenero] = useState("");
    const [autor, setAutor] = useState("");
    const [dataCriacao, setDataCriacao] = useState("");
    const [qtdFaixas, setQtdFaixas] = useState("");
    const [clima, setClima] = useState("");

    // Mensagens inline e estados de carregamento
    const [mensagem, setMensagem] = useState<{ texto: string; tipo: "sucesso" | "erro" } | null>(null);
    const [loading, setLoading] = useState(false);

    // Modais de exclusão e logout
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

    const exibirMensagem = (texto: string, tipo: "sucesso" | "erro") => {
        setMensagem({ texto, tipo });
        setTimeout(() => {
            setMensagem(null);
        }, 4000);
    };

    // Validação do Nome Completo (Nome + Sobrenome)
    const validarNomeCompleto = (texto: string): boolean => {
        return texto.trim().split(/\s+/).length >= 2;
    };

    // Validação do formato e valor da Data (DD/MM/AAAA)
    const validarData = (texto: string): boolean => {
        return PlaylistService.validarData(texto);
    };

    const limparFormulario = () => {
        setNomePlaylist("");
        setDescricao("");
        setGenero("");
        setAutor("");
        setDataCriacao("");
        setQtdFaixas("");
        setClima("");
        setEditingId(null);
        setMensagem(null);
    };

    const openAddModal = () => {
        limparFormulario();
        setModalVisible(true);
    };

    const openEditModal = (playlist: Playlist) => {
        setEditingId(playlist.id);
        setNomePlaylist(playlist.nome || "");
        setDescricao(playlist.descricao || "");
        setGenero(playlist.genero || "");
        setAutor(playlist.autor || "");
        setDataCriacao(playlist.dataCriacao || "");
        setQtdFaixas(playlist.qtdFaixas ? String(playlist.qtdFaixas) : "");
        setClima(playlist.clima || "");
        setMensagem(null);
        setModalVisible(true);
    };

    // Método para cadastrar dados da entidade do seu projeto
    const handleCadastrar = async () => {
        setMensagem(null);

        // 1. Validação de campos em branco
        if (
            !nomePlaylist.trim() ||
            !descricao.trim() ||
            !genero.trim() ||
            !autor.trim() ||
            !dataCriacao.trim() ||
            !qtdFaixas.trim()
        ) {
            exibirMensagem("Por favor, preencha todos os campos obrigatórios.", "erro");
            return;
        }

        // 2. Validação do Nome Completo (Nome + Sobrenome do autor/criador)
        if (!validarNomeCompleto(autor)) {
            exibirMensagem("Por favor, informe o nome completo do autor (nome e sobrenome).", "erro");
            return;
        }

        // 3. Validação da Quantidade de Faixas
        const qtdFaixasNum = parseInt(qtdFaixas, 10);
        if (isNaN(qtdFaixasNum) || qtdFaixasNum <= 0) {
            exibirMensagem("A quantidade de faixas deve ser no mínimo 1.", "erro");
            return;
        }

        // 4. Validação do formato e valor da Data
        if (!validarData(dataCriacao)) {
            exibirMensagem("Informe uma data válida no formato DD/MM/AAAA.", "erro");
            return;
        }

        try {
            setLoading(true);

            if (editingId) {
                // Atualiza os dados no Firebase Realtime Database
                await PlaylistService.atualizar(editingId, {
                    id: editingId,
                    nome: nomePlaylist.trim(),
                    descricao: descricao.trim(),
                    genero: genero.trim(),
                    autor: autor.trim(),
                    clima: clima.trim(),
                    dataCriacao: dataCriacao.trim(),
                    qtdFaixas: qtdFaixasNum,
                });

                exibirMensagem("Playlist atualizada com sucesso!", "sucesso");
            } else {
                // Grava os dados no Firebase Realtime Database vinculado ao usuário logado
                await PlaylistService.criar({
                    nome: nomePlaylist.trim(),
                    descricao: descricao.trim(),
                    genero: genero.trim(),
                    autor: autor.trim(),
                    clima: clima.trim(),
                    dataCriacao: dataCriacao.trim(),
                    qtdFaixas: qtdFaixasNum,
                });

                // Exibe mensagem inline de sucesso
                exibirMensagem("Playlist cadastrada com sucesso!", "sucesso");
            }

            // Recarrega as playlists do Firebase para atualizar a tela
            await carregarPlaylists();

            // Limpa o formulário após a gravação
            limparFormulario();

            setTimeout(() => {
                setModalVisible(false);
            }, 1200);
        } catch (error: any) {
            console.error("Erro ao salvar no Firebase Realtime Database:", error);
            exibirMensagem(error.message || "Erro ao salvar no banco de dados. Tente novamente.", "erro");
        } finally {
            setLoading(false);
        }
    };

    const deletePlaylist = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await PlaylistService.eliminar(deleteId);
                await carregarPlaylists();
            } catch (error) {
                console.error("Erro ao excluir playlist:", error);
            }
            setDeleteId(null);
        }
    };

    const renderItem = ({ item }: { item: Playlist }) => (
        <View style={styles.playlistCard}>
            <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{item.nome}</Text>
                <Text style={styles.playlistDesc}>{item.descricao}</Text>
                <Text style={styles.playlistMeta}>
                    Gênero: {item.genero || "-"} | Autor: {item.autor || "-"}
                </Text>
                <Text style={styles.playlistMeta}>
                    Faixas: {item.qtdFaixas || "-"} | Data: {item.dataCriacao || "-"} | Clima: {item.clima || "-"}
                </Text>
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

            {/* MODAL DE CRUD (CADASTRO E EDIÇÃO) */}
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

                            {/* Mensagem inline de feedback */}
                            {mensagem && (
                                <View
                                    style={[
                                        styles.mensagemBox,
                                        mensagem.tipo === "sucesso" ? styles.msgSucesso : styles.msgErro,
                                    ]}
                                >
                                    <Ionicons
                                        name={mensagem.tipo === "sucesso" ? "checkmark-circle" : "alert-circle"}
                                        size={18}
                                        color={mensagem.tipo === "sucesso" ? "#10B981" : "#E05A47"}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text
                                        style={[
                                            styles.mensagemTexto,
                                            mensagem.tipo === "sucesso" ? styles.msgTextoSucesso : styles.msgTextoErro,
                                        ]}
                                    >
                                        {mensagem.texto}
                                    </Text>
                                </View>
                            )}

                            <TextInput
                                style={styles.input}
                                placeholder="Nome da Playlist *"
                                placeholderTextColor="#858585"
                                value={nomePlaylist}
                                onChangeText={(t) => {
                                    setNomePlaylist(t);
                                    if (mensagem) setMensagem(null);
                                }}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Descrição *"
                                placeholderTextColor="#858585"
                                value={descricao}
                                onChangeText={(t) => {
                                    setDescricao(t);
                                    if (mensagem) setMensagem(null);
                                }}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Gênero (ex: Trap, Lo-fi, Rock) *"
                                placeholderTextColor="#858585"
                                value={genero}
                                onChangeText={(t) => {
                                    setGenero(t);
                                    if (mensagem) setMensagem(null);
                                }}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Autor / Criador (Nome e Sobrenome) *"
                                placeholderTextColor="#858585"
                                value={autor}
                                onChangeText={(t) => {
                                    setAutor(t);
                                    if (mensagem) setMensagem(null);
                                }}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Data de Criação (DD/MM/AAAA) *"
                                placeholderTextColor="#858585"
                                value={dataCriacao}
                                keyboardType="numeric"
                                maxLength={10}
                                onChangeText={(t) => {
                                    setDataCriacao(PlaylistService.aplicarMascaraData(t));
                                    if (mensagem) setMensagem(null);
                                }}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Quantidade de Faixas (ex: 12) *"
                                placeholderTextColor="#858585"
                                value={qtdFaixas}
                                keyboardType="numeric"
                                onChangeText={(t) => {
                                    setQtdFaixas(t.replace(/\D/g, ""));
                                    if (mensagem) setMensagem(null);
                                }}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Clima (ex: Focado, Relax)"
                                placeholderTextColor="#858585"
                                value={clima}
                                onChangeText={(t) => {
                                    setClima(t);
                                    if (mensagem) setMensagem(null);
                                }}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setModalVisible(false)}
                                    disabled={loading}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                                    onPress={handleCadastrar}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingId ? "Atualizar" : "Salvar"}
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

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#E05A47" }]}
                                onPress={confirmDelete}
                            >
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

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#8B5CF6" }]}
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
        marginBottom: 10,
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
