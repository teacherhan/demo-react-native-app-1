// @ts-nocheck
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber/native";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { View, StyleSheet } from "react-native";

function RotatingModel() {
  const { scene } = useGLTF(require("@/assets/models/w.gltf")); // Adjust path based on your setup
  const modelRef = useRef();

  // Apply rotation in each frame
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
      <Canvas>
        {/* Camera controls */}
        <OrbitControls enableZoom={false} />
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {/* 3D Model */}
        <RotatingModel />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Set background color to make model stand out
  },
});
