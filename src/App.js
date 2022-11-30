import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  useGLTF,
  OrbitControls,
  softShadows,
  PivotControls,
  GizmoHelper,
  GizmoViewcube,
  GizmoViewport,
  useCursor,
  meshBounds,
  Bounds,
  useBounds,
  Html
} from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import { MeshStandardMaterial } from 'three'
import { renderToString } from 'react-dom/server'

softShadows()
const range = 20
const datas = [
  {
    name: 'Alpaca',
    position: [Math.random() * range * 2 - range, 0, Math.random() * range * 2 - range],
    rotateY: Math.random() * Math.PI * 2
  },
  {
    name: 'Antelope',
    position: [Math.random() * range * 2 - range, 0, Math.random() * range * 2 - range],
    rotateY: Math.random() * Math.PI * 2
  },
  {
    name: 'Baboon',
    position: [Math.random() * range * 2 - range, 0, Math.random() * range * 2 - range],
    rotateY: Math.random() * Math.PI * 2
  },
  {
    name: 'Badger',
    position: [Math.random() * range * 2 - range, 0, Math.random() * range * 2 - range],
    rotateY: Math.random() * Math.PI * 2
  },
  {
    name: 'Bear',
    position: [Math.random() * range * 2 - range, 0, Math.random() * range * 2 - range],
    rotateY: Math.random() * Math.PI * 2
  },
  {
    name: 'Bull',
    position: [Math.random() * range * 2 - range, 0, Math.random() * range * 2 - range],
    rotateY: Math.random() * Math.PI * 2
  },
  {
    name: 'Cardinal',
    position: [Math.random() * range * 2 - range, 0, Math.random() * range * 2 - range],
    rotateY: Math.random() * Math.PI * 2
  },
  {
    name: 'Chameleon',
    position: [Math.random() * range * 2 - range, 0, Math.random() * range * 2 - range],
    rotateY: Math.random() * Math.PI * 2
  }
]

export default function App() {
  const cntRef = useRef()
  const ref = useRef()
  const boundaryRef = useRef()
  const [edit, setEdit] = useState(true)

  return (
    <Canvas ref={ref} shadows raycaster={{ params: { Line: { threshold: 0.15 } } }} camera={{ position: [-200, 200, 200], fov: 10 }}>
      <ambientLight intensity={0.5} />
      <directionalLight castShadow position={[1.5, 8, 5]} intensity={1.5} shadow-mapSize={[1024, 1024]}>
        <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 1, 50]} far={100} />
      </directionalLight>
      <Bounds clip observe margin={2}>
        <mesh ref={boundaryRef} visible={false}>
          <boxGeometry args={[20, 20, 20]} />
        </mesh>
        <Ocean />
        <Sky />
        <Island />
        <Items cntRef={cntRef} boundaryRef={boundaryRef} datas={datas} />
      </Bounds>

      {edit && (
        <GizmoHelper alignment="top-right" margin={[100, 100]}>
          <group scale={0.85}>
            <GizmoViewcube />
          </group>
          <group scale={1.75} position={[30, -30, -30]} rotation={[0, -Math.PI / 2, 0]}>
            <GizmoViewport labelColor="white" axisHeadScale={0.525} hideNegativeAxes />
          </group>
        </GizmoHelper>
      )}

      <OrbitControls makeDefault screenSpacePanning={true} regress={false} ref={cntRef} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  )
}

function Sky(props) {
  const { nodes, materials } = useGLTF(process.env.PUBLIC_URL + '/Sky.glb')
  const _materials = new MeshStandardMaterial(materials[Object.keys(materials)[0]])
  return <mesh {...props} geometry={nodes.Sky.geometry} material={_materials} dispose={null}></mesh>
}

function Ocean(props) {
  const { nodes, materials } = useGLTF(process.env.PUBLIC_URL + '/Ocean.glb')
  const _materials = new MeshStandardMaterial(materials[Object.keys(materials)[0]])
  return <mesh {...props} geometry={nodes.Ocean.geometry} material={_materials} dispose={null}></mesh>
}

function Island(props) {
  const { nodes, materials } = useGLTF(process.env.PUBLIC_URL + '/Island.glb')
  const _materials = new MeshStandardMaterial(materials[Object.keys(materials)[0]])
  return <mesh receiveShadow {...props} geometry={nodes.Island.geometry} material={_materials} dispose={null}></mesh>
}

const Items = (props) => {
  const [selectedMesh, setSelectedMesh] = useState('')
  const cntRef = props.cntRef
  const boundaryRef = props.boundaryRef
  const datas = props.datas

  useFrame((state, dt) => {
    if (selectedMesh) {
      cntRef.current.enabled = false
      cntRef.current.setAzimuthalAngle(selectedMesh.rotation._y)
      cntRef.current.setPolarAngle(Math.PI / 2)
    } else {
      cntRef.current.enabled = true
    }
  })

  return (
    <group>
      {datas.map((data, idx) => (
        <Item key={data.name + idx} selectedMesh={selectedMesh} setSelectedMesh={setSelectedMesh} boundaryRef={boundaryRef} data={data} />
      ))}
    </group>
  )
}

const Item = (props) => {
  const selectedMesh = props.selectedMesh
  const setSelectedMesh = props.setSelectedMesh
  const boundaryRef = props.boundaryRef
  const data = props.data
  const { nodes, materials } = useGLTF(process.env.PUBLIC_URL + `/${data.name}.glb`)
  const _materials = new MeshStandardMaterial(materials[Object.keys(materials)[0]])
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState(false)
  const ref = useRef(null)
  const api = useBounds()
  const matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, data.position[2], data.position[1], data.position[0], 1]
  const pivotRef = useRef()

  useEffect(() => {
    if (selectedMesh === ref.current) {
      setSelected(true)
    } else {
      setSelected(false)
    }
  }, [selectedMesh])

  useCursor(hovered)
  return (
    <PivotControls
      rotation={[0, -Math.PI / 2, 0]}
      anchor={[1, -1, -1]}
      scale={75}
      depthTest={false}
      fixed
      lineWidth={2}
      activeAxes={[true, true, true]}
      disableRotations={true}
      disableAxes={!selected}
      disableSliders={!selected}
      annotationsClass
      matrix={matrix}
      ref={pivotRef}
      visible={selected}>
      {selected && (
        <Html className="content" center occlude={pivotRef}>
          <div className="wrapper">lzsdgzsgzsdgzsdgzsgzds</div>
        </Html>
      )}
      <mesh
        ref={ref}
        raycast={meshBounds}
        castShadow
        {...props}
        geometry={nodes[data.name].geometry}
        material={_materials}
        rotation={[0, data.rotateY, 0]}
        dispose={null}
        material-color={hovered && !selected ? 'lightgray' : 'white'}
        onPointerOver={(e) => (setHovered(true), e.stopPropagation())}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedMesh(e.object)
          api.refresh(e.object).clip().fit()
        }}
        onPointerMissed={(e) => {
          if (e.button === 0) {
            api.refresh(boundaryRef.current).clip().fit()
            setSelectedMesh('')
          }
        }}
      />
    </PivotControls>
  )
}
