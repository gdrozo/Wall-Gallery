import Photo from "./Photo"

const GALLERY_ITEMS = [     // x,  y,  z
  { file: '1.jpg', position: [-4.970214016722147,1.6642945515481717,0] },
  { file: '2.jpg', position: [-2.970151130919482,4.507367888566136,0] },
  { file: '3.jpg', position: [0.8955289582181891,3.1268891364935314,0] },
  { file: '4.jpg', position: [5.499937114197333,4.970025359314156,0] },
  { file: '5.jpg', position: [-2.94785880781309,-0.9253149414960422,0] },
  { file: '6.jpg', position: [-3.574496401095964,-6.298111375989198,0] },
  { file: '7.jpg', position: [1.6044710417818104,0.08954660724155084,0] },
  { file: '8.jpg', position: [5.887972412244061,1.9998742283946738,0] },
  { file: '9.jpg', position: [-6.82821178828037,-1.5821787186754186,0]},
  { file: '10.jpg', position: [-1.2462846128155998,-3.8357683342544897,0] },
  { file: '11.jpg', position: [2.3357683342544906,-2.5224180947117194,0] },
  { file: '12.jpg', position: [6.216309972129761,-1.9702140167221462,0] },
  { file: '13.jpg', position: [2.36542854592702,-5.925377827298709,0] },
  { file: '14.jpg', position: [5.7534638439737416,-4.880667409480594,0] },
]

function Gallery() {
  return (
    <group position={[0, 1, -4]}> 
      {GALLERY_ITEMS.map((item) => (
        <Photo 
          key={item.file} 
          id={item.file}
          url={`/photos/${item.file}`} 
          position={item.position as [number, number, number]} 
        />
      ))}
    </group>
  )
}

export default Gallery