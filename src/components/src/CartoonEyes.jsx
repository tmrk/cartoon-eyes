import { useEffect, useId, useState } from 'react';

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

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
    blinkSqueeze = false,
    blinkSpeed = (typeof blinking === 'number') ? blinking : 80,
    blinkFrequency = 3000,
    lensMovement = false,
    lensSpeed = 500,
    title,
    className,
    style,
  } = props;

  // useId gives a stable, per-instance ID so several eyes can share a page;
  // strip React's delimiter characters so the ID is safe inside url(#...)
  const maskId = 'cartoon-eye-mask-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const [lensX, lensY] = lensPosition;
  const [updatedLensPosition, setUpdatedLensPosition] = useState(lensPosition);

  // wander the lens randomly, or follow the lensPosition prop when not wandering
  useEffect(() => {
    if (!lensMovement) {
      setUpdatedLensPosition([lensX, lensY]);
      return;
    }
    const interval = (typeof lensMovement === 'number') ? lensMovement : 1000;
    const intervalId = setInterval(() => {
      setUpdatedLensPosition([randomNumber(-90, 90), randomNumber(-90, 90)]);
    }, interval);
    return () => clearInterval(intervalId);
  }, [lensMovement, lensX, lensY]);

  const [updatedUpperLidSize, setUpdatedUpperLidSize] = useState(upperLidSize);
  const [updatedLowerLidSize, setUpdatedLowerLidSize] = useState(lowerLidSize);
  const [scleraScaleY, setScleraScaleY] = useState(1);

  useEffect(() => {
    setUpdatedUpperLidSize(upperLidSize);
    setUpdatedLowerLidSize(lowerLidSize);
    setScleraScaleY(1);

    // blinking: periodically close both lids, then reopen after blinkSpeed ms
    // (the CSS transition on the lid rects animates the movement)
    if (!blinking) return;
    let timeoutId;
    const doBlink = () => {
      setUpdatedUpperLidSize(100);
      setUpdatedLowerLidSize(100);
      if (blinkSqueeze) setScleraScaleY(0.6);
      timeoutId = setTimeout(() => {
        setUpdatedUpperLidSize(upperLidSize);
        setUpdatedLowerLidSize(lowerLidSize);
        if (blinkSqueeze) setScleraScaleY(1);
      }, blinkSpeed);
    };
    doBlink(); // immediately do just one blink
    const intervalId = setInterval(doBlink, blinkFrequency);
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [upperLidSize, lowerLidSize, blinking, blinkFrequency, blinkSpeed, blinkSqueeze]);

  // calculate actual radius in pixels from percentage (50px is half of the viewbox)
  const scleraRadiusX = 50 / 100 * scleraWidth;
  const scleraRadiusY = 50 / 100 * scleraHeight;
  // a circular iris/pupil is sized against the smaller parent radius so it always
  // fits inside an elliptical parent
  const irisRadiusX = (irisWidth === irisHeight)
    ? Math.min(scleraRadiusX, scleraRadiusY) / 100 * irisWidth
    : scleraRadiusX / 100 * irisWidth;
  const irisRadiusY = (irisWidth === irisHeight)
    ? Math.min(scleraRadiusX, scleraRadiusY) / 100 * irisHeight
    : scleraRadiusY / 100 * irisHeight;
  const pupilRadiusX = (pupilWidth === pupilHeight)
    ? Math.min(irisRadiusX, irisRadiusY) / 100 * pupilWidth
    : irisRadiusX / 100 * pupilWidth;
  const pupilRadiusY = (pupilWidth === pupilHeight)
    ? Math.min(irisRadiusX, irisRadiusY) / 100 * pupilHeight
    : irisRadiusY / 100 * pupilHeight;

  const upperLidHeight = scleraRadiusY / 100 * updatedUpperLidSize;
  const upperLidY = 50 - 2 * scleraRadiusY + upperLidHeight;
  const lowerLidY = 50 + scleraRadiusY - (scleraRadiusY / 100 * updatedLowerLidSize);

  // calculate real lens position from percentage
  const lensOffsetX = (scleraRadiusX - irisRadiusX) / 100 * updatedLensPosition[0];
  const lensOffsetY = (scleraRadiusY - irisRadiusY) / 100 * updatedLensPosition[1];

  const lidTransition = { transition: 'y ' + blinkSpeed + 'ms ease-in' };

  return (
    <svg width={width} height={height} viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'
      className={className ? 'cartoon-eye ' + className : 'cartoon-eye'} style={style}
      preserveAspectRatio='none' role='img' aria-label={title}>
      {title ? <title>{title}</title> : null}
      <defs>
        {/* masks are luminance-based: the ellipse must stay white regardless of scleraColor */}
        <mask id={maskId}>
          <ellipse fill='#ffffff' cx='50' cy='50' rx={scleraRadiusX} ry={scleraRadiusY} />
        </mask>
      </defs>
      <g className='eye' style={{
        transform: 'scaleY(' + scleraScaleY + ')',
        transformOrigin: 'center',
        transition: 'transform ' + blinkSpeed + 'ms ease-in',
      }}>
        <ellipse className='sclera' fill={scleraColor}
          cx='50' cy='50' rx={scleraRadiusX} ry={scleraRadiusY} style={scleraStyle} />
        <g className='lens' mask={'url(#' + maskId + ')'}>
          <g style={{
            transform: 'translate(' + lensOffsetX + 'px,' + lensOffsetY + 'px)',
            transition: 'transform ' + lensSpeed + 'ms ease',
          }}>
            <ellipse className='iris' fill={irisColor} rx={irisRadiusX} ry={irisRadiusY}
              transform='translate(50, 50)' style={irisStyle} />
            <ellipse className='pupil' fill={pupilColor} rx={pupilRadiusX} ry={pupilRadiusY}
              transform='translate(50, 50)' style={pupilStyle} />
          </g>
        </g>
        <g className='eyelids' mask={'url(#' + maskId + ')'}>
          <rect className='upper-lid' fill={upperLidColor} width='100%' height={scleraRadiusY}
            y={upperLidY} style={{ ...lidTransition, ...upperLidStyle }} />
          <rect className='lower-lid' fill={lowerLidColor} width='100%' height={scleraRadiusY}
            y={lowerLidY} style={{ ...lidTransition, ...lowerLidStyle }} />
        </g>
      </g>
    </svg>
  );
};

export default Eye;
