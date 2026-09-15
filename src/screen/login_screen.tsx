import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./services/firebaseConfig"; // Confirme se o caminho está certo!

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Erro", "E-mail ou senha incorretos.");
    }
  };

  return (
    <View style={styles.container}>
      {/* METADE SUPERIOR - LOGO E BOAS VINDAS */}
      <View style={styles.topSection}>
        <Image source={require("../../assets/imagens/gomusic_logo.png")} style={styles.logo} />
        <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
        <Text style={styles.subtitleText}>Faça login para curtir sua vibe</Text>
      </View>

      {/* METADE INFERIOR - BOTTOM SHEET (CARTÃO ARREDONDADO) */}
      <KeyboardAvoidingView style={styles.bottomSheet} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* INPUT E-MAIL (PÍLULA) */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#858585" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* INPUT SENHA (PÍLULA) */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#858585" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Sua senha secreta"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#858585" />
            </Pressable>
          </View>

          <Pressable style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </Pressable>

          {/* BOTÃO ENTRAR NEON (PÍLULA) */}
          <Pressable style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>ENTRAR NA CONTA</Text>
          </Pressable>

          {/* LINK DE CADASTRO */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Ainda não é membro?</Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}> Crie sua conta</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  
  // -- TOPO --
  topSection: { flex: 0.45, alignItems: "center", justifyContent: "center", paddingBottom: 20 },
  logo: { width: 90, height: 90, resizeMode: "contain", marginBottom: 15 },
  welcomeText: { fontSize: 26, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  subtitleText: { fontSize: 14, color: "#858585", marginTop: 5 },

  // -- BOTTOM SHEET --
  bottomSheet: {
    flex: 0.55,
    backgroundColor: "#18181B", // Cinza bem escuro pra destacar do fundo
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingHorizontal: 25,
    // Sombra suave no topo do cartão
    shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 15,
  },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },

  // -- INPUTS PÍLULA --
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    borderRadius: 30, // Formato pílula
    height: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  inputIcon: { marginRight: 15 },
  input: { 
    flex: 1, 
    color: "#FFF", 
    fontSize: 15, 
    height: "100%",
    outlineStyle: "none" as any, // <--- CORREÇÃO AQUI
  },
  eyeIcon: { padding: 10 },

  // -- ESQUECEU SENHA --
  forgotBtn: { alignSelf: "flex-end", marginBottom: 30, marginRight: 5 },
  forgotText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },

  // -- BOTÃO NEON --
  loginBtn: {
    backgroundColor: "#8B5CF6",
    height: 60,
    borderRadius: 30, // Pílula
    alignItems: "center",
    justifyContent: "center",
    // Efeito Neon
    shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  loginBtnText: { color: "#FFF", fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },

  // -- CADASTRO --
  registerContainer: { flexDirection: "row", justifyContent: "center", marginTop: 35 },
  registerText: { color: "#A1A1AA", fontSize: 14 },
  registerLink: { color: "#8B5CF6", fontSize: 14, fontWeight: "bold" },
});