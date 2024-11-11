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
} from "react-native";
import { Asset } from "expo-asset";
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import { useSpring, animated as a } from "@react-spring/three";
import { Ionicons } from "@expo/vector-icons"; // For the close icon

function Model({ path, position, scale, isActive }) {
  const { scene } = useGLTF(Asset.fromModule(path).uri);
  const modelRef = useRef();

  // Rotate the model if it is active
  useFrame(() => {
    if (isActive && modelRef.current) {
      modelRef.current.rotation.y += 0.01; // Adjust rotation speed as needed
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
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    // Slide up animation for overlay
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.overlayTitle}>{feature}</Text>
      <Text style={styles.overlayContent}>More details about {feature}...</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const modelPaths = [
    require("@/assets/models/w.gltf"), // Default center model
    require("@/assets/models/s.gltf"),
    require("@/assets/models/b.gltf"),
  ];

  const infoPages = [
    {
      title: "Model W Information",
      description: "Details about model W. Random fact 1.",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      cta: "Learn More",
    },
    {
      title: "Model S Information",
      description: "Details about model S. Random fact 2.",
      features: ["Feature A", "Feature B", "Feature C"],
      cta: "Get Started",
    },
    {
      title: "Model B Information",
      description: "Details about model B. Random fact 3.",
      features: ["Feature X", "Feature Y", "Feature Z"],
      cta: "Explore More",
    },
  ];

  const radius = 2.5; // Radius for the circular arrangement around the Z-axis
  const modelCount = modelPaths.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  // Smooth rotation angle with react-spring
  const [{ rotation }, api] = useSpring(() => ({
    rotation: 0,
    config: { tension: 200, friction: 30 },
  }));

  const handleSwipe = (event) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      let newRotation = rotation.get() || 0;
      if (translationX < -50) {
        // Swipe left - rotate counterclockwise
        newRotation -= (2 * Math.PI) / modelCount;
      } else if (translationX > 50) {
        // Swipe right - rotate clockwise
        newRotation += (2 * Math.PI) / modelCount;
      }

      animateRotation(newRotation);
    }
  };

  const animateRotation = (newRotation) => {
    // Smoothly animate the rotation using react-spring
    api.start({ rotation: newRotation });

    // Update active index after animation is complete, ensuring it wraps correctly
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

  // Function to handle fade out and fade in animation
  const animateInfoTransition = (newIndex) => {
    // Fade out and slide down the current text
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
      // Update the active index
      setActiveIndex(newIndex);

      // Reset position and fade in new text
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Top Half: 3D Model Carousel */}
        <PanGestureHandler onHandlerStateChange={handleSwipe}>
          <View style={styles.topHalf}>
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />

              {/* Animated group that rotates smoothly based on react-spring angle */}
              <a.group rotation-y={rotation} position={[0, -1, 0]}>
                {modelPaths.map((path, i) => {
                  const itemAngle = (2 * Math.PI * i) / modelCount;
                  const x = radius * Math.sin(itemAngle); // Arrange models on X-Z plane with Z-axis centered
                  const z = radius * Math.cos(itemAngle);

                  return (
                    <Model
                      key={i}
                      path={path}
                      position={[x, 0, z]}
                      scale={[1, 1, 1]}
                      isActive={i === activeIndex} // Pass whether the model is active
                    />
                  );
                })}
              </a.group>

              {/* Updated Blur Plane covering the whole top half */}
              <Plane
                args={[10, 10]} // Large enough to cover the entire top half
                position={[0, 0, 0.5]} // Positioned closer to the camera
                rotation={[0, 0, 0]}
              >
                <meshStandardMaterial
                  transparent
                  opacity={0.8} // Updated opacity for stronger blur effect
                  color="gray" // Set the color for the blur effect
                />
              </Plane>
            </Canvas>
          </View>
        </PanGestureHandler>

        {/* Bottom Half: Information and Interaction */}
        <View style={styles.bottomHalf}>
          <Animated.View
            style={[
              styles.infoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateAnim }],
              },
            ]}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.infoTitle}>
                {infoPages[activeIndex].title}
              </Text>
              <Text style={styles.infoDescription}>
                {infoPages[activeIndex].description}
              </Text>

              <Text style={styles.featuresTitle}>Features:</Text>
              {infoPages[activeIndex].features.map((feature, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedFeature(feature)}
                >
                  <Text style={styles.featureItem}>• {feature}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.ctaButton}>
                <Button
                  title={infoPages[activeIndex].cta}
                  onPress={() =>
                    alert(`${infoPages[activeIndex].cta} clicked!`)
                  }
                />
              </View>
            </ScrollView>
          </Animated.View>
        </View>

        {/* Overlay for Feature Details */}
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
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topHalf: {
    flex: 1,
    backgroundColor: "#111",
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: "#222",
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
  },
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
  ctaButton: {
    marginTop: 20,
    width: "80%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#333",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  overlayContent: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
});
