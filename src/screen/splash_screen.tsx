import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen({ navigation }: any) {
  // =====================================================
  // ANIMAÇÕES
  // =====================================================

  const lineWidth = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.65)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(15)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ===================================================
    // 1. LINHA ROXA
    // ===================================================

    Animated.timing(lineWidth, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // ===================================================
    // 2. LOGO
    // ===================================================

    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // ===================================================
    // 3. NOME
    // ===================================================

    Animated.sequence([
      Animated.delay(750),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),

        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // ===================================================
    // 4. SLOGAN
    // ===================================================

    Animated.sequence([
      Animated.delay(1150),
      Animated.timing(sloganOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // ===================================================
    // 5. IR PARA LOGIN APÓS 6 SEGUNDOS
    // ===================================================

    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 6000);

    // ===================================================
    // LIMPEZA
    // ===================================================

    return () => {
      clearTimeout(timer);

      lineWidth.stopAnimation();
      logoOpacity.stopAnimation();
      logoScale.stopAnimation();
      titleOpacity.stopAnimation();
      titleTranslate.stopAnimation();
      sloganOpacity.stopAnimation();
    };
  }, [navigation]);

  // =====================================================
  // INTERPOLAÇÃO DA LINHA
  // =====================================================

  const animatedLineWidth = lineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <View style={styles.container}>
      {/* =================================================
          LINHA ROXA SUPERIOR
          ================================================= */}

      <View style={styles.lineBackground}>
        <Animated.View
          style={[
            styles.line,
            {
              width: animatedLineWidth,
            },
          ]}
        />
      </View>

      {/* =================================================
          PEQUENO CÓDIGO DA MARCA
          ================================================= */}

      <Text style={styles.brandCode}>GM / 01</Text>

      {/* =================================================
          CONTEÚDO CENTRAL
          ================================================= */}

      <View style={styles.center}>
        {/* LOGO */}

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                {
                  scale: logoScale,
                },
              ],
            },
          ]}
        >
          <Image
            source={require("../../assets/imagens/gomusic_logo.png")}
            style={styles.logo}
          />
        </Animated.View>

        {/* NOME */}

        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [
              {
                translateY: titleTranslate,
              },
            ],
          }}
        >
          <Text style={styles.title}>
            go
            <Text style={styles.purple}>Music</Text>
          </Text>
        </Animated.View>

        {/* SLOGAN */}

        <Animated.Text
          style={[
            styles.slogan,
            {
              opacity: sloganOpacity,
            },
          ]}
        >
          ESCUTE. VIVA. SINTA.
        </Animated.Text>
      </View>

      {/* =================================================
          DETALHE INFERIOR
          ================================================= */}

      <View style={styles.bottomArea}>
        <View style={styles.bottomLine} />

        <Text style={styles.bottomText}>UMA NOVA FORMA DE OUVIR</Text>
      </View>
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
    backgroundColor: "#0B0B0B",
    alignItems: "center",
    justifyContent: "center",
  },

  // ===================================================
  // LINHA SUPERIOR
  // ===================================================

  lineBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 3,
    backgroundColor: "#1A1A1A",
  },

  line: {
    height: 3,
    backgroundColor: "#8B5CF6", // Novo roxo goMusic
  },

  // ===================================================
  // IDENTIFICAÇÃO
  // ===================================================

  brandCode: {
    position: "absolute",
    top: 28,
    right: 25,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#555555",
  },

  // ===================================================
  // CENTRO
  // ===================================================

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  // ===================================================
  // LOGO
  // ===================================================

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },

  // ===================================================
  // NOME
  // ===================================================

  title: {
    marginTop: 10,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1.5,
    color: "#FFFFFF",
  },

  purple: {
    color: "#8B5CF6", // Novo roxo goMusic
  },

  // ===================================================
  // SLOGAN
  // ===================================================

  slogan: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#777777",
  },

  // ===================================================
  // RODAPÉ
  // ===================================================

  bottomArea: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
  },

  bottomLine: {
    width: 35,
    height: 2,
    marginBottom: 10,
    backgroundColor: "#8B5CF6", // Novo roxo goMusic
  },

  bottomText: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#444444",
  },
});