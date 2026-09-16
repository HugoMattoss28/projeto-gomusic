import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./services/firebaseConfig"; 

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // NOVO ESTADO: Para capturar o erro do Firebase (usuário não encontrado/senha errada)
  const [loginError, setLoginError] = useState(""); 
  
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (text: string) => {
    const value = text.replace(/\s/g, "").toLowerCase();
    setEmail(value);
    if (emailError) setEmailError("");
    if (loginError) setLoginError(""); // Limpa o erro geral ao digitar
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError("");
    if (loginError) setLoginError(""); // Limpa o erro geral ao digitar
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Informe seu e-mail."); return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Digite um e-mail válido."); return false;
    }
    setEmailError(""); return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Informe sua senha."); return false;
    }
    setPasswordError(""); return true;
  };

  const handleLogin = async () => {
    // Limpa erros anteriores
    setLoginError("");

    const emailIsValid = validateEmail();
    const passwordIsValid = validatePassword();

    if (!emailIsValid || !passwordIsValid) {
      return; 
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace("Home");
    } catch (error: any) {
      console.log("Erro do Firebase:", error.code);
      
      // Captura os erros de usuário não encontrado ou credenciais inválidas
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setLoginError("Usuário não encontrado ou senha incorreta.");
      } else {
        setLoginError("Ocorreu um erro ao tentar entrar. Tente novamente.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* METADE SUPERIOR */}
      <View style={styles.topSection}>
        <Image source={require("../../assets/imagens/gomusic_logo.png")} style={styles.logo} />
        <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
        <Text style={styles.subtitleText}>Faça login para curtir sua vibe</Text>
      </View>

      {/* METADE INFERIOR */}
      <KeyboardAvoidingView style={styles.bottomSheet} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* INPUT E-MAIL */}
          <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
            <Ionicons name="mail-outline" size={20} color="#858585" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />
          </View>
          {emailError !== "" && <Text style={styles.errorText}>{emailError}</Text>}

          {/* INPUT SENHA */}
          <View style={[styles.inputContainer, passwordError ? styles.inputError : null, { marginTop: emailError ? 5 : 20 }]}>
            <Ionicons name="lock-closed-outline" size={20} color="#858585" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Sua senha secreta"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={handlePasswordChange}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#858585" />
            </Pressable>
          </View>
          {passwordError !== "" && <Text style={styles.errorText}>{passwordError}</Text>}

          <Pressable style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </Pressable>

          {/* CAIXA DE ERRO DO FIREBASE (USUÁRIO NÃO ENCONTRADO) */}
          {loginError !== "" && (
            <View style={styles.generalErrorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#E05A47" />
              <Text style={styles.generalErrorText}>{loginError}</Text>
            </View>
          )}

          {/* BOTÃO ENTRAR NEON */}
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
  
  topSection: { flex: 0.45, alignItems: "center", justifyContent: "center", paddingBottom: 20 },
  logo: { width: 90, height: 90, resizeMode: "contain", marginBottom: 15 },
  welcomeText: { fontSize: 26, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  subtitleText: { fontSize: 14, color: "#858585", marginTop: 5 },

  bottomSheet: {
    flex: 0.55,
    backgroundColor: "#18181B",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingHorizontal: 25,
    shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 15,
  },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    borderRadius: 30,
    height: 60,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  inputError: { borderColor: "#E05A47" }, 
  inputIcon: { marginRight: 15 },
  input: { 
    flex: 1, 
    color: "#FFF", 
    fontSize: 15, 
    height: "100%",
    outlineStyle: "none" as any, 
  },
  eyeIcon: { padding: 10 },
  errorText: { color: "#E05A47", fontSize: 11, marginLeft: 15, marginTop: 4, fontWeight: "600", marginBottom: 10 },

  forgotBtn: { alignSelf: "flex-end", marginBottom: 25, marginRight: 5, marginTop: 10 },
  forgotText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },

  // -- NOVO ESTILO: CAIXA DE ERRO GERAL --
  generalErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(224, 90, 71, 0.1)", // Vermelho transparente
    padding: 12,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(224, 90, 71, 0.3)",
  },
  generalErrorText: {
    color: "#E05A47",
    fontSize: 12,
    marginLeft: 10,
    fontWeight: "600",
    flex: 1,
  },

  loginBtn: {
    backgroundColor: "#8B5CF6",
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  loginBtnText: { color: "#FFF", fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },

  registerContainer: { flexDirection: "row", justifyContent: "center", marginTop: 35 },
  registerText: { color: "#A1A1AA", fontSize: 14 },
  registerLink: { color: "#8B5CF6", fontSize: 14, fontWeight: "bold" },
});