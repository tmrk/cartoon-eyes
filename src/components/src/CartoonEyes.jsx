import { useEffect, useId, useState } from 'react';

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// an ellipse centred on the origin, drawn as two arcs; two of these in one path
// with fill-rule evenodd make a ring, the inner one punching the hole
const ellipsePath = (rx, ry) =>
  'M ' + -rx + ' 0 A ' + rx + ' ' + ry + ' 0 1 0 ' + rx + ' 0 A ' + rx + ' ' + ry + ' 0 1 0 ' + -rx + ' 0 Z';

// a colour may carry its alpha as a last byte: #RRGGBBAA, or the #RGBA
// shorthand. SVG fills keep the two apart, so the alpha is split off into
// fill-opacity here rather than left to the renderer, which keeps the drawing
// valid wherever plain SVG 1.1 colours are expected
const hexaFill = /^#(?:([0-9a-f]{3})([0-9a-f])|([0-9a-f]{6})([0-9a-f]{2}))$/i;

const fillOf = (color) => {
  const alpha = (typeof color === 'string') ? hexaFill.exec(color) : null;
  if (!alpha) return { fill: color };
  const [, shortColor, shortAlpha, longColor, longAlpha] = alpha;
  return {
    fill: '#' + (shortColor || longColor),
    fillOpacity: parseInt(shortAlpha ? shortAlpha + shortAlpha : longAlpha, 16) / 255,
  };
};

// smooth deceleration for lens moves and rotation, symmetric ease for lids
const lensEasing = 'cubic-bezier(0.22, 1, 0.36, 1)';
const lidEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';

// where the lens is right now: the controlled position, or a random one on a
// timer while the eye wanders. A single eye runs its own; a pair runs one for
// both, so the two look the same way at the same time
const useLens = (lensMovement, lensX, lensY) => {
  const [position, setPosition] = useState([lensX, lensY]);
  useEffect(() => {
    if (!lensMovement) {
      setPosition([lensX, lensY]);
      return;
    }
    const interval = (typeof lensMovement === 'number') ? lensMovement : 1000;
    const intervalId = setInterval(() => {
      setPosition([randomNumber(-90, 90), randomNumber(-90, 90)]);
    }, interval);
    return () => clearInterval(intervalId);
  }, [lensMovement, lensX, lensY]);
  return position;
};

