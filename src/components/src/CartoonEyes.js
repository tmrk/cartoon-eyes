import React, { useState, useEffect } from 'react';

export const Eye = (props) => {

  // destructure props and set defaults
  const { 
    size,
    width = size,
    height = size,
    scleraWidth = 100,
    scleraHeight = 100,
    scleraColor = '#ffffff',
    scleraStyle = {},
    lensPosition = [0, 0],
    irisSize = 60,
    irisWidth = irisSize,
    irisHeight = irisSize,
    irisColor = '#666666',
    irisStyle = {},
    pupilSize = 50,
    pupilWidth = pupilSize,
    pupilHeight = pupilSize,
    pupilColor = '#000000',
    pupilStyle = {},
    lidSize = 20,
    lidColor = '#aaaaaa',
    upperLidSize = lidSize,
    upperLidColor = lidColor,
    upperLidStyle = {},
    lowerLidSize = lidSize,
    lowerLidColor = lidColor,
    lowerLidStyle = {},
    blinking = false,
    blinkSqueeze = false, // buggy!
    blinkSpeed = (typeof blinking == 'number') ? blinking : 80,
    blinkFrequency = 3000,
    lensMovement = false
  } = props;

  const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) ) + min;
  const [updatedLensPosition, setUpdatedLensPosition] = useState(lensPosition);

  useEffect(() => {
    function randomLensPostion() {
      setUpdatedLensPosition([ randomNumber(-90, 90), randomNumber(-90, 90) ]);
      setTimeout(() => randomLensPostion(), 1000);
    }
    if (lensMovement) randomLensPostion();
  }, [lensMovement]);

  const [updatedUpperLidSize, setUpdatedUpperLidSize] = useState(upperLidSize);
  const [updatedLowerLidSize, setUpdatedLowerLidSize] = useState(lowerLidSize);
  const [scleraScaleY, setScleraScaleY] = useState(1);

  useEffect(() => {
    setUpdatedUpperLidSize(upperLidSize);
    setUpdatedLowerLidSize(lowerLidSize);
    if (blinkSqueeze) setScleraScaleY(1);

    // create blinking animation with setInterval (& CSS transition)
    if (blinking) {
      const doBlink = () => {
        setUpdatedUpperLidSize(100);
        setUpdatedLowerLidSize(100);
        if (blinkSqueeze) setScleraScaleY(0.5);
        setTimeout(function () {
          setUpdatedUpperLidSize(upperLidSize);
          setUpdatedLowerLidSize(lowerLidSize);
          if (blinkSqueeze) setScleraScaleY(1);
        }, blinkSpeed);
      }
      doBlink(); // immediately do just one blink
      const intervalBlinking = setInterval(doBlink, blinkFrequency); // set up repeated blinks
      return () => clearInterval(intervalBlinking);
    }
  }, [upperLidSize, lowerLidSize, blinking, blinkFrequency, blinkSpeed, blinkSqueeze]);

  // calculate actual radius in pixels from percentage (50px is half of the viewbox)
  const scleraRadiusX = 50 / 100 * scleraWidth;
  const scleraRadiusY = 50 / 100 * scleraHeight;
  const irisRadiusX = (irisWidth === irisHeight) ? // if the iris is a circle, then make sure it will also fit in the Y radius of the sclera, which may be an ellipse
                      Math.min(scleraRadiusX, scleraRadiusY) / 100 * irisWidth : 
                      scleraRadiusX / 100 * irisWidth;
  const irisRadiusY = (irisWidth === irisHeight) ? // if the iris is a circle, then make sure it will also fit in the X radius of the sclera, which may be an ellipse
                      Math.min(scleraRadiusX, scleraRadiusY) / 100 * irisHeight : 
                      scleraRadiusY / 100 * irisHeight;
  const pupilRadiusX = (pupilWidth === pupilHeight) ? // if the pupil is a circle, then make sure it will also fit in the Y radius of the iris, which may be an ellipse
                      Math.min(irisRadiusX, irisRadiusY) / 100 * pupilWidth : 
                      irisRadiusX / 100 * pupilWidth;
  const pupilRadiusY = (pupilWidth === pupilHeight) ? // if the pupil is a circle, then make sure it will also fit in the X radius of the iris, which may be an ellipse
                      Math.min(irisRadiusX, irisRadiusY) / 100 * pupilHeight : 
                      irisRadiusY / 100 * pupilHeight;

  const upperLidHeight = scleraRadiusY / 100 * updatedUpperLidSize;
  const upperLidY = 50 - scleraRadiusY - scleraRadiusY + upperLidHeight;
  const lowerLidY = 50 + scleraRadiusY - (scleraRadiusY / 100 * updatedLowerLidSize);
  
  // calculate real lens position from percentage
  const lensX = (scleraRadiusX - irisRadiusX) / 100 * updatedLensPosition[0];
  const lensY = (scleraRadiusY - irisRadiusY) / 100 * updatedLensPosition[1];

  const ts = new Date().getTime(); // this is to avoid repeated element IDs if more than one SVG are loaded on the same page

  return (
    <svg width={width} height={height} viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' 
      className='cartoon-eye' preserveAspectRatio='none'>
      <defs>
        <mask id={'mask-sclera-' + ts}
          style={{
            transform: 'scaleY(' + scleraScaleY + ')', 
            transformOrigin: 'center',
            transition: 'transform ' + blinkSpeed + 'ms ease-in'
          }}
        >
          <ellipse id={'sclera-' + ts} className='sclera' fill={scleraColor} 
            cx='50' cy='50' rx={scleraRadiusX} ry={scleraRadiusY} 
            style={{...scleraStyle, ...{
              transform: 'scaleY(' + scleraScaleY + ')', 
              transformOrigin: 'center',
              transition: 'transform ' + blinkSpeed + 'ms ease-in'
            }}} />
        </mask>
      </defs>
      <use href={'#sclera-' + ts} className='sclera' />
      <g className='lens' mask={'url(#mask-sclera-'+ ts +')'}>
        <g style={{ transform: 'translate(' + lensX + 'px,' + lensY + 'px)', transition: 'all 0.5s ease' }}>
          <ellipse className='iris' fill={irisColor} rx={irisRadiusX} ry={irisRadiusY} transform='translate(50, 50)' style={irisStyle} />
          <ellipse className='pupil' fill={pupilColor} rx={pupilRadiusX} ry={pupilRadiusY} transform='translate(50, 50)' style={pupilStyle} />
        </g>
      </g>
      <g className='eyelids' mask={'url(#mask-sclera-'+ ts +')'}>
        <rect className='upper-lid' fill={upperLidColor} width='100%' height={scleraRadiusY} y={upperLidY} style={{...upperLidStyle, ...{transition: 'all '+ blinkSpeed +'ms ease-in'}}} />
        <rect className='lower-lid' fill={lowerLidColor} width='100%' height={scleraRadiusY} y={lowerLidY} style={{...lowerLidStyle, ...{transition: 'all '+ blinkSpeed +'ms ease-in'}}}/>
      </g>
    </svg>
  );
}
