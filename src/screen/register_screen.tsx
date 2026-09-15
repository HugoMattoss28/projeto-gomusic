import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { userService } from "./services/userService";

export default function CadastroScreen({ navigation }: any) {
  // =====================================================
  // ESTADOS
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

  // =====================================================
  // REGRAS DA SENHA
  // =====================================================

  const hasEightCharacters = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z\d]/.test(password);

  // =====================================================
  // ANIMAÇÕES
  // =====================================================

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(25)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;

  // =====================================================
  // ANIMAÇÃO INICIAL
  // =====================================================

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      fadeAnim.stopAnimation();
      translateY.stopAnimation();
      logoScale.stopAnimation();
    };
  }, []);

  // =====================================================
  // ALTERAÇÃO DO NOME
  // =====================================================

  const handleNameChange = (text: string) => {
    setName(text);

    if (nameError) {
      setNameError("");
    }
  };

  // =====================================================
  // ALTERAÇÃO DO E-MAIL
  // =====================================================

  const handleEmailChange = (text: string) => {
    const value = text
      .replace(/\s/g, "")
      .toLowerCase();

    setEmail(value);

    if (emailError) {
      setEmailError("");
    }
  };

  // =====================================================
  // MÁSCARA DO CELULAR
  // =====================================================

  const handlePhoneChange = (text: string) => {
    let value = text.replace(/\D/g, "");

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length <= 2) {
      value = value;
    } else if (value.length <= 7) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else {
      value = `(${value.substring(0, 2)}) ${value.substring(
        2,
        7
      )}-${value.substring(7)}`;
    }

    setPhone(value);

    if (phoneError) {
      setPhoneError("");
    }
  };

  // =====================================================
  // ALTERAÇÃO DA SENHA
  // =====================================================

  const handlePasswordChange = (text: string) => {
    setPassword(text);

    if (passwordError) {
      setPasswordError("");
    }
  };

  // =====================================================
  // VALIDAÇÃO DO NOME
  // =====================================================

  const validateName = () => {
    if (!name.trim()) {
      setNameError("Informe seu nome.");
      return false;
    }

    if (name.trim().length < 3) {
      setNameError("Digite seu nome completo.");
      return false;
    }

    setNameError("");
    return true;
  };

  // =====================================================
  // VALIDAÇÃO DO E-MAIL
  // =====================================================

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Informe seu e-mail.");
      return false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Digite um e-mail válido.");
      return false;
    }

    setEmailError("");
    return true;
  };

  // =====================================================
  // VALIDAÇÃO DO CELULAR
  // =====================================================

  const validatePhone = () => {
    if (!phone.trim()) {
      setPhoneError("Informe seu celular.");
      return false;
    }

    const numbersOnly = phone.replace(/\D/g, "");

    if (
      numbersOnly.length !== 10 &&
      numbersOnly.length !== 11
    ) {
      setPhoneError("Digite um celular válido.");
      return false;
    }

    setPhoneError("");
    return true;
  };

  // =====================================================
  // VALIDAÇÃO DA SENHA
  // =====================================================

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Informe sua senha.");
      return false;
    }

    if (!hasEightCharacters) {
      setPasswordError(
        "A senha deve ter pelo menos 8 caracteres."
      );
      return false;
    }

    if (!hasLetter) {
      setPasswordError(
        "A senha deve conter pelo menos uma letra."
      );
      return false;
    }

    if (!hasNumber) {
      setPasswordError(
        "A senha deve conter pelo menos um número."
      );
      return false;
    }

    if (!hasSymbol) {
      setPasswordError(
        "A senha deve conter pelo menos um símbolo."
      );
      return false;
    }

    setPasswordError("");
    return true;
  };

  // =====================================================
  // CADASTRAR USUÁRIO
  // =====================================================

  // =====================================================
  // CADASTRAR USUÁRIO (VERSÃO DE TESTE)
  // =====================================================

  const cadastrarUsuario = async () => {
    // Armadilha 1: Verifica se o botão identificou o toque
    console.log("🚨 1. O BOTÃO FOI CLICADO!");

    const nameIsValid = validateName();
    const emailIsValid = validateEmail();
    const phoneIsValid = validatePhone();
    const passwordIsValid = validatePassword();

    // Armadilha 2: Verifica qual campo está falhando
    console.log("🚨 2. VALIDAÇÕES: ", { nameIsValid, emailIsValid, phoneIsValid, passwordIsValid });

    if (!nameIsValid || !emailIsValid || !phoneIsValid || !passwordIsValid) {
      console.log("🚨 3. PAROU NA VALIDAÇÃO!");
      Alert.alert("Atenção", "Por favor, verifique os dados informados.");
      return;
    }

    console.log("🚨 4. PASSOU DA VALIDAÇÃO, ENVIANDO PARA O FIREBASE...");

    try {
      await userService.cadastrarUsuario(
        name.trim(),
        phone.trim(),
        email.trim(),
        password
      );

      console.log("🚨 5. SUCESSO NO FIREBASE!");
      Alert.alert("Cadastro realizado", "Sua conta foi criada com sucesso!", [
        {
          text: "Continuar",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      // Armadilha 3: Captura o erro exato que o Firebase está retornando
      console.log("🚨 6. ERRO NO FIREBASE: ", error);
      Alert.alert("Erro", "Não foi possível realizar o cadastro. Tente novamente.");
    }
  };

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <View style={styles.container}>

      {/* =================================================
          DETALHE ROXO SUPERIOR
          ================================================= */}

      <View style={styles.topAccent} />

      {/* =================================================
          CONTROLE DO TECLADO
          ================================================= */}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* =================================================
              CONTEÚDO
              ================================================= */}

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: translateY,
                  },
                ],
              },
            ]}
          >

            {/* =================================================
                LOGO
                ================================================= */}

            <Animated.View
              style={{
                transform: [
                  {
                    scale: logoScale,
                  },
                ],
              }}
            >

              <Image
                source={require(
                  "../../assets/imagens/gomusic_logo.png"
                )}
                style={styles.logo}
              />

            </Animated.View>

            {/* =================================================
                TÍTULO
                ================================================= */}

            <Text style={styles.title}>
              Crie sua conta
            </Text>

            <Text style={styles.subtitle}>
              Cadastre-se para começar a usar o goMusic.
            </Text>

            {/* =================================================
                FORMULÁRIO
                ================================================= */}

            <View style={styles.form}>

              {/* =================================================
                  NOME
                  ================================================= */}

              <View style={styles.inputContainer}>

                <Text style={styles.label}>
                  NOME
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    nameError ? styles.inputError : null,
                  ]}
                  placeholder="Digite seu nome"
                  placeholderTextColor="#666666"
                  autoCapitalize="words"
                  autoCorrect={false}
                  value={name}
                  onChangeText={handleNameChange}
                />

                {nameError !== "" && (
                  <Text style={styles.errorText}>
                    {nameError}
                  </Text>
                )}

              </View>

              {/* =================================================
                  E-MAIL
                  ================================================= */}

              <View style={styles.inputContainer}>

                <Text style={styles.label}>
                  E-MAIL
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    emailError ? styles.inputError : null,
                  ]}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#666666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  value={email}
                  onChangeText={handleEmailChange}
                />

                {emailError !== "" && (
                  <Text style={styles.errorText}>
                    {emailError}
                  </Text>
                )}

              </View>

              {/* =================================================
                  CELULAR
                  ================================================= */}

              <View style={styles.inputContainer}>

                <Text style={styles.label}>
                  CELULAR
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    phoneError ? styles.inputError : null,
                  ]}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#666666"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  maxLength={15}
                />

                {phoneError !== "" && (
                  <Text style={styles.errorText}>
                    {phoneError}
                  </Text>
                )}

              </View>

              {/* =================================================
                  SENHA
                  ================================================= */}

              <View style={styles.inputContainer}>

                <Text style={styles.label}>
                  SENHA
                </Text>

                <View
                  style={[
                    styles.passwordContainer,
                    passwordError ? styles.passwordContainerError : null,
                  ]}
                >

                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Crie uma senha"
                    placeholderTextColor="#666666"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={handlePasswordChange}
                  />

                  <Pressable
                    style={styles.showPasswordButton}
                    onPress={() =>
                      setShowPassword(!showPassword)
                    }
                  >

                    <Text style={styles.showPasswordText}>
                      {showPassword ? "OCULTAR" : "VER"}
                    </Text>

                  </Pressable>

                </View>

                {/* =================================================
                    REGRAS DA SENHA
                    ================================================= */}

                <View style={styles.passwordRules}>

                  <Text
                    style={[
                      styles.rule,
                      hasEightCharacters ? styles.ruleValid : null,
                    ]}
                  >
                    {hasEightCharacters ? "✓" : "○"}{" "}
                    Mínimo de 8 caracteres
                  </Text>

                  <Text
                    style={[
                      styles.rule,
                      hasLetter ? styles.ruleValid : null,
                    ]}
                  >
                    {hasLetter ? "✓" : "○"}{" "}
                    Pelo menos uma letra
                  </Text>

                  <Text
                    style={[
                      styles.rule,
                      hasNumber ? styles.ruleValid : null,
                    ]}
                  >
                    {hasNumber ? "✓" : "○"}{" "}
                    Pelo menos um número
                  </Text>

                  <Text
                    style={[
                      styles.rule,
                      hasSymbol ? styles.ruleValid : null,
                    ]}
                  >
                    {hasSymbol ? "✓" : "○"}{" "}
                    Pelo menos um símbolo
                  </Text>

                </View>

                {passwordError !== "" && (
                  <Text style={styles.errorText}>
                    {passwordError}
                  </Text>
                )}

              </View>

              {/* =================================================
                  BOTÃO CADASTRAR
                  ================================================= */}

              <Pressable
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed ? styles.registerButtonPressed : null,
                ]}
                onPress={cadastrarUsuario}
              >

                <Text style={styles.registerButtonText}>
                  CRIAR CONTA
                </Text>

              </Pressable>

              {/* =================================================
                  SEPARADOR
                  ================================================= */}

              <View style={styles.separatorContainer}>

                <View style={styles.separatorLine} />

                <Text style={styles.separatorText}>
                  ou
                </Text>

                <View style={styles.separatorLine} />

              </View>

              {/* =================================================
                  VOLTAR PARA LOGIN
                  ================================================= */}

              <View style={styles.loginContainer}>

                <Text style={styles.loginText}>
                  Já possui uma conta?
                </Text>

                <Pressable
                  onPress={() =>
                    navigation.navigate("Login")
                  }
                >

                  <Text style={styles.loginLink}>
                    Entrar
                  </Text>

                </Pressable>

              </View>

            </View>

          </Animated.View>

        </ScrollView>

      </KeyboardAvoidingView>

      {/* =================================================
          RODAPÉ
          ================================================= */}

      <Text style={styles.footer}>
        GOMUSIC
      </Text>

    </View>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({

  // ===================================================
  // FUNDO
  // ===================================================

  container: {
    flex: 1,
    backgroundColor: "#111111",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  // ===================================================
  // CONTROLE DO TECLADO
  // ===================================================

  keyboardContainer: {
    flex: 1,
    width: "100%",
  },

  // ===================================================
  // SCROLL
  // ===================================================

  scrollContent: {
    flexGrow: 1,
  },

  // ===================================================
  // DETALHE SUPERIOR
  // ===================================================

  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#8B5CF6", // Novo roxo goMusic
    zIndex: 2,
  },

  // ===================================================
  // CONTEÚDO
  // ===================================================

  content: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    marginTop: 35,
    paddingBottom: 90,
  },

  // ===================================================
  // LOGO
  // ===================================================

  logo: {
    width: 82,
    height: 82,
    resizeMode: "contain",
  },

  // ===================================================
  // TÍTULO
  // ===================================================

  title: {
    marginTop: 8,
    fontSize: 25,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  // ===================================================
  // SUBTÍTULO
  // ===================================================

  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#858585",
    fontWeight: "500",
    textAlign: "center",
  },

  // ===================================================
  // FORMULÁRIO
  // ===================================================

  form: {
    width: "100%",
    marginTop: 22,
  },

  // ===================================================
  // INPUT
  // ===================================================

  inputContainer: {
    marginBottom: 13,
  },

  label: {
    marginBottom: 7,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#8B5CF6", // Novo roxo goMusic
  },

  input: {
    width: "100%",
    height: 50,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#181818",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#FFFFFF",
  },

  // ===================================================
  // INPUT COM ERRO
  // ===================================================

  inputError: {
    borderColor: "#E05A47",
  },

  errorText: {
    marginTop: 5,
    fontSize: 10,
    color: "#E05A47",
    fontWeight: "600",
  },

  // ===================================================
  // SENHA
  // ===================================================

  passwordContainer: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#181818",
  },

  passwordContainerError: {
    borderColor: "#E05A47",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#FFFFFF",
  },

  showPasswordButton: {
    paddingHorizontal: 15,
    paddingVertical: 14,
  },

  showPasswordText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#777777",
  },

  // ===================================================
  // REGRAS DA SENHA
  // ===================================================

  passwordRules: {
    marginTop: 8,
    marginLeft: 3,
  },

  rule: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 3,
  },

  ruleValid: {
    color: "#8B5CF6", // Novo roxo goMusic
    fontWeight: "700",
  },

  // ===================================================
  // BOTÃO CADASTRAR
  // ===================================================

  registerButton: {
    width: "100%",
    height: 52,
    borderRadius: 11,
    backgroundColor: "#8B5CF6", // Novo roxo goMusic
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#8B5CF6",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.22,
    shadowRadius: 8,

    elevation: 5,
  },

  registerButtonPressed: {
    opacity: 0.75,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  registerButtonText: {
    color: "#FFFFFF", // Letra branca para melhor contraste com o roxo
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // ===================================================
  // SEPARADOR
  // ===================================================

  separatorContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 18,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#292929",
  },

  separatorText: {
    marginHorizontal: 13,
    fontSize: 11,
    color: "#555555",
  },

  // ===================================================
  // LOGIN
  // ===================================================

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    fontSize: 12,
    color: "#777777",
  },

  loginLink: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "800",
    color: "#8B5CF6", // Novo roxo goMusic
  },

  // ===================================================
  // RODAPÉ
  // ===================================================

  footer: {
    position: "absolute",
    bottom: 27,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#444444",
  },

});