// the blink clock: true while the lids are shut. Every other blink value (lid
// sizes, the squeeze) follows from it, so one clock can drive several eyes -
// which is how `EyePair` blinks its two in step
const useBlink = (blinking, blinkFrequency, blinkSpeed) => {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    setClosed(false);
    if (!blinking) return;
    let timeoutId;
    const doBlink = () => {
      setClosed(true);
      timeoutId = setTimeout(() => setClosed(false), blinkSpeed);
    };
    doBlink(); // immediately do just one blink
    const intervalId = setInterval(doBlink, blinkFrequency);
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [blinking, blinkFrequency, blinkSpeed]);
  return closed;
};

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
    blinkClosed,
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
  const updatedLensPosition = useLens(lensMovement, lensX, lensY);

  // blinking is uncontrolled by default (the eye keeps its own clock); pass
  // `blinkClosed` to drive it from outside and the eye's own timer stands down
  const controlledBlink = blinkClosed !== undefined;
  const blinkingNow = useBlink(controlledBlink ? false : blinking, blinkFrequency, blinkSpeed);
  const closed = controlledBlink ? blinkClosed : blinkingNow;

  // a blink runs both lids down to 100 (the CSS transition on the lid rects
  // animates the movement) and, with blinkSqueeze, squashes the whole eye
  const updatedUpperLidSize = closed ? 100 : upperLidSize;
  const updatedLowerLidSize = closed ? 100 : lowerLidSize;
  const scleraScaleY = (closed && blinkSqueeze) ? 0.6 : 1;

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
          <ellipse className='sclera' {...fillOf(scleraColor)}
            cx='50' cy='50' rx={scleraRadiusX} ry={scleraRadiusY} style={scleraStyle} />
          <g className='lens' mask={'url(#' + maskId + ')'}>
            <g style={{
              transform: 'translate(' + lensOffsetX + 'px,' + lensOffsetY + 'px)',
              transition: 'transform ' + lensSpeed + 'ms ' + lensEasing,
            }}>
              <ellipse className='iris' {...fillOf(irisColor)} rx={irisFillRadiusX} ry={irisFillRadiusY}
                transform='translate(50, 50)' style={irisStyle} />
              {limbusRatio > 0 ? (
                <path className='limbus' {...fillOf(limbusColor)} fillRule='evenodd'
                  d={ellipsePath(irisRadiusX, irisRadiusY) + ' ' + ellipsePath(irisFillRadiusX, irisFillRadiusY)}
                  transform='translate(50, 50)' style={limbusStyle} />
              ) : null}
              <ellipse className='pupil' {...fillOf(pupilColor)} rx={pupilRadiusX} ry={pupilRadiusY}
                transform='translate(50, 50)' style={pupilStyle} />
              {/* last inside the moving lens: the glint sits over the iris and the
                  pupil alike, so it may cross the edge of either. It is a
                  reflection of a light that does not turn with the eye, so this
                  frame takes the eye's own rotation back off it, around the
                  centre of the lens it travels with: the glint keeps both its
                  place and its shape on the screen's axes however far the eye
                  tilts, and still follows the lens. Same duration and easing as
                  the rotation itself, so the two cancel out at every frame */}
              {(catchlightRadiusX > 0 && catchlightRadiusY > 0) ? (
                <g className='catchlight-frame' style={{
                  transform: 'rotate(' + -rotation + 'deg)',
                  transformOrigin: 'center',
                  transition: 'transform ' + rotationSpeed + 'ms ' + lensEasing,
                }}>
                  <ellipse className='catchlight' {...fillOf(catchlightColor)}
                    rx={catchlightRadiusX} ry={catchlightRadiusY}
                    transform={'translate(' + (50 + catchlightOffsetX) + ', ' + (50 + catchlightOffsetY) + ')'}
                    style={catchlightStyle} />
                </g>
              ) : null}
            </g>
          </g>
          <g className='eyelids' mask={'url(#' + maskId + ')'}>
            {/* eyeliner is the lid's own margin thickened: each liner runs from
                its lid's outer edge to `height` past the inner one, and the lid
                paints over everything but that overhang, so the two share one
                edge (no seam) and one transition */}
            {upperEyelinerHeight > 0 ? (
              <rect className='upper-eyeliner' {...fillOf(upperEyelinerColor)}
                width='100%' height={scleraRadiusY + upperEyelinerHeight} y={upperLidY}
                style={{ ...lidTransition, ...upperEyelinerStyle }} />
            ) : null}
            <rect className='upper-lid' {...fillOf(upperLidColor)} width='100%' height={scleraRadiusY}
              y={upperLidY} style={{ ...lidTransition, ...upperLidStyle }} />
            {lowerEyelinerHeight > 0 ? (
              <rect className='lower-eyeliner' {...fillOf(lowerEyelinerColor)}
                width='100%' height={scleraRadiusY + lowerEyelinerHeight}
                y={lowerLidY - lowerEyelinerHeight}
                style={{ ...lidTransition, ...lowerEyelinerStyle }} />
            ) : null}
            <rect className='lower-lid' {...fillOf(lowerLidColor)} width='100%' height={scleraRadiusY}
              y={lowerLidY} style={{ ...lidTransition, ...lowerLidStyle }} />
          </g>
          {/* the outline frames everything, lids included, so it stays the edge of
              the eye however far the lids come down */}
          {eyeOutlineRatio > 0 ? (
            <path className='eye-outline' {...fillOf(eyeOutlineColor)} fillRule='evenodd'
              d={ellipsePath(scleraRadiusX, scleraRadiusY) + ' '
                + ellipsePath(scleraRadiusX * (1 - eyeOutlineRatio), scleraRadiusY * (1 - eyeOutlineRatio))}
              transform='translate(50, 50)' style={eyeOutlineStyle} />
          ) : null}
        </g>
      </g>
    </svg>
  );
};

// a sum of scaled CSS lengths: all-numeric stays a number, so React writes it
// as px, and anything else (a percentage, a var) becomes one calc()
const lengthSum = (terms) => {
  if (terms.every(([length]) => typeof length === 'number')) {
    return terms.reduce((total, [length, factor]) => total + length * factor, 0);
  }
  return terms.reduce((expression, [length, factor]) => expression
    + (factor < 0 ? ' - ' : ' + ')
    + ((typeof length === 'number')
      ? Math.abs(length * factor) + 'px'
      : '(' + length + ') * ' + Math.abs(factor)),
  'calc(0px') + ')';
};

