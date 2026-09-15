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

export default function LoginScreen({ navigation }: any) {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
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
    // ALTERAÇÃO DA SENHA
    // =====================================================

    const handlePasswordChange = (text: string) => {

        setPassword(text);

        if (passwordError) {
            setPasswordError("");
        }
    };

    // =====================================================
    // VALIDAÇÃO DO E-MAIL
    // =====================================================

    const validateEmail = () => {

        if (!email.trim()) {

            setEmailError("Informe seu e-mail.");
            return false;

        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {

            setEmailError("Digite um e-mail válido.");
            return false;

        }

        setEmailError("");

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
    // LOGIN
    // =====================================================

    const handleLogin = () => {

        const emailIsValid = validateEmail();
        const passwordIsValid = validatePassword();

        if (!emailIsValid || !passwordIsValid) {

            Alert.alert(
                "Atenção",
                "Por favor, verifique os dados informados."
            );

            return;
        }

        Alert.alert(
            "Login",
            "Login realizado com sucesso!"
        );

        // =================================================
        // FUTURAMENTE:
        // Aqui você poderá chamar a API de login.
        //
        // Exemplo:
        // navigation.navigate("Home");
        // =================================================
    };

    // =====================================================
    // INTERFACE
    // =====================================================

    return (

        <View style={styles.container}>

            <View style={styles.topAccent} />

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
                                source={require("../../assets/imagens/gomusic_logo.png")}
                                style={styles.logo}
                            />

                        </Animated.View>

                        {/* =================================================
                                    TÍTULO
                            ================================================= */}

                        <Text style={styles.title}>
                            Bem-vindo de volta!
                        </Text>

                        <Text style={styles.subtitle}>
                            Entre na sua conta para continuar.
                        </Text>

                        {/* =================================================
                                    FORMULÁRIO
                            ================================================= */}

                        <View style={styles.form}>

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
                                        placeholder="Digite sua senha"
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
                                            {showPassword
                                                ? "OCULTAR"
                                                : "VER"}
                                        </Text>

                                    </Pressable>

                                </View>

                                {/* =================================================
                                            REGRAS DA SENHA
                                    ================================================= */}

                                <View style={styles.passwordRules}>

                                    <Text
                                        style={[
                                            styles.passwordRule,
                                            hasEightCharacters ? styles.passwordRuleValid : null,
                                        ]}
                                    >
                                        {hasEightCharacters ? "✓" : "○"}{" "}
                                        Mínimo de 8 caracteres
                                    </Text>

                                    <Text
                                        style={[
                                            styles.passwordRule,
                                            hasLetter ? styles.passwordRuleValid : null,
                                        ]}
                                    >
                                        {hasLetter ? "✓" : "○"}{" "}
                                        Pelo menos uma letra
                                    </Text>

                                    <Text
                                        style={[
                                            styles.passwordRule,
                                            hasNumber ? styles.passwordRuleValid : null,
                                        ]}
                                    >
                                        {hasNumber ? "✓" : "○"}{" "}
                                        Pelo menos um número
                                    </Text>

                                    <Text
                                        style={[
                                            styles.passwordRule,
                                            hasSymbol ? styles.passwordRuleValid : null,
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
                                        ESQUECI A SENHA
                                ================================================= */}

                            <Pressable
                                style={styles.forgotButton}
                                onPress={() => {

                                    Alert.alert(
                                        "Esqueci minha senha",
                                        "Informe seu e-mail para recuperar sua senha."
                                    );

                                }}
                            >

                                <Text style={styles.forgotText}>
                                    Esqueci minha senha
                                </Text>

                            </Pressable>

                            {/* =================================================
                                        BOTÃO ENTRAR
                                ================================================= */}

                            <Pressable
                                style={({ pressed }) => [
                                    styles.loginButton,
                                    pressed ? styles.loginButtonPressed : null,
                                ]}
                                onPress={handleLogin}
                            >

                                <Text style={styles.loginButtonText}>
                                    ENTRAR
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
                                        CADASTRO
                                ================================================= */}

                            <View style={styles.registerContainer}>

                                <Text style={styles.registerText}>
                                    Não tem uma conta?
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        navigation.navigate("Register")
                                    }
                                >

                                    <Text style={styles.registerLink}>
                                        Cadastre-se
                                    </Text>

                                </Pressable>

                            </View>

                        </View>

                    </Animated.View>

                    {/* =================================================
                                RODAPÉ
                        ================================================= */}

                    <Text style={styles.footer}>
                        GOMUSIC
                    </Text>

                </ScrollView>

            </KeyboardAvoidingView>

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
    },

    keyboardContainer: {
        flex: 1,
        width: "100%",
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
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
        zIndex: 10,
    },

    // ===================================================
    // CONTEÚDO
    // ===================================================

    content: {
        width: "100%",
        maxWidth: 380,
        alignSelf: "center",
        alignItems: "center",
        marginTop: 55,
    },

    // ===================================================
    // LOGO
    // ===================================================

    logo: {
        width: 105,
        height: 105,
        resizeMode: "contain",
    },

    // ===================================================
    // TÍTULO
    // ===================================================

    title: {
        marginTop: 12,
        fontSize: 25,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: -0.5,
    },

    // ===================================================
    // SUBTÍTULO
    // ===================================================

    subtitle: {
        marginTop: 7,
        fontSize: 13,
        color: "#858585",
        fontWeight: "500",
        textAlign: "center",
    },

    // ===================================================
    // FORMULÁRIO
    // ===================================================

    form: {
        width: "100%",
        marginTop: 32,
    },

    // ===================================================
    // INPUT
    // ===================================================

    inputContainer: {
        marginBottom: 18,
    },

    label: {
        marginBottom: 8,
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1.5,
        color: "#8B5CF6", // Novo roxo goMusic
    },

    input: {
        width: "100%",
        height: 54,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: "#333333",
        backgroundColor: "#181818",
        paddingHorizontal: 16,
        fontSize: 14,
        color: "#FFFFFF",
    },

    inputError: {
        borderColor: "#E05A47",
    },

    errorText: {
        marginTop: 6,
        fontSize: 10,
        color: "#E05A47",
        fontWeight: "600",
        lineHeight: 14,
    },

    // ===================================================
    // SENHA
    // ===================================================

    passwordContainer: {
        width: "100%",
        height: 54,
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
        paddingVertical: 15,
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
        marginBottom: 2,
    },

    passwordRule: {
        fontSize: 10,
        color: "#555555",
        marginBottom: 3,
    },

    passwordRuleValid: {
        color: "#8B5CF6", // Novo roxo goMusic
        fontWeight: "700",
    },

    // ===================================================
    // ESQUECI SENHA
    // ===================================================

    forgotButton: {
        alignSelf: "flex-end",
        marginTop: 2,
        marginBottom: 22,
    },

    forgotText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#8B5CF6", // Novo roxo goMusic
    },

    // ===================================================
    // BOTÃO ENTRAR
    // ===================================================

    loginButton: {
        width: "100%",
        height: 54,
        borderRadius: 11,
        backgroundColor: "#8B5CF6", // Novo roxo goMusic
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#8B5CF6", // Novo roxo goMusic
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 5,
    },

    loginButtonPressed: {
        opacity: 0.75,
        transform: [
            {
                scale: 0.98,
            },
        ],
    },

    loginButtonText: {
        color: "#FFFFFF", // Alterado para branco para dar mais contraste com o roxo
        fontSize: 15,
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
        marginTop: 25,
        marginBottom: 22,
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
    // CADASTRO
    // ===================================================

    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    registerText: {
        fontSize: 12,
        color: "#777777",
    },

    registerLink: {
        marginLeft: 5,
        fontSize: 12,
        fontWeight: "800",
        color: "#8B5CF6", // Novo roxo goMusic
    },

    // ===================================================
    // RODAPÉ
    // ===================================================

    footer: {
        marginTop: 35,
        marginBottom: 27,
        alignSelf: "center",
        fontSize: 8,
        fontWeight: "700",
        letterSpacing: 3,
        color: "#444444",
    },
});