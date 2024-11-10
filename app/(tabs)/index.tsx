// @ts-nocheck
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber/native";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { View, StyleSheet, Text, Button } from "react-native";
import { Asset } from "expo-asset";

function RotatingModel() {
  const modelRef = useRef();
  const { scene } = useGLTF(
    Asset.fromModule(require("@/assets/models/w.gltf")).uri
  );

  // Apply rotation to the model
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01; // Rotate around the Y-axis
    }
  });

  return <primitive object={scene} ref={modelRef} />;
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Top Half: 3D Model */}
      <View style={styles.topHalf}>
        <Canvas>
          <OrbitControls enableZoom={false} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <RotatingModel />
        </Canvas>
      </View>

      {/* Bottom Half: Information and Interaction */}
      <View style={styles.bottomHalf}>
        <Text style={styles.infoText}>3D Model Information</Text>
        <Text style={styles.infoDescription}>
          This is a description of the 3D model, detailing what it represents,
          its features, and other relevant information.
        </Text>
        <Button
          title="Interact"
          onPress={() => alert("Interacting with 3D Model Information")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topHalf: {
    flex: 1, // Occupies the top half
    backgroundColor: "#111", // Optional: differentiate sections
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
