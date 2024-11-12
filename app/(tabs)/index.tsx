import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber/native";
import { useGLTF, Plane } from "@react-three/drei";
import {
  View,
  StyleSheet,
  Text,
  Animated,
  ScrollView,
  Button,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Asset } from "expo-asset";
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import { useSpring, animated as a } from "@react-spring/three";
import { Ionicons } from "@expo/vector-icons";

const { height: screenHeight } = Dimensions.get("window");

function Model({ path, position, scale, isActive }) {
  const { scene } = useGLTF(Asset.fromModule(path).uri);
  const modelRef = useRef();

  useFrame(() => {
    if (isActive && modelRef.current) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  return (
    <primitive
      object={scene}
      ref={modelRef}
      position={position}
      scale={scale}
    />
  );
}

function FeatureOverlay({ feature, onClose }) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: screenHeight * 0.05,
      useNativeDriver: true,
      friction: 12,
      tension: 50,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.spring(slideAnim, {
      toValue: screenHeight,
      useNativeDriver: true,
      friction: 10,
      tension: 40,
    }).start(() => onClose());
  };

  return (
    <Animated.View
      style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.overlayTitle}>{feature}</Text>
      <Text style={styles.overlayContent}>More details about {feature}...</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const modelPaths = {
    info: [
      require("@/assets/models/w.gltf"),
      require("@/assets/models/s.gltf"),
      require("@/assets/models/b.gltf"),
      require("@/assets/models/camp.gltf"),
    ],
    action: [
      require("@/assets/models/x.gltf"),
      require("@/assets/models/y.gltf"),
      require("@/assets/models/z.gltf"),
    ],
  };

  const infoPages = [
    {
      title: "Model W Information",
      description: "Details about model W.",
      features: ["Feature 1", "Feature 2"],
      cta: "Learn More",
    },
    {
      title: "Model S Information",
      description: "Details about model S.",
      features: ["Feature A", "Feature B"],
      cta: "Get Started",
    },
    {
      title: "Model B Information",
      description: "Details about model B.",
      features: ["Feature X", "Feature Y"],
      cta: "Explore More",
    },
    {
      title: "Model Camp Information",
      description: "Details about model Camp.",
      features: ["Feature X", "Feature Y"],
      cta: "Explore More",
    },
  ];

  const actionPages = [
    {
      title: "Action X Information",
      description: "Details about action X.",
      features: ["Task A", "Task B"],
      cta: "Perform Task",
    },
    {
      title: "Action Y Information",
      description: "Details about action Y.",
      features: ["Task 1", "Task 2"],
      cta: "Begin Action",
    },
    {
      title: "Action Z Information",
      description: "Details about action Z.",
      features: ["Task Alpha", "Task Beta"],
      cta: "Execute",
    },
  ];

  const radius = 2.5;

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [toggle, setToggle] = useState("info");
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const [{ rotation, scale }, api] = useSpring(() => ({
    rotation: 0,
    scale: 1,
    config: { tension: 200, friction: 30 },
  }));

  const handleSwipe = (event) => {
    const { translationX, state } = event.nativeEvent;
    const modelCount = modelPaths[toggle].length;

    if (state === State.END) {
      let newRotation = rotation.get() || 0;
      if (translationX < -50) {
        newRotation -= (2 * Math.PI) / modelCount;
      } else if (translationX > 50) {
        newRotation += (2 * Math.PI) / modelCount;
      }

      animateRotation(newRotation, modelCount);
    }
  };

  const animateRotation = (newRotation, modelCount) => {
    api.start({ rotation: newRotation });
    const newIndex =
      (Math.round(
        (modelCount - newRotation / ((2 * Math.PI) / modelCount)) % modelCount
      ) +
        modelCount) %
      modelCount;

    if (newIndex !== activeIndex) {
      animateInfoTransition(newIndex);
    }
  };

  const animateInfoTransition = (newIndex) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveIndex(newIndex);
      translateAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleToggle = () => {
    const isInfo = toggle === "info";
    const modelCount = modelPaths[isInfo ? "info" : "action"].length;

    // Animate current models moving out
    api.start({ scale: 0.5 });

    setTimeout(() => {
      setToggle(isInfo ? "action" : "info");
      setActiveIndex(0); // Reset active index for new toggle set
      api.start({ scale: 1 }); // Bring new models in with scale animation
    }, 300);
  };

  const displayedModels =
    toggle === "info" ? modelPaths.info : modelPaths.action;
  const displayedPages = toggle === "info" ? infoPages : actionPages;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <PanGestureHandler onHandlerStateChange={handleSwipe}>
          <View style={styles.topHalf}>
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />

              <a.group
                rotation-y={rotation}
                scale={scale}
                position={[0, -1, 0]}
              >
                {displayedModels.map((path, i) => {
                  const itemAngle = (2 * Math.PI * i) / displayedModels.length;
                  const x = radius * Math.sin(itemAngle);
                  const z = radius * Math.cos(itemAngle);

                  return (
                    <Model
                      key={i}
                      path={path}
                      position={[x, 0, z]}
                      scale={[1, 1, 1]}
                      isActive={i === activeIndex}
                    />
                  );
                })}
              </a.group>

              <Plane
                args={[10, 10]}
                position={[0, 0, 0.5]}
                rotation={[0, 0, 0]}
              >
                <meshStandardMaterial transparent opacity={0.8} color="gray" />
              </Plane>
            </Canvas>
          </View>
        </PanGestureHandler>

        <View style={styles.bottomHalf}>
          <Animated.View
            style={[
              styles.infoContainer,
              { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
            ]}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.infoTitle}>
                {displayedPages[activeIndex].title}
              </Text>
              <Text style={styles.infoDescription}>
                {displayedPages[activeIndex].description}
              </Text>
              <Text style={styles.featuresTitle}>Features:</Text>
              {displayedPages[activeIndex].features.map((feature, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedFeature(feature)}
                >
                  <Text style={styles.featureItem}>• {feature}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.ctaButton}>
                <Button
                  title={displayedPages[activeIndex].cta}
                  onPress={() =>
                    alert(`${displayedPages[activeIndex].cta} clicked!`)
                  }
                />
              </View>
            </ScrollView>
          </Animated.View>
          <View style={styles.toggleContainer}>
            <Button
              title={`Switch to ${toggle === "info" ? "Action" : "Info"}`}
              onPress={handleToggle}
            />
          </View>
        </View>

        {selectedFeature && (
          <FeatureOverlay
            feature={selectedFeature}
            onClose={() => setSelectedFeature(null)}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topHalf: { flex: 1, backgroundColor: "#111" },
  bottomHalf: { flex: 1, backgroundColor: "#313131", padding: 20 },
  toggleContainer: { marginBottom: 20, alignItems: "center" },
  scrollContent: { paddingBottom: 20, alignItems: "center" },
  infoContainer: { flex: 1 },
  infoTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  infoDescription: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 16,
    color: "#ddd",
    marginBottom: 5,
    textDecorationLine: "underline",
  },
  ctaButton: { marginTop: 20, width: "80%" },
  overlay: {
    position: "absolute",
    top: screenHeight * 0.05,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "#333",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeButton: { position: "absolute", top: 10, right: 10 },
  overlayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  overlayContent: { fontSize: 16, color: "white", textAlign: "center" },
});
