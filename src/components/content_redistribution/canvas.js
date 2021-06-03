import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";

import { Control } from "../playground/Player";
import { Physics } from "@react-three/cannon";

import Fireflies from "../functions/fireflies";

import Stream from "../Broadcast/Consumer.js";

import {
  softShadows,
  Loader,
  Environment,
  Sky,
  MeshWobbleMaterial,
} from "@react-three/drei";
import { useReflector } from "../functions/use-reflector";
import usePostprocessing from "../functions/use-postprocessing";

import {
  TextureLoader,
  WebGLCubeRenderTarget,
  AudioListener,
  AudioLoader,
} from "three";

softShadows();

function RSphere(props) {
  const camera = useRef();
  const { scene, gl } = useThree();
  const [cubeRenderTarget] = useState(() => new WebGLCubeRenderTarget(256));
  useFrame(() => camera.current.update(gl, scene));
  return (
    <mesh position={props.position}>
      <cubeCamera ref={camera} args={[1, 1000, cubeRenderTarget]} />
      <mesh>
        <sphereBufferGeometry args={props.args} />
        <MeshWobbleMaterial
          attach="material"
          color="black"
          envMap={cubeRenderTarget.texture}
          factor={2} // Strength, 0 disables the effect (default=1)
          speed={0.6} // Speed (default=1)
          roughness={0}
          metalness={10}
          distort={0}
          side={2}
        />
      </mesh>
    </mesh>
  );
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function Cubes({ imageUrls, material }) {
  const ref = useRef();

  return imageUrls.map((imageUrl, index) => (
    <mesh
      key={index}
      ref={ref}
      position={[
        randomIntFromInterval(-50, 50),
        Math.floor(Math.random() * 10),
        randomIntFromInterval(-50, 50),
      ]}
      castShadow
      receiveShadow
    >
      <boxBufferGeometry attach="geometry" args={[5, 5, 5]} color="white" />
      <Suspense fallback={null}>
        <ImageTextureMaterial imageUrl={imageUrl} material={material} />
      </Suspense>
    </mesh>
  ));
}

const ImageTextureMaterial = (imageUrl, material) => {
  const texture = useLoader(TextureLoader, imageUrl.imageUrl);

  return (
    <meshStandardMaterial
      attach="material"
      roughness={1}
      color="white"
      map={texture}
      material={material}
    />
  );
};

function Lights() {
  const lightRef = useRef();
  const lightRef1 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.5;
    if (lightRef.current && lightRef1.current) {
      lightRef.current.position.x = Math.sin(t) * 50;
      lightRef1.current.position.x = Math.sin(t) * 50;

      lightRef.current.position.z = Math.cos(t) * 50;
      lightRef1.current.position.z = Math.sin(t) * 50;

      lightRef1.current.position.y = Math.sin(t) * 50;
    }
  });

  return (
    <>
      <spotLight
        ref={lightRef}
        position={[20, 20, 10]}
        intensity={3}
        castShadow
        color="#00e9ff"
        angle={Math.PI / 3}
        penumbra={1}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <spotLight
        ref={lightRef1}
        position={[20, 20, 10]}
        intensity={0.2}
        castShadow
        color="#e1ff00"
        angle={Math.PI / 3}
        penumbra={1}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}

function StreamBoxes() {
  const [video] = useState(() => {
    const vid = document.getElementById("video");
    vid.crossOrigin = "Anonymous";
    return vid;
  });

  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.5;

    if (groupRef.current) {
      groupRef.current.children.forEach((element) => {
        element.rotation.x = Math.sin(t) * 0.05;
        element.rotation.y = Math.sin(t) * 0.05;
        element.rotation.z = Math.sin(t) * 0.05;
      });
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 15, 0]}>
        <boxBufferGeometry args={[3, 40, 3]} />
        <meshBasicMaterial>
          <videoTexture attach="map" args={[video]} />
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}

function Floor() {
  const [meshRef, ReflectorMaterial, passes] = useReflector();
  usePostprocessing(passes);
  return (
    <group position-z={-5}>
      <mesh
        receiveShadow
        ref={meshRef}
        rotation-x={-Math.PI / 2}
        position-y={-3.001}
      >
        <planeBufferGeometry
          receiveShadow
          attach="geometry"
          args={[300, 300]}
        />

        <ReflectorMaterial
          metalness={0.8}
          roughness={0.3}
          clearcoat={0.5}
          reflectorOpacity={0.3}
          args={[300, 300]}
        />
      </mesh>
    </group>
  );
}

