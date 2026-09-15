import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "./services/userService"; // Mantive a sua importação do serviço!

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

  const hasEightCharacters = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    if (!password || !hasEightCharacters || !hasLetter || !hasNumber || !hasSymbol) {
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
      Alert.alert("Atenção", "Por favor, verifique os dados informados.");
      return;
    }

    try {
      await userService.cadastrarUsuario(name.trim(), phone.trim(), email.trim(), password);
      Alert.alert("Cadastro realizado", "Sua conta foi criada com sucesso! Você já pode entrar.");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Erro ao cadastrar: ", error);
      Alert.alert("Erro", "Não foi possível realizar o cadastro. Tente novamente.");
    }
  };

  // =====================================================
  // INTERFACE
  // =====================================================
  return (
    <View style={styles.container}>
      {/* METADE SUPERIOR - LOGO E BOAS VINDAS */}
      <View style={styles.topSection}>
        <Image source={require("../../assets/imagens/gomusic_logo.png")} style={styles.logo} />
        <Text style={styles.welcomeText}>Crie sua conta</Text>
        <Text style={styles.subtitleText}>Junte-se ao goMusic e sinta a vibe.</Text>
      </View>

      {/* METADE INFERIOR - BOTTOM SHEET (CARTÃO ARREDONDADO) */}
      <KeyboardAvoidingView style={styles.bottomSheet} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* INPUT NOME */}
          <View style={[styles.inputContainer, nameError ? styles.inputError : null]}>
            <Ionicons name="person-outline" size={20} color="#858585" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#666"
              autoCapitalize="words"
              value={name}
              onChangeText={handleNameChange}
            />
          </View>
          {nameError !== "" && <Text style={styles.errorText}>{nameError}</Text>}

          {/* INPUT E-MAIL */}
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
            />
          </View>
          {emailError !== "" && <Text style={styles.errorText}>{emailError}</Text>}

          {/* INPUT CELULAR */}
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
            />
          </View>
          {phoneError !== "" && <Text style={styles.errorText}>{phoneError}</Text>}

          {/* INPUT SENHA */}
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
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#858585" />
            </Pressable>
          </View>
          {passwordError !== "" && <Text style={styles.errorText}>{passwordError}</Text>}

          {/* REGRAS DA SENHA (NOVO VISUAL) */}
          <View style={styles.passwordRules}>
            <Text style={[styles.rule, hasEightCharacters && styles.ruleValid]}>
              <Ionicons name={hasEightCharacters ? "checkmark-circle" : "ellipse-outline"} size={12} /> Mínimo de 8 caracteres
            </Text>
            <Text style={[styles.rule, hasLetter && styles.ruleValid]}>
              <Ionicons name={hasLetter ? "checkmark-circle" : "ellipse-outline"} size={12} /> Pelo menos uma letra
            </Text>
            <Text style={[styles.rule, hasNumber && styles.ruleValid]}>
              <Ionicons name={hasNumber ? "checkmark-circle" : "ellipse-outline"} size={12} /> Pelo menos um número
            </Text>
            <Text style={[styles.rule, hasSymbol && styles.ruleValid]}>
              <Ionicons name={hasSymbol ? "checkmark-circle" : "ellipse-outline"} size={12} /> Pelo menos um símbolo (@, #, !, etc)
            </Text>
          </View>

          {/* BOTÃO CADASTRAR NEON */}
          <Pressable style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]} onPress={cadastrarUsuario}>
            <Text style={styles.registerBtnText}>CRIAR CONTA</Text>
          </Pressable>

          {/* LINK DE VOLTAR PRO LOGIN */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já possui uma conta?</Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
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
  
  // -- TOPO --
  topSection: { flex: 0.35, alignItems: "center", justifyContent: "center", paddingBottom: 10, paddingTop: 30 },
  logo: { width: 70, height: 70, resizeMode: "contain", marginBottom: 10 },
  welcomeText: { fontSize: 24, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  subtitleText: { fontSize: 13, color: "#858585", marginTop: 5 },

  // -- BOTTOM SHEET --
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

  // -- INPUTS PÍLULA --
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
    outlineStyle: "none" as any, // <--- CORREÇÃO AQUI
  },
  eyeIcon: { padding: 10 },
  errorText: { color: "#E05A47", fontSize: 11, marginLeft: 15, marginTop: 4, fontWeight: "600" },

  // -- REGRAS DA SENHA --
  passwordRules: { marginTop: 15, marginBottom: 25, marginLeft: 10 },
  rule: { fontSize: 11, color: "#666", marginBottom: 5 },
  ruleValid: { color: "#8B5CF6", fontWeight: "700" },

  // -- BOTÃO NEON --
  registerBtn: {
    backgroundColor: "#8B5CF6",
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  registerBtnText: { color: "#FFF", fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },

  // -- LOGIN LINK --
  loginContainer: { flexDirection: "row", justifyContent: "center", marginTop: 25 },
  loginText: { color: "#A1A1AA", fontSize: 13 },
  loginLink: { color: "#8B5CF6", fontSize: 13, fontWeight: "bold" },
});