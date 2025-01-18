import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { saveAs } from 'file-saver';

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
  
    const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('img/test2.png');
    
    
      

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
    boxPropertiesFolder.add(boxData, 'widthSegments', 1, 400).onChange(regenerateBoxGeometry);
    boxPropertiesFolder.add(boxData, 'heightSegments', 1, 400).onChange(regenerateBoxGeometry);
   
    boxPropertiesFolder.add(boxData, 'width', 0.1, 10).onChange(regenerateBoxGeometry);
    boxPropertiesFolder.add(boxData, 'height', 0.1, 10).onChange(regenerateBoxGeometry);
    boxPropertiesFolder.add(boxData, 'depth', 0.01, 0.1).onChange(regenerateBoxGeometry);
    boxPropertiesFolder.open();

    

    const exportToSTL = () => {
        const exporter = new STLExporter();
        const result = exporter.parse(scene); // Экспортируем всю сцену или конкретный объект
    
        const blob = new Blob([result], { type: 'text/plain' });
        saveAs(blob, 'model.stl');
      };

      const applyDisplacementMapToFace = (geometry, faceIndex, displacementMap, displacementScale) => {
        const positions = geometry.attributes.position;
        const normals = geometry.attributes.normal;
        const uvs = geometry.attributes.uv;
      
        if (!positions || !normals || !uvs || !displacementMap) {
          return;
        }
      
        const texture = displacementMap.image;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
      
        canvas.width = texture.width;
        canvas.height = texture.height;
        ctx.drawImage(texture, 0, 0);
      
        const imageData = ctx.getImageData(0, 0, texture.width, texture.height).data;
      
        // Найти индексы вершин для передней грани
        const faceVertexIndices = [];
        const positionArray = positions.array;
      
        for (let i = 0; i < positionArray.length; i += 3) {
          const z = positionArray[i + 2]; // Проверяем координату Z
          if (Math.abs(z - 0.5) < 0.001) { // Грани с Z ≈ 0.5
            faceVertexIndices.push(i / 3);
          }
        }
      
        for (const i of faceVertexIndices) {
          const uv = new THREE.Vector2(uvs.getX(i), uvs.getY(i));
          const u = Math.floor(uv.x * texture.width);
          const v = Math.floor(uv.y * texture.height);
      
          const index = (v * texture.width + u) * 4;
          const displacement = imageData[index] / 255 * displacementScale;
      
          const normal = new THREE.Vector3(normals.getX(i), normals.getY(i), normals.getZ(i));
          const position = new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));
      
          normal.multiplyScalar(displacement);
          position.add(normal);
      
          positions.setXYZ(i, position.x, position.y, position.z);
        }
      
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
      };
      
      
    const exportButton = document.createElement('button');
    exportButton.innerText = 'Export to STL';
    exportButton.style.position = 'fixed';
    exportButton.style.bottom = '10px';
    exportButton.style.right = '10px';
    exportButton.style.zIndex = '1000'; // Устанавливаем z-index, чтобы кнопка была поверх всего
    exportButton.onclick = exportToSTL;
    document.body.appendChild(exportButton);

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