function Sound({ url }) {
  const sound = useRef();
  const { camera } = useThree();
  const [listener] = useState(() => new AudioListener());
  const buffer = useLoader(AudioLoader, url);
  useEffect(() => {
    sound.current.setBuffer(buffer);
    sound.current.setRefDistance(1);
    sound.current.setLoop(true);
    sound.current.play();
    camera.add(listener);
    return () => camera.remove(listener);
  }, []);
  return <positionalAudio ref={sound} args={[listener]} />;
}

function Boxes(props) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.5;

    if (groupRef.current) {
      groupRef.current.children.forEach((element) => {
        element.rotation.x = Math.sin(t) * 0.05;
        element.rotation.y = Math.sin(t) * 0.05;
        element.rotation.z = Math.sin(t) * 0.05;
      });
    }
  });

  return (
    <group position-z={-5}>
      <group ref={groupRef}>
        <Cubes imageUrls={props.props} />
      </group>
    </group>
  );
}

export default class ContentRedistributionCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrls: this.props.imageUrls,
      hasStream: this.props.hasStream,
    };
  }

  componentDidMount() {
    console.log("canvas did mount", this.props.imageUrls.length);
    console.log(this.props);
  }
  componentDidUpdate() {
    console.log("canvas did update", this.props.imageUrls.length);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.imageUrls.length !== nextProps.imageUrls.length ||
      this.props.loggedIn !== nextProps.loggedIn ||
      this.state.hasStream !== nextState.hasStream
    ) {
      return true;
    } else {
      return false;
    }
  }

  callbackFunction = () => {
    this.setState({ hasStream: true });
  };

  render() {
    return (
      <>
        {this.props.loggedIn ? (
          <Suspense fallback={null}>
            <Stream parentCallback={this.callbackFunction} />
          </Suspense>
        ) : null}
        <Canvas
          id="canvas"
          colorManagement
          shadowMap={true}
          camera={{ position: [0, 0, 10], far: 100, near: 0.1, fov: 60 }}
          resize={{ debounce: { scroll: 0, resize: 0 } }}
          invalidateFrameloop={true}
          gl={{
            powerPreference: "high-performance",
            antialias: false,
            alpha: false,
          }}
          style={{
            background: "black",
            position: "fixed",
            top: "0",
            bottom: "0",
            right: "0",
            left: "0",
            zIndex: "0",
          }}
        >
          <Floor />

          <Boxes props={this.state.imageUrls} />

          <fogExp2 attach="fog" args={[0xbffffd, 0.049]} />

          <ambientLight intensity={0.3} />

          <Suspense fallback={null}>
            <Sound url="https://res.cloudinary.com/www-houseofkilling-com/video/upload/v1620900008/sounds/AliveForever_clhtnw.mp3" />

            <RSphere position={[10, 0, 10]} args={[7, 32, 32]} />

            <RSphere position={[-70, 5, 20]} args={[3, 32, 32]} />

            <RSphere position={[50, 10, -40]} args={[10, 32, 32]} />

            <RSphere position={[0, 0, 0]} args={[50, 32, 32]} />
          </Suspense>

          <Environment files="vr_landscape.hdr" background={false} />

          <Fireflies count={500} position={[0, 0, 0]} />

          <Fireflies count={500} position={[-50, 0, 0]} />

          <Fireflies count={500} position={[-50, 0, 20]} />

          <Physics gravity={[0, 0, 0]}>
            <Control />
          </Physics>

          <Lights />

          {this.state.hasStream && <StreamBoxes />}

          <Sky
            distance={450000} // Camera distance (default=450000)
            sunPosition={[0, 10, 0]} // Sun position normal (defaults to inclination and azimuth if not set)
            inclination={1} // Sun elevation angle from 0 to 1 (default=0)
            azimuth={0.25}
          />
        </Canvas>
        <Loader dataInterpolation={(p) => `waking up ${p.toFixed(5)}%`} />
      </>
    );
  }
}
