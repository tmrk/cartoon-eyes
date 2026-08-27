import { useEffect, useId, useState } from 'react';

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// an ellipse centred on the origin, drawn as two arcs; two of these in one path
// with fill-rule evenodd make a ring, the inner one punching the hole
const ellipsePath = (rx, ry) =>
  'M ' + -rx + ' 0 A ' + rx + ' ' + ry + ' 0 1 0 ' + rx + ' 0 A ' + rx + ' ' + ry + ' 0 1 0 ' + -rx + ' 0 Z';

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
    eyeOutlineThickness = 0,
    eyeOutlineColor = '#000000',
    eyeOutlineStyle = {},
    lensPosition = [0, 0],
    rotation = 0,
    rotationSpeed = 0,
    irisSize = 60,
    irisWidth = irisSize,
    irisHeight = irisSize,
    irisColor = '#666666',
    irisStyle = {},
    limbusThickness = 0,
    limbusColor = '#000000',
    limbusStyle = {},
    pupilSize = 50,
    pupilWidth = pupilSize,
    pupilHeight = pupilSize,
    pupilColor = '#000000',
    pupilStyle = {},
    catchlightSize = 0,
    catchlightWidth = catchlightSize,
    catchlightHeight = catchlightSize,
    catchlightPosition = [-40, -40],
    catchlightColor = '#ffffff',
    catchlightStyle = {},
    lidSize = 20,
    lidColor = '#aaaaaa',
    upperLidSize = lidSize,
    upperLidColor = lidColor,
    upperLidStyle = {},
    lowerLidSize = lidSize,
    lowerLidColor = lidColor,
    lowerLidStyle = {},
    eyelinerSize = 0,
    eyelinerColor = '#000000',
    upperEyelinerSize = eyelinerSize,
    upperEyelinerColor = eyelinerColor,
    upperEyelinerStyle = {},
    lowerEyelinerSize = eyelinerSize,
    lowerEyelinerColor = eyelinerColor,
    lowerEyelinerStyle = {},
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
  // the outline eats inwards from the sclera edge the way the limbus does inside
  // the iris, so switching it on never grows the eye past the drawing area
  const eyeOutlineRatio = Math.min(100, Math.max(0, eyeOutlineThickness)) / 100;
  // a circular iris/pupil is sized against the smaller parent radius so it always
  // fits inside an elliptical parent
  const irisRadiusX = (irisWidth === irisHeight)
    ? Math.min(scleraRadiusX, scleraRadiusY) / 100 * irisWidth
    : scleraRadiusX / 100 * irisWidth;
  const irisRadiusY = (irisWidth === irisHeight)
    ? Math.min(scleraRadiusX, scleraRadiusY) / 100 * irisHeight
    : scleraRadiusY / 100 * irisHeight;
  // the limbus eats inwards from the iris edge: it takes the outer
  // `limbusThickness`% of each iris radius, so the iris keeps its outer size and
  // the lens movement, clipping and pupil sizing below are unaffected by it
  const limbusRatio = Math.min(100, Math.max(0, limbusThickness)) / 100;
  const irisFillRadiusX = irisRadiusX * (1 - limbusRatio);
  const irisFillRadiusY = irisRadiusY * (1 - limbusRatio);
  const pupilRadiusX = (pupilWidth === pupilHeight)
    ? Math.min(irisRadiusX, irisRadiusY) / 100 * pupilWidth
    : irisRadiusX / 100 * pupilWidth;
  const pupilRadiusY = (pupilWidth === pupilHeight)
    ? Math.min(irisRadiusX, irisRadiusY) / 100 * pupilHeight
    : irisRadiusY / 100 * pupilHeight;
  // the catchlight measures against the full outer iris, limbus included, so a
  // limbus never resizes or shifts it
  const catchlightRadiusX = (catchlightWidth === catchlightHeight)
    ? Math.min(irisRadiusX, irisRadiusY) / 100 * catchlightWidth
    : irisRadiusX / 100 * catchlightWidth;
  const catchlightRadiusY = (catchlightWidth === catchlightHeight)
    ? Math.min(irisRadiusX, irisRadiusY) / 100 * catchlightHeight
    : irisRadiusY / 100 * catchlightHeight;
  // ... and travels the slack between itself and that iris edge, exactly the way
  // lensPosition moves the lens inside the sclera
  const catchlightOffsetX = (irisRadiusX - catchlightRadiusX) / 100 * catchlightPosition[0];
  const catchlightOffsetY = (irisRadiusY - catchlightRadiusY) / 100 * catchlightPosition[1];

  const upperLidHeight = scleraRadiusY / 100 * updatedUpperLidSize;
  const upperLidY = 50 - 2 * scleraRadiusY + upperLidHeight;
  const lowerLidY = 50 + scleraRadiusY - (scleraRadiusY / 100 * updatedLowerLidSize);
  // eyeliner is a share of the sclera half-height, like the lids it belongs to
  const upperEyelinerHeight = scleraRadiusY / 100 * Math.max(0, upperEyelinerSize);
  const lowerEyelinerHeight = scleraRadiusY / 100 * Math.max(0, lowerEyelinerSize);

  // calculate real lens position from percentage
  const lensOffsetX = (scleraRadiusX - irisRadiusX) / 100 * updatedLensPosition[0];
  const lensOffsetY = (scleraRadiusY - irisRadiusY) / 100 * updatedLensPosition[1];

  // smooth deceleration for lens moves, symmetric ease for lids
  const lensEasing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const lidEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const lidTransition = { transition: 'y ' + blinkSpeed + 'ms ' + lidEasing };

  return (
    <svg width={width} height={height} viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'
      className={className ? 'cartoon-eye ' + className : 'cartoon-eye'} style={style}
      role='img' aria-label={title}>
      {title ? <title>{title}</title> : null}
      <defs>
        {/* masks are luminance-based: the ellipse must stay white regardless of scleraColor */}
        <mask id={maskId}>
          <ellipse fill='#ffffff' cx='50' cy='50' rx={scleraRadiusX} ry={scleraRadiusY} />
        </mask>
      </defs>
      {/* rotation wraps (rather than joins) the blink squeeze so the squash always
          runs along the eye's own axis and each has its own transition duration.
          No sclera radius can exceed the 50-unit half-viewbox, so a rotated eye
          always stays inside the drawing area */}
      <g className='eye-rotation' style={{
        transform: 'rotate(' + rotation + 'deg)',
        transformOrigin: 'center',
        transition: 'transform ' + rotationSpeed + 'ms ' + lensEasing,
      }}>
        <g className='eye' style={{
          transform: 'scaleY(' + scleraScaleY + ')',
          transformOrigin: 'center',
          transition: 'transform ' + blinkSpeed + 'ms ' + lidEasing,
        }}>
          <ellipse className='sclera' fill={scleraColor}
            cx='50' cy='50' rx={scleraRadiusX} ry={scleraRadiusY} style={scleraStyle} />
          <g className='lens' mask={'url(#' + maskId + ')'}>
            <g style={{
              transform: 'translate(' + lensOffsetX + 'px,' + lensOffsetY + 'px)',
              transition: 'transform ' + lensSpeed + 'ms ' + lensEasing,
            }}>
              <ellipse className='iris' fill={irisColor} rx={irisFillRadiusX} ry={irisFillRadiusY}
                transform='translate(50, 50)' style={irisStyle} />
              {limbusRatio > 0 ? (
                <path className='limbus' fill={limbusColor} fillRule='evenodd'
                  d={ellipsePath(irisRadiusX, irisRadiusY) + ' ' + ellipsePath(irisFillRadiusX, irisFillRadiusY)}
                  transform='translate(50, 50)' style={limbusStyle} />
              ) : null}
              <ellipse className='pupil' fill={pupilColor} rx={pupilRadiusX} ry={pupilRadiusY}
                transform='translate(50, 50)' style={pupilStyle} />
              {/* last inside the moving lens: the glint sits over the iris and the
                  pupil alike, so it may cross the edge of either */}
              {(catchlightRadiusX > 0 && catchlightRadiusY > 0) ? (
                <ellipse className='catchlight' fill={catchlightColor}
                  rx={catchlightRadiusX} ry={catchlightRadiusY}
                  transform={'translate(' + (50 + catchlightOffsetX) + ', ' + (50 + catchlightOffsetY) + ')'}
                  style={catchlightStyle} />
              ) : null}
            </g>
          </g>
          <g className='eyelids' mask={'url(#' + maskId + ')'}>
            {/* eyeliner is the lid's own margin thickened: each liner runs from
                its lid's outer edge to `height` past the inner one, and the lid
                paints over everything but that overhang, so the two share one
                edge (no seam) and one transition */}
            {upperEyelinerHeight > 0 ? (
              <rect className='upper-eyeliner' fill={upperEyelinerColor}
                width='100%' height={scleraRadiusY + upperEyelinerHeight} y={upperLidY}
                style={{ ...lidTransition, ...upperEyelinerStyle }} />
            ) : null}
            <rect className='upper-lid' fill={upperLidColor} width='100%' height={scleraRadiusY}
              y={upperLidY} style={{ ...lidTransition, ...upperLidStyle }} />
            {lowerEyelinerHeight > 0 ? (
              <rect className='lower-eyeliner' fill={lowerEyelinerColor}
                width='100%' height={scleraRadiusY + lowerEyelinerHeight}
                y={lowerLidY - lowerEyelinerHeight}
                style={{ ...lidTransition, ...lowerEyelinerStyle }} />
            ) : null}
            <rect className='lower-lid' fill={lowerLidColor} width='100%' height={scleraRadiusY}
              y={lowerLidY} style={{ ...lidTransition, ...lowerLidStyle }} />
          </g>
          {/* the outline frames everything, lids included, so it stays the edge of
              the eye however far the lids come down */}
          {eyeOutlineRatio > 0 ? (
            <path className='eye-outline' fill={eyeOutlineColor} fillRule='evenodd'
              d={ellipsePath(scleraRadiusX, scleraRadiusY) + ' '
                + ellipsePath(scleraRadiusX * (1 - eyeOutlineRatio), scleraRadiusY * (1 - eyeOutlineRatio))}
              transform='translate(50, 50)' style={eyeOutlineStyle} />
          ) : null}
        </g>
      </g>
    </svg>
  );
};

export default Eye;
