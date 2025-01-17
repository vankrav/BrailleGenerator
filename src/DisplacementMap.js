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
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(6, 6, 6);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x404040, 1);  // Мягкий белый свет
scene.add(ambientLight);


    // Заменили PlaneGeometry на BoxGeometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 0.1;

    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth, 100, 100, 100);
    boxGeometry.computeVertexNormals();
    // Создаём материал
    const material = new THREE.MeshStandardMaterial();
    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load('/img/test2.png');
    // material.map = texture;
    // material.displacementMap = textureLoader.load('/img/test2.png');
    // material.displacementScale = 0.1;

    // Создаём массив материалов для каждой стороны куба
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide }),  // Верхняя сторона
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide }),  // Нижняя сторона
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide }),  // Левая сторона
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide }),  // Правая сторона
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide }),  // Передняя сторона с картой
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide }),  // Задняя сторона
      ];

    // Применяем displacementMap только к передней стороне
    materials[4].map = texture;
    materials[4].displacementMap = texture;
    materials[4].displacementScale = 0.1;

    const box = new THREE.Mesh(boxGeometry, materials);
    scene.add(box);

    const stats = new Stats();
    document.body.appendChild(stats.dom);

    const gui = new GUI();

    // Добавление контролов для каждого материала
    const materialFolder = gui.addFolder('Material Controls');
    materialFolder.add(material, 'transparent').onChange(() => {
      materials.forEach((mat) => mat.needsUpdate = true);
    });
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

    const meshStandardMaterialFolder = gui.addFolder('Mesh Standard Material');
    meshStandardMaterialFolder.addColor(data, 'color').onChange(() => {
      materials.forEach((mat) => mat.color.setHex(Number(data.color.toString().replace('#', '0x'))));
    });
    // meshStandardMaterialFolder.addColor(data, 'emissive').onChange(() => {
    //   materials.forEach((mat) => mat.emissive.setHex(Number(data.emissive.toString().replace('#', '0x'))));
    // });
    meshStandardMaterialFolder.add(materials[4], 'wireframe');
    meshStandardMaterialFolder.add(materials[4], 'flatShading').onChange(() => updateMaterial());
    meshStandardMaterialFolder.add(materials[4], 'displacementScale', 0, 0.1, 0.01);

    meshStandardMaterialFolder.add(materials[4], 'roughness', 0, 1);
    meshStandardMaterialFolder.add(materials[4], 'metalness', 0, 1);
    meshStandardMaterialFolder.open();

    // Настройки для геометрии
    const boxData = {
      width: boxWidth,
      height: boxHeight,
      depth: boxDepth,
      widthSegments: 100,
      heightSegments: 100,
      depthSegments: 1,
    };

    const boxPropertiesFolder = gui.addFolder('Box Geometry');
    boxPropertiesFolder.add(boxData, 'widthSegments', 1, 200).onChange(regenerateBoxGeometry);
    boxPropertiesFolder.add(boxData, 'heightSegments', 1, 200).onChange(regenerateBoxGeometry);
   
    boxPropertiesFolder.add(boxData, 'width', 0.1, 10).onChange(regenerateBoxGeometry);
    boxPropertiesFolder.add(boxData, 'height', 0.1, 10).onChange(regenerateBoxGeometry);
    boxPropertiesFolder.add(boxData, 'depth', 0.01, 0.1).onChange(regenerateBoxGeometry);
    boxPropertiesFolder.open();

    function regenerateBoxGeometry() {
      const newGeometry = new THREE.BoxGeometry(
        boxData.width,
        boxData.height,
        boxData.depth,
        boxData.widthSegments,
        boxData.heightSegments,
        boxData.depthSegments
      );
      box.geometry.dispose();
      box.geometry = newGeometry;
    }

    function updateMaterial() {
      materials.forEach((mat) => {
        mat.needsUpdate = true;
      });
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
