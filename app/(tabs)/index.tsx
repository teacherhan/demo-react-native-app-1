import React, { useState } from "react";
import { Canvas } from "@react-three/fiber/native";
import { useGLTF } from "@react-three/drei";
import { View, StyleSheet, Text } from "react-native";
import { Asset } from "expo-asset";
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import { useSpring, animated } from "@react-spring/three";

function Model({ path, position, scale }) {
  const { scene } = useGLTF(Asset.fromModule(path).uri);
  return <primitive object={scene} position={position} scale={scale} />;
}

export default function HomeScreen() {
  const modelPaths = [
    require("@/assets/models/w.gltf"), // Default center model
    require("@/assets/models/s.gltf"),
    require("@/assets/models/b.gltf"),
  ];

  const radius = 2.5; // Radius for the circular arrangement around the Z-axis
  const modelCount = modelPaths.length;

  // Track the rotation angle directly and animate with react-spring
  const [angle, setAngle] = useState(0);
  const springProps = useSpring({
    rotation: angle,
    config: { tension: 200, friction: 30 },
  });

  const handleSwipe = (event) => {
    const { translationX, state } = event.nativeEvent;

    // Detect the end of the gesture
    if (state === State.END) {
      // Adjust the angle based on swipe direction and amount
      if (translationX < -50) {
        // Swipe left - rotate counterclockwise
        setAngle((prevAngle) => prevAngle - (2 * Math.PI) / modelCount);
      } else if (translationX > 50) {
        // Swipe right - rotate clockwise
        setAngle((prevAngle) => prevAngle + (2 * Math.PI) / modelCount);
      }
    }
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

              {/* Animated group that rotates based on the spring angle */}
              <animated.group
                rotation-y={springProps.rotation}
                position={[0, -1, 0]}
              >
                {modelPaths.map((path, i) => {
                  const itemAngle = (2 * Math.PI * i) / modelCount;
                  const x = radius * Math.sin(itemAngle); // Arrange models on X-Z plane with Z-axis centered
                  const z = radius * Math.cos(itemAngle); // Start with `w.gltf` at the center

                  return (
                    <Model
                      key={i}
                      path={path}
                      position={[x, 0, z]} // Place models in the X-Z plane
                      scale={[1, 1, 1]} // Uniform scale for each model
                    />
                  );
                })}
              </animated.group>
            </Canvas>
          </View>
        </PanGestureHandler>

        {/* Bottom Half: Information and Interaction */}
        <View style={styles.bottomHalf}>
          <Text style={styles.infoText}>3D Model Carousel</Text>
          <Text style={styles.infoDescription}>
            Swipe left or right to rotate the carousel and view different
            models.
          </Text>
        </View>
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
    flex: 1, // Occupies the top half
    backgroundColor: "#111",
  },
  bottomHalf: {
    flex: 1, // Occupies the bottom half
    backgroundColor: "#222",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  infoDescription: {
    fontSize: 16,
    color: "#ddd",
    marginBottom: 20,
    textAlign: "center",
  },
});
