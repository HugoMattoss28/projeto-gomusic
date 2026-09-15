import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen({ navigation }: any) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current; // Nova animação do Neon

  useEffect(() => {
    // Efeito de pulsação infinita do Neon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Aparição da Logo e Título
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 4000); // Reduzi pra 4s pra ficar mais dinâmico

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        {/* AURA NEON PULSANTE */}
        <Animated.View style={[styles.glowOrb, { transform: [{ scale: pulseAnim }] }]} />

        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }], alignItems: "center" }}>
          <Image source={require("../../assets/imagens/gomusic_logo.png")} style={styles.logo} />
        </Animated.View>

        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslate }], alignItems: "center", marginTop: 15 }}>
          <Text style={styles.title}>go<Text style={styles.purple}>Music</Text></Text>
          <Text style={styles.slogan}>A SUA VIBE, O SEU MOMENTO</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B", alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center" },
  glowOrb: {
    position: "absolute",
    width: 220,
    height: 220,
    backgroundColor: "#8B5CF6",
    borderRadius: 110,
    opacity: 0.15, // Brilho suave
  },
  logo: { width: 140, height: 140, resizeMode: "contain" },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -1.5, color: "#FFFFFF" },
  purple: { color: "#8B5CF6" },
  slogan: { marginTop: 8, fontSize: 10, fontWeight: "800", letterSpacing: 4, color: "#666" },
});