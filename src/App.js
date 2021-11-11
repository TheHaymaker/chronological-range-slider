import React, {useState, useEffect, useRef} from 'react'
import { Range, getTrackBackground } from 'react-range';

const STEP = 1;
const MIN = 0;
const MAX = 100;

const getIndexValue = key => `${key}`.split('mark')[1]

const App = () => {

  const [selectedValue, setSelectedValue] = useState([50])
  const [selectedFinalValue, setSelectedFinalValue] = useState([50])
  // eslint-disable-next-line no-unused-vars
  const [knownValues, setKnownValues] = useState([3, 4, 5, 6, 29, 49,50, 51, 52, 53, 60, 82])
  // eslint-disable-next-line no-unused-vars
  const [totalValues, setTotalValues] = useState([])
  
  const valueMap = useRef(new Map())
  const emptyValueMap = useRef(new Map())
  const changeCounter = useRef(0)
  const oldSelectedValue = useRef(selectedFinalValue[0])

  const determineClosest = (keyArr, goal) => keyArr.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev)
  
 
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

      everySteppedValue.forEach((val, index) => {
        if(val === undefined) {
          const closest = determineClosest(mapKeys, index)
          emptyValueMap.current.set(index, {closest})
        }
      })

    setTotalValues(everySteppedValue)
  }, [knownValues])

  

  
 // determine if onChange is occuring to the left or right

 // only render yellow marks if the value is present inside the map

const shouldBeRendered = (localMarkProps) => {
  return valueMap.current.has(+getIndexValue(localMarkProps.key))
}

const isRight = (selectedValue, oldValue) => {
  return +selectedValue[0] > +oldValue
}

const provideNextAvailableValue = (bool) => {
    if(bool) {
      return valueMap.current.get(oldSelectedValue.current).firstToRight
    } else {
      return valueMap.current.get(oldSelectedValue.current).firstToLeft
    }
}

const handleOnChange = (value) => {
  if(valueMap.current.has(value[0])) {
    setSelectedValue(value)
    oldSelectedValue.current = value[0]
  } else {
    setSelectedValue(value)
    oldSelectedValue.current = emptyValueMap.current.get(value[0]).closest
  }

  changeCounter.current = changeCounter.current + 1
}
const handleOnFinalChange = (value) => {
  if(valueMap.current.has(value[0])) {
    setSelectedFinalValue(value)
    oldSelectedValue.current = value[0]
  } else {
    // determine if we are heading left or right
    if(Math.abs(selectedFinalValue - value[0]) === 1 && changeCounter.current === 1) {
      const basedOnWhatDirectionIAmHeaded = isRight(selectedValue, oldSelectedValue.current)
      const forceJumpToValue = provideNextAvailableValue(basedOnWhatDirectionIAmHeaded)
      setSelectedValue([forceJumpToValue])
      setSelectedFinalValue([forceJumpToValue])
      setTimeout(() => oldSelectedValue.current = forceJumpToValue, 0)
    } else {
      const forceJumpToValue = emptyValueMap.current.get(value[0]).closest
      setSelectedValue([forceJumpToValue])
      setSelectedFinalValue([forceJumpToValue])
      oldSelectedValue.current = forceJumpToValue
    }
  }
  changeCounter.current = 0
}

  return (
    <>
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
        onChange={handleOnChange}
        onFinalChange={handleOnFinalChange}
        renderMark={({ props, index }) => (
          <div
            {...props}
            style={{
              ...props.style,
              // height: '8px',
              // width: '1px',
              // top: getIndexValue(props.key) === `${selectedValue[0]}` ? '7px' : '17px',
              backgroundColor:
                index * STEP < selectedValue[0] ? '#548BF4' : '#ccc'
            }}
          >
            <div
              style={{
                boxShadow: getIndexValue(props.key) === `${selectedValue[0]}` ? 'rgb(63, 81, 181) 0px 0px 0px 1px, grey 0px 0px 14px 1px' : '0px 0px 0px 1px #3f51b5',
                width: getIndexValue(props.key) === `${selectedValue[0]}` ? '4px' : '12px',
                height: getIndexValue(props.key) === `${selectedValue[0]}` ? '20px' : '12px',
                backgroundColor: getIndexValue(props.key) === `${selectedValue[0]}` ? '#ff9800' : '#548bf4',
                top: getIndexValue(props.key) === `${selectedValue[0]}` ? '0px' : '-6px',
                position: 'absolute',
                borderRadius: getIndexValue(props.key) === `${selectedValue[0]}` ? '2px': '14px',
                left: '0',
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
                height: '4px',
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
        renderThumb={({ props, isDragged }) => {
          console.log(props['aria-valuenow'])
          return (
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
            <div
              style={{
                boxShadow: 'rgb(63, 81, 181) 0px 0px 0px 1px, grey 0px 0px 14px 1px',
                width: '4px',
                height: '20px',
                backgroundColor: '#ff9800',
                borderRadius: '2px',
                display: valueMap.current.has(props['aria-valuenow'])  ? 'block' : 'none',
                zIndex: valueMap.current.has(props['aria-valuenow']) ? '1' : 'inherit',
                pointerEvents: valueMap.current.has(props['aria-valuenow']) ? 'none' : 'inherit'
              }}
            >
              <div style={{
                position: "absolute",
                top: "-20px",
                backgroundColor: "white",
                boxShadow:" 0px 2px 10px -2px #00000096",
                padding: "5px",
                borderRadius: "24px",
                lineHeight: "1rem",
                left: "50%",
                transform: "translate(-50%, 0%)",
                transformOrigin: "50% 0%",
                fontWeight: "bold"
              }}>
                {props['aria-valuenow']}
              </div>
              </div>
          </div>
        )}}
      />
      <div style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "left"

      }}>
      <p style={{ marginTop: '30px' }}>
        On Change: <strong>{selectedValue[0].toFixed(1)}</strong>
      </p>
    
      <p style={{ marginTop: '30px' }}>
        On FinalChange: <strong>{selectedFinalValue[0].toFixed(1)}</strong>
      </p>

      </div>
    </div>
      </>
    )
}

export default App;
