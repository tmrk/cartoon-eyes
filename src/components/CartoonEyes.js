import React from 'react';
import './CartoonEyesAnimations.css';

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
    lensPosition = [70, 70],
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
    blinking = false
  } = props;

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

  const upperLidHeight = scleraRadiusY / 100 * upperLidSize;
  const upperLidY = 50 - scleraRadiusY - scleraRadiusY + upperLidHeight;
  const lowerLidY = 50 + scleraRadiusY - (scleraRadiusY / 100 * lowerLidSize);
  
  // calculate real lens position from percentage
  const lensX = (scleraRadiusX - irisRadiusX) / 100 * lensPosition[0];
  const lensY = (scleraRadiusY - irisRadiusY) / 100 * lensPosition[1];

  const ts = new Date().getTime(); // this is to avoid repeated element IDs if more than one SVG are loaded on the same page

  return (
    <svg width={width} height={height} 
      className={`cartoon-eye ${blinking ? 'blinking' : ''}`} 
      style={blinking ? {'--blinking-speed': blinking + 's' } : {}}
      xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>
      <defs>
        <mask id={'mask-sclera-' + ts}>
          <ellipse id={'sclera-' + ts} className='sclera' fill={scleraColor} cx='50' cy='50' rx={scleraRadiusX} ry={scleraRadiusY} style={scleraStyle} />
        </mask>
      </defs>
      <use href={'#sclera-' + ts} className='sclera' />
      <g className='lens' mask={'url(#mask-sclera-'+ ts +')'} style={{'--lens-X': lensX + '%', '--lens-Y': lensY + '%'}}>
        <g transform={'translate(' + lensX + ',' + lensY + ')'}>
          <ellipse className='iris' fill={irisColor} rx={irisRadiusX} ry={irisRadiusY} transform='translate(50, 50)' style={irisStyle} />
          <ellipse className='pupil' fill={pupilColor} rx={pupilRadiusX} ry={pupilRadiusY} transform='translate(50, 50)' style={pupilStyle} />
        </g>
      </g>
      {(upperLidSize || lowerLidSize) ?
        <g className='eyelids' mask={'url(#mask-sclera-'+ ts +')'}>
          {upperLidSize ?
            <rect className='upper-lid' fill={upperLidColor} width='100%' height={scleraRadiusY} y={upperLidY} style={{...upperLidStyle, ...{'--upper-lid-Y': upperLidY + '%', '--sclera-radius-Y': scleraRadiusY + '%', '--upper-lid-height': upperLidHeight + '%'}}} />
          : ''}
          {lowerLidSize ?
            <rect className='lower-lid' fill={lowerLidColor} width='100%' height={scleraRadiusY} y={lowerLidY} style={{...lowerLidStyle, ...{'--lower-lid-open': lowerLidY + '%'}}} />
          : ''}
        </g>
      : ''}
    </svg>
  );
}