// an override that names any of these takes that eye off the pair's shared
// clock, so it keeps its own gaze or its own blink
const gazeProps = ['lensPosition', 'lensMovement'];
const blinkProps = ['blinking', 'blinkSpeed', 'blinkFrequency', 'blinkClosed'];

export const EyePair = (props) => {

  const {
    // the pair's own props: everything else is an Eye prop shared by both eyes
    gap = 20,
    eyeRotation = 0,
    leftEye,
    rightEye,
    // shared Eye props the pair has to resolve itself before handing them on
    size = 100,
    width = size,
    height = size,
    rotation = 0,
    rotationSpeed = 0,
    lensPosition = [0, 0],
    lensMovement = false,
    blinking = false,
    blinkSpeed,
    blinkFrequency = 3000,
    title,
    className,
    style,
    ...shared
  } = props;

  // one wander and one blink for the pair, so the two eyes look the same way at
  // the same time and their lids come down together
  const [lensX, lensY] = lensPosition;
  const pairLensPosition = useLens(lensMovement, lensX, lensY);
  const pairBlinkSpeed = (blinkSpeed === undefined)
    ? ((typeof blinking === 'number') ? blinking : 80)
    : blinkSpeed;
  const pairBlinkClosed = useBlink(blinking, blinkFrequency, pairBlinkSpeed);

  // one eye of the pair: the shared props, its own half of the mirrored eye
  // rotation and the pair's gaze and blink - all of which its override replaces
  const eye = (override, outwards, offset) => {
    // the pair sets the gap as a margin on the second eye, so an override's own
    // style is merged rather than dropped by the spread below
    const { style: ownStyle, ...own } = override || {};
    const sharesGaze = !gazeProps.some((prop) => prop in own);
    const sharesBlink = !blinkProps.some((prop) => prop in own);
    return (
      <Eye
        {...shared}
        // an override sizes its eye the way Eye itself does: width and height
        // first, then size, then whatever the pair was given
        width={own.width ?? own.size ?? width}
        height={own.height ?? own.size ?? height}
        // positive eyeRotation tilts both eyes outwards, on top of any shared
        // rotation, which turns them the same way
        rotation={rotation + outwards * eyeRotation}
        rotationSpeed={rotationSpeed}
        // the gaze is not mirrored: if the pair looks right, both irises do.
        // The pair's wander reaches its eyes as a position, so none of them runs
        // a timer of its own unless an override below asks for one: naming
        // `lensPosition` alone fixes that eye's gaze rather than setting it
        // wandering, and naming `lensMovement` gives it a wander of its own
        lensPosition={sharesGaze ? pairLensPosition : lensPosition}
        lensMovement={false}
        blinking={blinking}
        blinkSpeed={blinkSpeed}
        blinkFrequency={blinkFrequency}
        blinkClosed={(sharesBlink && blinking) ? pairBlinkClosed : undefined}
        {...own}
        style={(offset === undefined) ? ownStyle : { marginInlineStart: offset, ...ownStyle }}
      />
    );
  };

  // The gap is a share of one eye's nominal size rather than a fixed length, so
  // the pair keeps its proportions however big it is drawn - and it is measured
  // between the eyes themselves, not between their drawing areas. A sclera
  // narrower than its box leaves slack down the inner side of each eye; that
  // slack comes off the gap, so `gap={0}` really does put the two eyes side by
  // side whatever `scleraWidth` is. It leaves a negative length where the slack
  // is wider than the gap, which is why it is set as a margin on the second eye
  // rather than as the flex `column-gap` (a gap can never be negative).
  const eyeWidth = (own) => (own && (own.width ?? own.size)) ?? width;
  const eyeSlack = (own) => (100 - ((own && own.scleraWidth) ?? shared.scleraWidth ?? 100)) / 200;
  const gapWidth = lengthSum([
    [width, Math.max(0, gap) / 100],
    [eyeWidth(leftEye), -eyeSlack(leftEye)],
    [eyeWidth(rightEye), -eyeSlack(rightEye)],
  ].filter(([, factor]) => factor !== 0));

  return (
    <div className={className ? 'cartoon-eye-pair ' + className : 'cartoon-eye-pair'}
      role={title ? 'img' : undefined} aria-label={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        ...style,
      }}>
      {eye(leftEye, -1)}
      {eye(rightEye, 1, gapWidth)}
    </div>
  );
};

export default Eye;
