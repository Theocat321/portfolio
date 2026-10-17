export function SceneSetup() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 3, 5]} intensity={2.5} />
      <fog attach="fog" args={['#050505', 8, 20]} />
    </>
  )
}
