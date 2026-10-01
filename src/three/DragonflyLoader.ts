import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';

export interface LoadedDragonfly {
  scene: THREE.Group;
  flyGroup: THREE.Group;
  animations: THREE.AnimationClip[];
  mixer: THREE.AnimationMixer;
  podium: THREE.Object3D | null;
  glowMaterials: THREE.MeshStandardMaterial[];
  restTransforms: Map<string, { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 }>;
  headYawNode: THREE.Object3D | null;
  headPitchNode: THREE.Object3D | null;
  tailNode: THREE.Object3D | null;
}

export async function loadDragonfly(
  url: string,
  onProgress?: (progress: number) => void
): Promise<LoadedDragonfly> {
  // Ensure MeshoptDecoder WASM is initialized
  await MeshoptDecoder.ready;

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        const animations = gltf.animations;
        const mixer = new THREE.AnimationMixer(scene);

        // 1. Ensure world transforms are computed
        scene.updateMatrixWorld(true);

        // 2. Find podium and dragonfly master root
        const podium = scene.getObjectByName('DF_PODIUM_MASTER') || null;
        const dragonflyRoot = scene.getObjectByName('DF_MASTER_ROOT') || null;

        // 3. Detach podium completely from the dragonfly rig and anchor it directly to scene
        // This guarantees the platform NEVER moves when flight takes place
        if (podium) {
          scene.attach(podium);
          // Optimize static podium: freeze matrix calculations for zero CPU overhead
          podium.traverse((node) => {
            node.matrixAutoUpdate = false;
            node.updateMatrix();
          });
        }

        // 4. Dedicated flyGroup for flight kinematics and mouse following
        // Because podium was detached to scene, assetRoot now contains exclusively the dragonfly
        // Keeping DF_MASTER_ROOT inside RAKSHANI_MACHINA_ASSET preserves its native 0.01 rig scale
        const flyGroup = new THREE.Group();
        flyGroup.name = 'DF_FLY_GROUP';
        scene.add(flyGroup);

        const assetRoot = scene.getObjectByName('RAKSHANI_MACHINA_ASSET');
        if (assetRoot) {
          flyGroup.add(assetRoot);
        } else if (dragonflyRoot) {
          flyGroup.add(dragonflyRoot);
        }

        // Capture rest transforms for all named nodes to guarantee zero-drift recovery
        const restTransforms = new Map<string, { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 }>();
        scene.traverse((node) => {
          if (node.name) {
            restTransforms.set(node.name, {
              position: node.position.clone(),
              quaternion: node.quaternion.clone(),
              scale: node.scale.clone()
            });
          }
        });

        // Track materials that should receive selective glow in Obsidian mode
        const glowMaterials: THREE.MeshStandardMaterial[] = [];
        const glowMaterialNames = [
          'MAT_EyeInnerOptical',
          'MAT_EyeOuterGlass',
          'MAT_EmissionTeal',
          'MAT_Tail_Photonic',
          'MAT_Wing_Photonic',
          'MAT_Thorax_PhotonicTeal'
        ];

        // Configure shadows & material transparency
        scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;

            const isPodium = mesh.name.startsWith('DF_PODIUM');
            if (isPodium) {
              mesh.receiveShadow = true;
              mesh.castShadow = false;
            } else {
              // Only the thin translucent wing membrane uses alpha blending and deferred renderOrder
              const isWingMembrane = mat && mat.name === 'MAT_Wing_Membrane';
              if (isWingMembrane) {
                mesh.castShadow = false;
                mesh.receiveShadow = false;
                if (mat) {
                  mat.side = THREE.DoubleSide;
                  mat.transparent = true;
                  mat.depthWrite = false;
                  mat.alphaTest = 0.02;
                  mat.fog = false;
                  mesh.renderOrder = 10;
                }
              } else {
                // All tail segments 01-09, optical buses, body, legs, thorax strictly solid with depthWrite
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                if (mat) {
                  mat.transparent = false;
                  mat.depthWrite = true;
                  mat.depthTest = true;
                  mat.fog = false;
                }
                mesh.renderOrder = 0;
              }
            }

            if (mat && glowMaterialNames.includes(mat.name)) {
              if (!glowMaterials.includes(mat)) {
                glowMaterials.push(mat);
              }
            }
          }
        });

        // Find head and tail nodes
        const headYawNode = scene.getObjectByName('DF_HEAD_Neck_Yaw') || null;
        const headPitchNode = scene.getObjectByName('DF_HEAD_Neck_Pitch') || null;
        const tailNode = scene.getObjectByName('DF_TAIL_SEG_01') || scene.getObjectByName('DF_ABDOMEN_RECEIVER') || null;

        resolve({
          scene,
          flyGroup,
          animations,
          mixer,
          podium,
          glowMaterials,
          restTransforms,
          headYawNode,
          headPitchNode,
          tailNode
        });
      },
      (xhr) => {
        if (xhr.lengthComputable && onProgress) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          onProgress(percent);
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}
