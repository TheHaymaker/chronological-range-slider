import React, {useState, useEffect, useRef} from 'react'
import { Range, getTrackBackground } from 'react-range';

const STEP = 1;
const MIN = 0;
const MAX = 100;

const getIndexValue = key => `${key}`.split('mark')[1]

const App = () => {

  const [selectedValue, setSelectedValue] = useState([50])
  const [selectedFinalValue, setSelectedFinalValue] = useState([50])
  const [knownValues, setKnownValues] = useState([3, 4, 5, 6, 29, 49,50, 51, 52, 53, 60, 82])

  const [totalValues, setTotalValues] = useState([])
  const valueMap = useRef(new Map())
 
  useEffect(() => {

    const everySteppedValue = (() => {
      return [...Array(MAX)].map((val, idx) => {
        
        const stepExists = knownValues.find(step => step === idx)
        if(stepExists) {
          valueMap.current.set(idx, {firstToRight: null, firstToLeft: null})
        }
        return stepExists
      });
    })()

    const mapKeys = Array.from(valueMap.current.keys())
  
    mapKeys.forEach((val, index) => {
      const positions = {
        firstToRight: '',
        firstToLeft: ''
      }

      const isAtBeginning = index === 0
      const isAtEnd = (mapKeys.length - 1) === index
      
      if(isAtBeginning) {
        positions.firstToLeft = val
        positions.firstToRight = mapKeys[index + 1]
      } else if(isAtEnd) {
        positions.firstToLeft = mapKeys[index - 1]
        positions.firstToRight = val
      } else {
        positions.firstToLeft = mapKeys[index - 1]
        positions.firstToRight = mapKeys[index + 1]
      }

      const prevMapValue = valueMap.current.get(val)
      const newMapValue = Object.assign({}, prevMapValue, positions)
      valueMap.current.set(val, newMapValue)
    })

    setTotalValues(everySteppedValue)
    console.log(valueMap)
  }, [knownValues])

  
 // determine if onChange is occuring to the left or right

 // only render yellow marks if the value is present inside the map

const shouldBeRendered = (localMarkProps) => {
  return valueMap.current.has(+getIndexValue(localMarkProps.key))
}

    return (
      <div
        style={{
          margin: '0 auto',
          marginTop: '50px',
          marginBottom: '50px',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 'calc(100% - 100px)',
        }}
      >
        <Range
          values={selectedValue}
          step={STEP}
          min={MIN}
          max={MAX}
          onChange={(value) => setSelectedValue(value)}
          onFinalChange={(value) => setSelectedFinalValue(value)}
          renderMark={({ props, index }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: shouldBeRendered(props) ? '20px' : '6px',
                width: '1px',
                backgroundColor:
                  index * STEP < selectedValue[0] ? '#548BF4' : '#ccc'
              }}
            >
              <div
                style={{
                  width: getIndexValue(props.key) === `${selectedValue[0]}` ? '16px' : '8px',
                  height: getIndexValue(props.key) === `${selectedValue[0]}` ? '16px' : '8px',
                  backgroundColor: '#ff98008c',
                  top: getIndexValue(props.key) === `${selectedValue[0]}` ? '65px' : '20px',
                  position: 'absolute',
                  borderRadius: '100%',
                  left: 0,
                  transform: 'translate(-50%, 0)',
                  transformOrigin: '50%',
                  display: shouldBeRendered(props) ? 'static' : 'none',
                }}
              ></div>
              </div>
          )}
          renderTrack={({ props, children }) => (
            <div
              onMouseDown={props.onMouseDown}
              onTouchStart={props.onTouchStart}
              style={{
                ...props.style,
                height: '36px',
                display: 'flex',
                width: '100%'
              }}
            >
              <div
                ref={props.ref}
                style={{
                  height: '3px',
                  width: '100%',
                  borderRadius: '4px',
                  background: getTrackBackground({
                    values: selectedValue,
                    colors: ['#548BF4', '#ccc'],
                    min: MIN,
                    max: MAX
                  }),
                  alignSelf: 'center'
                }}
              >
                {children}
              </div>
            </div>
          )}
          renderThumb={({ props, isDragged }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '65px',
                width: '10px',
                borderRadius: '4px',
                backgroundColor: '#FFF',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0px 2px 6px #AAA'
              }}
            >
              {/* <div
                style={{
                  height: '16px',
                  width: '5px',
                  backgroundColor: isDragged ? '#548BF4' : '#CCC'
                }}
              /> */}
            </div>
          )}
        />
        <output style={{ marginTop: '30px' }}>
          {selectedValue[0].toFixed(1)}
        </output>
      </div>
    )
}

export default App;
