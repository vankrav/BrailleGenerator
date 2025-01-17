import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

const DisplacementMap = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1.5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set(1, 1, 1);
    scene.add(light);

    const planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 100);
    const material = new THREE.MeshStandardMaterial();
    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load('/img/test.png');
    material.map = texture;

    const displacementMap = textureLoader.load('/img/test.png');
    material.displacementMap = displacementMap;

    material.displacementScale = 0.1;

    const plane = new THREE.Mesh(planeGeometry, material);
    scene.add(plane);

    const stats = new Stats();
    document.body.appendChild(stats.dom);

    const gui = new GUI();

    // Настройки для материала
    const materialFolder = gui.addFolder('THREE.Material');
    materialFolder.add(material, 'transparent').onChange(() => (material.needsUpdate = true));
    materialFolder.add(material, 'opacity', 0, 1, 0.01);
    materialFolder.add(material, 'depthTest');
    materialFolder.add(material, 'depthWrite');
    materialFolder.add(material, 'alphaTest', 0, 1, 0.01).onChange(() => updateMaterial());
    materialFolder.add(material, 'visible');
    materialFolder.add(material, 'side', {
      FrontSide: THREE.FrontSide,
      BackSide: THREE.BackSide,
      DoubleSide: THREE.DoubleSide,
    }).onChange(() => updateMaterial());

    // Настройки для MeshStandardMaterial
    const data = {
      color: material.color.getHex(),
      emissive: material.emissive.getHex(),
    };

    const meshStandardMaterialFolder = gui.addFolder('THREE.MeshStandardMaterial');
    meshStandardMaterialFolder.addColor(data, 'color').onChange(() => {
      material.color.setHex(Number(data.color.toString().replace('#', '0x')));
    });
    meshStandardMaterialFolder.addColor(data, 'emissive').onChange(() => {
      material.emissive.setHex(Number(data.emissive.toString().replace('#', '0x')));
    });
    meshStandardMaterialFolder.add(material, 'wireframe');
    meshStandardMaterialFolder.add(material, 'flatShading').onChange(() => updateMaterial());
    meshStandardMaterialFolder.add(material, 'displacementScale', -1, 1, 0.01);
    meshStandardMaterialFolder.add(material, 'displacementBias', -1, 1, 0.01);
    meshStandardMaterialFolder.add(material, 'roughness', 0, 1);
    meshStandardMaterialFolder.add(material, 'metalness', 0, 1);
    meshStandardMaterialFolder.open();

    // Настройки для геометрии
    const planeData = {
      width: 3.6,
      height: 1.8,
      widthSegments: 180,
      heightSegments: 90,
    };

    const planePropertiesFolder = gui.addFolder('PlaneGeometry');
    planePropertiesFolder.add(planeData, 'widthSegments', 1, 360).onChange(regeneratePlaneGeometry);
    planePropertiesFolder.add(planeData, 'heightSegments', 1, 180).onChange(regeneratePlaneGeometry);
    planePropertiesFolder.add(planeData, 'width', 0.1, 10).onChange(regeneratePlaneGeometry);
    planePropertiesFolder.add(planeData, 'height', 0.1, 10).onChange(regeneratePlaneGeometry);
    planePropertiesFolder.open();

    function regeneratePlaneGeometry() {
      const newGeometry = new THREE.PlaneGeometry(
        planeData.width,
        planeData.height,
        planeData.widthSegments,
        planeData.heightSegments
      );
      plane.geometry.dispose();
      plane.geometry = newGeometry;
    }

    function updateMaterial() {
      material.side = Number(material.side);
      material.needsUpdate = true;
    }

    const animate = () => {
      requestAnimationFrame(animate);
      render();
      stats.update();
    };

    function render() {
      renderer.render(scene, camera);
    }

    animate();

    // Обработчик изменения размера окна
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize, false);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      mountRef.current.removeChild(renderer.domElement);
      gui.destroy();
    };
  }, []);

  return <div ref={mountRef} />;
};

export default DisplacementMap;
