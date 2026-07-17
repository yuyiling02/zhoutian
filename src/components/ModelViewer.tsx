'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Spinner } from '@/components/ui/spinner';
import { Sparkles } from 'lucide-react';
import { loadModelFile, releaseModelFile } from '@/lib/model-download';

interface ModelViewerProps {
  modelUrl: string;
}

const modelCache = new Map<string, THREE.Group>();

export function ModelViewer({ modelUrl }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const qualitySettings = isMobile ? {
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      shadowMapSize: 512,
      enableShadows: false,
      antialias: false,
    } : {
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      shadowMapSize: 1024,
      enableShadows: true,
      antialias: true,
    };

    const scene = new THREE.Scene();
    
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#F8FAFF');
      gradient.addColorStop(1, '#E9EEFF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2, 512);
    }
    
    const gradientTexture = new THREE.CanvasTexture(canvas);
    scene.background = gradientTexture;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: qualitySettings.antialias,
      alpha: true,
      powerPreference: isMobile ? 'low-power' : 'default',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(qualitySettings.pixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = qualitySettings.enableShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();
    scene.environment = envMap;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight1.position.set(5, 10, 7.5);
    directionalLight1.castShadow = qualitySettings.enableShadows;
    if (qualitySettings.enableShadows) {
      directionalLight1.shadow.mapSize.width = qualitySettings.shadowMapSize;
      directionalLight1.shadow.mapSize.height = qualitySettings.shadowMapSize;
      directionalLight1.shadow.camera.near = 0.1;
      directionalLight1.shadow.camera.far = 50;
    }
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, 10, -7.5);
    directionalLight2.castShadow = false;
    scene.add(directionalLight2);

    const setupModel = (model: THREE.Group) => {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      model.scale.setScalar(scale);
      
      model.position.x = -center.x * scale;
      model.position.y = -center.y * scale;
      model.position.z = -center.z * scale;
      
      if (!isMobile) {
        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
            child.castShadow = qualitySettings.enableShadows;
            child.receiveShadow = qualitySettings.enableShadows;
            
            if (child.material instanceof THREE.MeshStandardMaterial || 
                child.material instanceof THREE.MeshPhysicalMaterial) {
              const mat = child.material;
              if (mat.map) mat.map.anisotropy = maxAnisotropy;
              if (mat.normalMap) mat.normalMap.anisotropy = maxAnisotropy;
              if (mat.roughnessMap) mat.roughnessMap.anisotropy = maxAnisotropy;
              if (mat.metalnessMap) mat.metalnessMap.anisotropy = maxAnisotropy;
              if (mat.aoMap) mat.aoMap.anisotropy = maxAnisotropy;
            }
          }
        });
      }
      
      return model;
    };

    const cachedModel = modelCache.get(modelUrl);
    if (cachedModel) {
      const clonedModel = cachedModel.clone();
      setupModel(clonedModel);
      scene.add(clonedModel);
      modelRef.current = clonedModel;
      setLoading(false);
      setError(null);
    } else {
      const loader = new GLTFLoader();
      const handleLoadError = (loadError: unknown) => {
        if (cancelled) return;
        console.error('Error loading model:', loadError);
        const isStaleBlob = modelUrl.startsWith('blob:');
        setError(isStaleBlob ? '模型文件尚未完成上传，请稍后刷新页面重试' : '模型加载失败，请检查文件是否存在');
        setLoading(false);
      };

      loadModelFile(modelUrl, (loaded, total) => {
        if (cancelled || total <= 0) return;
        const percent = Math.round((loaded / total) * 90);
        setProgress(Math.min(90, percent));
      }).then((buffer) => {
        if (cancelled) return;
        loader.parse(
          buffer,
          '',
          (gltf) => {
            if (cancelled) return;
          const model = gltf.scene;
          setupModel(model);
          
          modelCache.set(modelUrl, model.clone());
          
          scene.add(model);
          modelRef.current = model;

          releaseModelFile(modelUrl);
          setProgress(100);
          setLoading(false);
          setError(null);
          },
          handleLoadError,
        );
      }).catch(handleLoadError);
    }

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
      rendererRef.current.setPixelRatio(qualitySettings.pixelRatio);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        container.removeChild(rendererRef.current.domElement);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [modelUrl]);

  return (
    <div className="relative h-full min-h-[400px] w-full overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#E9EEFF]">
          <div className="relative mb-6">
            <Spinner className="size-12 text-[#4E6BFF]" />
            <Sparkles className="absolute -right-1 -top-1 size-6 animate-pulse text-[#4E6BFF]" />
          </div>
          <p className="mb-4 text-sm font-bold text-slate-600">正在加载 3D 模型…</p>
          <div className="w-48 h-2 bg-white/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-[#4E6BFF] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[#718096] mt-2">{progress}%</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#E9EEFF]">
          <div className="text-center px-6">
            <Sparkles className="size-12 text-[#718096] mx-auto mb-4" />
            <p className="text-[#2D3748] font-semibold">{error}</p>
            <p className="text-sm text-[#718096] mt-3">
              请确认 GLB 文件已完整上传，稍后刷新重试。
            </p>
          </div>
        </div>
      )}
      
      {!loading && !error && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:bottom-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 
            bg-white/80 backdrop-blur-sm rounded-2xl
            text-xs text-[#718096] shadow-lg border border-white/30">
            <Sparkles className="size-3 text-[#4E6BFF]" />
            拖动旋转 · 双指缩放 · 双指平移
          </div>
        </div>
      )}
    </div>
  );
}
