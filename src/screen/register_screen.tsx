import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "./services/userService";

export default function CadastroScreen({ navigation }: any) {
  // =====================================================
  // ESTADOS E REGRAS
  // =====================================================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  
  // NOVO ESTADO: Controla a exibição da mensagem verde
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const hasEightCharacters = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z\d]/.test(password);

  // =====================================================
  // HANDLERS E MÁSCARAS
  // =====================================================
  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) setNameError("");
  };

  const handleEmailChange = (text: string) => {
    const value = text.replace(/\s/g, "").toLowerCase();
    setEmail(value);
    if (emailError) setEmailError("");
  };

  const handlePhoneChange = (text: string) => {
    let value = text.replace(/\D/g, "");
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length <= 2) {
      value = value;
    } else if (value.length <= 7) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    }
    setPhone(value);
    if (phoneError) setPhoneError("");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError("");
  };

  // =====================================================
  // VALIDAÇÕES
  // =====================================================
  const validateName = () => {
    if (!name.trim() || name.trim().length < 3) {
      setNameError("Digite seu nome completo."); return false;
    }
    setNameError(""); return true;
  };

  const validateEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError("Digite um e-mail válido."); return false;
    }
    setEmailError(""); return true;
  };

  const validatePhone = () => {
    const numbersOnly = phone.replace(/\D/g, "");
    if (!phone.trim() || (numbersOnly.length !== 10 && numbersOnly.length !== 11)) {
      setPhoneError("Digite um celular válido."); return false;
    }
    setPhoneError(""); return true;
  };

  const validatePassword = () => {
    if (!password || !hasEightCharacters || !hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
      setPasswordError("A senha não cumpre todos os requisitos."); return false;
    }
    setPasswordError(""); return true;
  };

  // =====================================================
  // CADASTRAR USUÁRIO NO FIREBASE
  // =====================================================
  const cadastrarUsuario = async () => {
    const nameIsValid = validateName();
    const emailIsValid = validateEmail();
    const phoneIsValid = validatePhone();
    const passwordIsValid = validatePassword();

    if (!nameIsValid || !emailIsValid || !phoneIsValid || !passwordIsValid) {
      return; // Para silenciosamente, as bordas vermelhas já avisam o erro
    }

    try {
      await userService.cadastrarUsuario(name.trim(), phone.trim(), email.trim(), password);
      
      // 1. Mostra a caixa verde de sucesso!
      setRegisterSuccess(true);
      
      // 2. Espera 2.5 segundos para o usuário ler, e redireciona sozinho
      setTimeout(() => {
        navigation.replace("Login");
      }, 2500);

    } catch (error: any) {
      console.error("Erro ao cadastrar: ", error);
      if (error.code === 'auth/email-already-in-use') {
        setEmailError("Este e-mail já está cadastrado.");
      } else {
        Alert.alert("Erro", "Não foi possível realizar o cadastro. Tente novamente.");
      }
    }
  };

  // =====================================================
  // INTERFACE
  // =====================================================
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image source={require("../../assets/imagens/gomusic_logo.png")} style={styles.logo} />
        <Text style={styles.welcomeText}>Crie sua conta</Text>
        <Text style={styles.subtitleText}>Junte-se ao goMusic e sinta a vibe.</Text>
      </View>

      <KeyboardAvoidingView style={styles.bottomSheet} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.inputContainer, nameError ? styles.inputError : null]}>
            <Ionicons name="person-outline" size={20} color="#858585" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#666"
              autoCapitalize="words"
              value={name}
              onChangeText={handleNameChange}
              editable={!registerSuccess} // Bloqueia a edição se já deu certo
            />
          </View>
          {nameError !== "" && <Text style={styles.errorText}>{nameError}</Text>}

          <View style={[styles.inputContainer, emailError ? styles.inputError : null, { marginTop: nameError ? 5 : 15 }]}>
            <Ionicons name="mail-outline" size={20} color="#858585" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
              editable={!registerSuccess}
            />
          </View>
          {emailError !== "" && <Text style={styles.errorText}>{emailError}</Text>}

          <View style={[styles.inputContainer, phoneError ? styles.inputError : null, { marginTop: emailError ? 5 : 15 }]}>
            <Ionicons name="call-outline" size={20} color="#858585" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              maxLength={15}
              value={phone}
              onChangeText={handlePhoneChange}
              editable={!registerSuccess}
            />
          </View>
          {phoneError !== "" && <Text style={styles.errorText}>{phoneError}</Text>}

          <View style={[styles.inputContainer, passwordError ? styles.inputError : null, { marginTop: phoneError ? 5 : 15 }]}>
            <Ionicons name="lock-closed-outline" size={20} color="#858585" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Crie uma senha forte"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={handlePasswordChange}
              editable={!registerSuccess}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#858585" />
            </Pressable>
          </View>
          {passwordError !== "" && <Text style={styles.errorText}>{passwordError}</Text>}

          <View style={styles.rulesGrid}>
            <View style={[styles.ruleBadge, hasEightCharacters && styles.ruleBadgeValid]}>
              <Ionicons name={hasEightCharacters ? "checkmark" : "close"} size={14} color={hasEightCharacters ? "#8B5CF6" : "#666"} />
              <Text style={[styles.ruleText, hasEightCharacters && styles.ruleTextValid]}>8+ Caract.</Text>
            </View>

            <View style={[styles.ruleBadge, hasUppercase && styles.ruleBadgeValid]}>
              <Ionicons name={hasUppercase ? "checkmark" : "close"} size={14} color={hasUppercase ? "#8B5CF6" : "#666"} />
              <Text style={[styles.ruleText, hasUppercase && styles.ruleTextValid]}>Maiúscula</Text>
            </View>

            <View style={[styles.ruleBadge, hasLowercase && styles.ruleBadgeValid]}>
              <Ionicons name={hasLowercase ? "checkmark" : "close"} size={14} color={hasLowercase ? "#8B5CF6" : "#666"} />
              <Text style={[styles.ruleText, hasLowercase && styles.ruleTextValid]}>Minúscula</Text>
            </View>

            <View style={[styles.ruleBadge, hasNumber && styles.ruleBadgeValid]}>
              <Ionicons name={hasNumber ? "checkmark" : "close"} size={14} color={hasNumber ? "#8B5CF6" : "#666"} />
              <Text style={[styles.ruleText, hasNumber && styles.ruleTextValid]}>Número</Text>
            </View>

            <View style={[styles.ruleBadge, hasSymbol && styles.ruleBadgeValid, { width: "100%" }]}>
              <Ionicons name={hasSymbol ? "checkmark" : "close"} size={14} color={hasSymbol ? "#8B5CF6" : "#666"} />
              <Text style={[styles.ruleText, hasSymbol && styles.ruleTextValid]}>Símbolo (@#)</Text>
            </View>
          </View>

          {/* =====================================================
              NOVO DESIGN: CAIXA VERDE DE SUCESSO
              ===================================================== */}
          {registerSuccess ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
              <View style={styles.successTextColumn}>
                <Text style={styles.successTitle}>Conta Criada!</Text>
                <Text style={styles.successText}>Redirecionando para o login...</Text>
              </View>
            </View>
          ) : (
            /* BOTÃO CADASTRAR SÓ APARECE SE AINDA NÃO DEU SUCESSO */
            <Pressable style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]} onPress={cadastrarUsuario}>
              <Text style={styles.registerBtnText}>CRIAR CONTA</Text>
            </Pressable>
          )}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já possui uma conta?</Text>
            <Pressable onPress={() => navigation.navigate("Login")} disabled={registerSuccess}>
              <Text style={styles.loginLink}> Entrar</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  
  topSection: { flex: 0.35, alignItems: "center", justifyContent: "center", paddingBottom: 10, paddingTop: 30 },
  logo: { width: 70, height: 70, resizeMode: "contain", marginBottom: 10 },
  welcomeText: { fontSize: 24, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  subtitleText: { fontSize: 13, color: "#858585", marginTop: 5 },

  bottomSheet: {
    flex: 0.65,
    backgroundColor: "#18181B",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 35,
    paddingHorizontal: 25,
    shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 15,
  },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    borderRadius: 30,
    height: 55,
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
  errorText: { color: "#E05A47", fontSize: 11, marginLeft: 15, marginTop: 4, fontWeight: "600" },

  rulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 25,
  },
  ruleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A", 
    width: "48%", 
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  ruleBadgeValid: {
    backgroundColor: "rgba(139, 92, 246, 0.15)", 
    borderColor: "rgba(139, 92, 246, 0.5)", 
  },
  ruleText: {
    fontSize: 10,
    color: "#666",
    marginLeft: 6,
    fontWeight: "700",
  },
  ruleTextValid: {
    color: "#8B5CF6", 
  },

  // -- ESTILOS DA CAIXA DE SUCESSO --
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)", // Fundo verde transparente
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    height: 60, // Mesma altura do botão para a troca ser suave
  },
  successTextColumn: {
    marginLeft: 12,
  },
  successTitle: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "800",
  },
  successText: {
    color: "#10B981",
    fontSize: 11,
    marginTop: 2,
    opacity: 0.8,
  },

  registerBtn: {
    backgroundColor: "#8B5CF6",
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  registerBtnText: { color: "#FFF", fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },

  loginContainer: { flexDirection: "row", justifyContent: "center", marginTop: 25 },
  loginText: { color: "#A1A1AA", fontSize: 13 },
  loginLink: { color: "#8B5CF6", fontSize: 13, fontWeight: "bold" },
});