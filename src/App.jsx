import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Button, CssBaseline, GlobalStyles, Link, Paper, Slider, Stack, Switch,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MuiColorInput } from 'mui-color-input';
import { Eye, EyePair } from './components/src/CartoonEyes';

// ---------------------------------------------------------------------------
// Theme: warm "sticker sheet" look: thick ink outlines, offset shadows,
// halftone dots, rounded toy-like type.
// ---------------------------------------------------------------------------

const INK = '#29223A';
const CREAM = '#FBF3E4';
const PAPER = '#FFFDF8';
const CORAL = '#FF5D3A';
const TEAL = '#0E9E9E';
const TINT = '#FFF3DE'; // the warm wash behind panel headers and hover states
const MUTED = '#6E6580';
const CANVAS = '#FFE8CF'; // the stage the eye is drawn on
const NIGHT = '#3A3150'; // the code drawer's bar; its panel is INK

// the page's halftone dots, and the coarser ones on the stage itself
const DOTS = 'radial-gradient(#E9DCC5 1.5px, transparent 1.5px)';
const STAGE_DOTS = 'radial-gradient(rgba(41,34,58,0.12) 2px, transparent 2px)';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: CORAL },
    secondary: { main: TEAL },
    background: { default: CREAM, paper: PAPER },
    text: { primary: INK, secondary: MUTED },
  },
  typography: {
    fontFamily: "'Nunito', sans-serif",
    h1: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600 },
    h2: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600 },
    h3: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600 },
    overline: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600, letterSpacing: '0.12em' },
    button: { fontFamily: "'Fredoka', sans-serif", fontWeight: 500, textTransform: 'none' },
  },
  shape: { borderRadius: 18 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `3px solid ${INK}`,
          boxShadow: `6px 6px 0 ${INK}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: `2.5px solid ${INK}`,
          boxShadow: `2px 2px 0 ${INK}`,
          '&:hover': { boxShadow: `3px 3px 0 ${INK}`, transform: 'translate(-1px, -1px)' },
          '&:active': { boxShadow: `1px 1px 0 ${INK}`, transform: 'translate(1px, 1px)' },
          transition: 'transform 120ms ease, box-shadow 120ms ease',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          border: `2.5px solid ${INK}`,
          backgroundColor: PAPER,
          width: 18,
          height: 18,
        },
        rail: { color: INK, opacity: 0.22, height: 6 },
        track: { height: 6, border: 'none' },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 500,
          textTransform: 'none',
          border: `2.5px solid ${INK} !important`,
          color: INK,
          backgroundColor: PAPER,
          '&:hover': { backgroundColor: TINT },
          '&.Mui-selected': {
            backgroundColor: CORAL,
            color: PAPER,
            '&:hover': { backgroundColor: CORAL },
          },
        },
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Eye configuration: defaults, presets, code generation
// ---------------------------------------------------------------------------

// What the demo starts with: an eye that already shows off the optional parts
// (outline, limbus, catchlight, eyeliner), so the first thing on the screen is
// the whole component rather than the plainest corner of it.
const initialConfig = {
  // demo-only: one Eye, or two of them through EyePair
  eyeCount: 1,
  // EyePair props, in play once there are two eyes
  gap: 20, eyeRotation: 0,
  // the two per-eye overrides the demo can show off: an odd iris colour, and a
  // right eye that keeps its own gaze while the pair looks around
  oddEye: false, rightIrisColor: '#F2A03D', oddGaze: false,
  scleraWidth: 80, scleraHeight: 62, scleraColor: '#FFFFFF',
  eyeOutlineThickness: 4, eyeOutlineColor: '#29223A',
  irisWidth: 76, irisHeight: 76, irisColor: '#3E7BFA',
  limbusThickness: 16, limbusColor: '#1B3E8F',
  pupilWidth: 44, pupilHeight: 44, pupilColor: '#141020',
  catchlightWidth: 24, catchlightHeight: 24,
  catchlightPosition: [-48, -52], catchlightColor: '#FFFFFFE6',
  upperLidSize: 14, upperLidColor: '#F0B98E',
  lowerLidSize: 7, lowerLidColor: '#F0B98E',
  upperEyelinerSize: 9, upperEyelinerColor: '#29223A',
  lowerEyelinerSize: 4, lowerEyelinerColor: '#29223A',
  rotation: 0,
  // where the lens rests while the eye is still; the animated modes drive their
  // own position and leave this one untouched
  lensPosition: [0, 0],
  blinking: true, blinkSpeed: 80, blinkFrequency: 3000, blinkSqueeze: false,
  movement: 'still', // demo-only: 'follow' | 'wander' | 'still'
};

// the presets were drawn against the plain eye, so they are built on that
// rather than on the richer default above: each one still says everything it
// needs to say about itself
const presetBase = {
  ...initialConfig,
  scleraWidth: 70, scleraHeight: 50, scleraColor: '#FFFFFF',
  eyeOutlineThickness: 0, eyeOutlineColor: '#000000',
  irisWidth: 80, irisHeight: 80, irisColor: '#3E7BFA',
  limbusThickness: 0, limbusColor: '#000000',
  pupilWidth: 30, pupilHeight: 30, pupilColor: '#000000',
  catchlightWidth: 0, catchlightHeight: 0,
  catchlightPosition: [-40, -40], catchlightColor: '#FFFFFF',
  upperLidSize: 20, upperLidColor: '#AAAAAA',
  lowerLidSize: 20, lowerLidColor: '#AAAAAA',
  upperEyelinerSize: 0, upperEyelinerColor: '#000000',
  lowerEyelinerSize: 0, lowerEyelinerColor: '#000000',
  rotation: 0,
  blinking: true, blinkSpeed: 80, blinkFrequency: 3000, blinkSqueeze: false,
  movement: 'wander',
};

// hex colours are stored (and shown) uppercase wherever they surface. A colour
// may carry its alpha as an 8-digit hex (the catchlight picker hands those
// back); a fully opaque one is trimmed to six digits so the snippet and the
// share URL never carry a redundant FF
const upperHex = (color) => {
  if (typeof color !== 'string') return color;
  const hex = color.toUpperCase();
  if (/^#[0-9A-F]{6}FF$/.test(hex)) return hex.slice(0, 7);
  if (/^#[0-9A-F]{3}F$/.test(hex)) return hex.slice(0, 4);
  return hex;
};

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomOf = (values) => values[Math.floor(Math.random() * values.length)];

const clampAxis = (value) => Math.max(-100, Math.min(100, Math.round(value)));

// how many eye widths a pair spans, gap included: the stage box and each eye's
// share of it are both measured against this
const pairSpan = (gap) => 2 + Math.max(0, gap) / 100;

// the gaze the odd-eye override pins the right eye to: hard right, so it reads
// at a glance against a pair that is looking anywhere else
const ODD_GAZE = [100, 0];

const presets = {
  Default: initialConfig,
  Googly: {
    ...presetBase,
    // the plastic craft eye: one black disc rattling around behind a clear dome
    eyeCount: 2, gap: 10,
    scleraWidth: 96, scleraHeight: 96, scleraColor: '#FFFFFF',
    eyeOutlineThickness: 4, eyeOutlineColor: '#1A1A1A',
    irisWidth: 46, irisHeight: 46, irisColor: '#101010',
    pupilWidth: 100, pupilHeight: 100, pupilColor: '#101010',
    // the dome's shine is a reflection, not paint: the 8-digit hex carries its
    // alpha, which the Eye splits into fill and fill-opacity
    catchlightWidth: 26, catchlightHeight: 26, catchlightPosition: [-45, -50],
    catchlightColor: '#FFFFFFCC',
    upperLidSize: 0, lowerLidSize: 0,
    blinking: false,
  },
  Owl: {
    ...presetBase,
    // set close together and tilted out, the way a facial disc frames them
    eyeCount: 2, gap: 6, eyeRotation: 8,
    scleraWidth: 86, scleraHeight: 86, scleraColor: '#FFF4D6',
    eyeOutlineThickness: 5, eyeOutlineColor: '#6B4423',
    irisWidth: 92, irisHeight: 92, irisColor: '#F2A93B',
    limbusThickness: 12, limbusColor: '#6B4423',
    pupilWidth: 62, pupilHeight: 62, pupilColor: '#12100E',
    catchlightWidth: 18, catchlightHeight: 18, catchlightPosition: [-40, -45],
    upperLidSize: 6, upperLidColor: '#B98A4B',
    lowerLidSize: 4, lowerLidColor: '#B98A4B',
    blinkSpeed: 220, blinkFrequency: 4000,
  },
  Snake: {
    ...presetBase,
    scleraWidth: 80, scleraHeight: 70, scleraColor: '#AAFFAA',
    irisWidth: 100, irisHeight: 100, irisColor: '#FF7700',
    limbusThickness: 9, limbusColor: '#8A3B00', // a burnt rim around the amber
    pupilWidth: 10, pupilHeight: 80, pupilColor: '#000000',
    // the wet shine off the spectacle scale, well clear of the slit pupil
    catchlightWidth: 16, catchlightHeight: 16, catchlightPosition: [-50, -55],
    upperLidSize: 0, lowerLidSize: 0,
    blinking: false,
  },
  Zombie: {
    ...presetBase,
    scleraWidth: 80, scleraHeight: 65, scleraColor: '#FFFFDD',
    irisWidth: 70, irisHeight: 65, irisColor: '#559933',
    limbusThickness: 15, limbusColor: '#2E4A1C', // murky edge, for the decay
    pupilWidth: 50, pupilHeight: 50, pupilColor: '#330000',
    // no catchlight: dead eyes have no shine left in them
    upperLidSize: 35, upperLidColor: '#557755',
    lowerLidSize: 20, lowerLidColor: '#557755',
    upperEyelinerSize: 8, upperEyelinerColor: '#3B4A2E', // a murky, sunken rim
    lowerEyelinerSize: 5, lowerEyelinerColor: '#3B4A2E',
    blinkSpeed: 250, blinkFrequency: 5000,
  },
  Cat: {
    ...presetBase,
    scleraWidth: 72, scleraHeight: 66, scleraColor: '#F6EDD2',
    irisWidth: 95, irisHeight: 95, irisColor: '#E8A33D',
    limbusThickness: 9, limbusColor: '#7A4A12', // cats have a strong dark rim
    pupilWidth: 14, pupilHeight: 90, pupilColor: '#1C1C1C',
    catchlightWidth: 18, catchlightHeight: 18, catchlightPosition: [-45, -50],
    upperLidSize: 12, upperLidColor: '#8A6D3B',
    lowerLidSize: 8, lowerLidColor: '#8A6D3B',
    // the dark tabby line along both lid margins
    upperEyelinerSize: 9, upperEyelinerColor: '#3A2A12',
    lowerEyelinerSize: 6, lowerEyelinerColor: '#3A2A12',
    blinkSpeed: 200, blinkFrequency: 4500, // the languid cat blink
  },
  Sleepy: {
    ...presetBase,
    scleraWidth: 75, scleraHeight: 45, scleraColor: '#FFF5F0',
    irisWidth: 70, irisHeight: 70, irisColor: '#7A6EA8',
    pupilWidth: 40, pupilHeight: 40, pupilColor: '#2A2438',
    upperLidSize: 55, upperLidColor: '#D9B8A6',
    lowerLidSize: 25, lowerLidColor: '#D9B8A6',
    // just the lash line under the heavy lid; nothing along the bottom
    upperEyelinerSize: 8, upperEyelinerColor: '#B08878',
    blinkSpeed: 300, blinkFrequency: 2200,
    movement: 'still', // too drowsy to look around
  },
  Surprised: {
    ...presetBase,
    scleraWidth: 82, scleraHeight: 82, scleraColor: '#FFFFFF',
    eyeOutlineThickness: 5, eyeOutlineColor: '#1A1A1A', // inked, like a comic panel
    irisWidth: 45, irisHeight: 45, irisColor: '#16A34A',
    pupilWidth: 55, pupilHeight: 55, pupilColor: '#000000',
    // a big startled glint, crossing from the pupil out onto the iris
    catchlightWidth: 28, catchlightHeight: 28, catchlightPosition: [-45, -45],
    upperLidSize: 0, lowerLidSize: 0,
    blinking: false,
  },
  Alien: {
    ...presetBase,
    scleraWidth: 62, scleraHeight: 88, scleraColor: '#0D0D15',
    // just light enough against the near-black sclera that the wander reads
    irisWidth: 85, irisHeight: 85, irisColor: '#252542',
    // lighter than the iris for once: a cold rim that finds the eye in the dark
    limbusThickness: 10, limbusColor: '#4B4B8F',
    pupilWidth: 55, pupilHeight: 55, pupilColor: '#000000',
    // a cold, drawn-out gleam down the dome
    catchlightWidth: 16, catchlightHeight: 26, catchlightPosition: [-45, -55],
    catchlightColor: '#8FA8FF',
    upperLidSize: 0, upperLidColor: '#0D0D15',
    lowerLidSize: 0, lowerLidColor: '#0D0D15',
    blinkSpeed: 160, blinkFrequency: 6000,
  },
  Frog: {
    ...presetBase,
    scleraWidth: 80, scleraHeight: 80, scleraColor: '#F7C948',
    eyeOutlineThickness: 6, eyeOutlineColor: '#3F6212', // the wet rim of the bulge
    irisWidth: 70, irisHeight: 70, irisColor: '#B45309',
    limbusThickness: 12, limbusColor: '#5C2308',
    pupilWidth: 85, pupilHeight: 30, pupilColor: '#101010',
    catchlightWidth: 14, catchlightHeight: 14, catchlightPosition: [-45, -55],
    upperLidSize: 10, upperLidColor: '#3F6212',
    lowerLidSize: 10, lowerLidColor: '#3F6212',
    blinkFrequency: 4200,
  },
};

// the Eye and EyePair defaults, used to emit only non-default props
const eyeDefaults = {
  gap: 20, eyeRotation: 0,
  scleraWidth: 100, scleraHeight: 100, scleraColor: '#FFFFFF',
  eyeOutlineThickness: 0, eyeOutlineColor: '#000000',
  irisSize: 60, irisColor: '#666666',
  limbusThickness: 0, limbusColor: '#000000',
  pupilSize: 50, pupilColor: '#000000',
  catchlightSize: 0, catchlightPosition: [-40, -40], catchlightColor: '#FFFFFF',
  lidSize: 20, lidColor: '#AAAAAA',
  eyelinerSize: 0, eyelinerColor: '#000000',
  rotation: 0,
  blinkSpeed: 80, blinkFrequency: 3000,
};

// diff a demo config against the component's own defaults, collapsing symmetric
// width/height (and lid) pairs into their shorthand props; raw values
// (number | [x, y] | { prop: value } | color string | true), shared by the JSX
// snippet and the share URL. `lensPosition` defaults to the config's resting
// position, but the snippet passes the live one so the code follows a
// cursor-following eye. With two eyes the pair's own props come first and the
// right eye's override last, the way they read best in the snippet
function diffEyeProps(config, lensPosition = config.lensPosition) {
  const props = [];
  const add = (name, value) => props.push({ name, value });
  const pair = config.eyeCount === 2;

  if (pair) {
    if (config.gap !== eyeDefaults.gap) add('gap', config.gap);
    if (config.eyeRotation !== eyeDefaults.eyeRotation) add('eyeRotation', config.eyeRotation);
  }

  if (config.scleraWidth !== eyeDefaults.scleraWidth) add('scleraWidth', config.scleraWidth);
  if (config.scleraHeight !== eyeDefaults.scleraHeight) add('scleraHeight', config.scleraHeight);
  if (config.scleraColor !== eyeDefaults.scleraColor) add('scleraColor', config.scleraColor);
  if (config.eyeOutlineThickness !== eyeDefaults.eyeOutlineThickness) {
    add('eyeOutlineThickness', config.eyeOutlineThickness);
    if (config.eyeOutlineColor !== eyeDefaults.eyeOutlineColor) add('eyeOutlineColor', config.eyeOutlineColor);
  }

  if (config.irisWidth === config.irisHeight) {
    if (config.irisWidth !== eyeDefaults.irisSize) add('irisSize', config.irisWidth);
  } else {
    add('irisWidth', config.irisWidth);
    add('irisHeight', config.irisHeight);
  }
  if (config.irisColor !== eyeDefaults.irisColor) add('irisColor', config.irisColor);

  // the colour only matters once there is a ring to paint
  if (config.limbusThickness !== eyeDefaults.limbusThickness) {
    add('limbusThickness', config.limbusThickness);
    if (config.limbusColor !== eyeDefaults.limbusColor) add('limbusColor', config.limbusColor);
  }

  if (config.pupilWidth === config.pupilHeight) {
    if (config.pupilWidth !== eyeDefaults.pupilSize) add('pupilSize', config.pupilWidth);
  } else {
    add('pupilWidth', config.pupilWidth);
    add('pupilHeight', config.pupilHeight);
  }
  if (config.pupilColor !== eyeDefaults.pupilColor) add('pupilColor', config.pupilColor);

  if (config.catchlightWidth === config.catchlightHeight) {
    if (config.catchlightWidth !== eyeDefaults.catchlightSize) add('catchlightSize', config.catchlightWidth);
  } else {
    add('catchlightWidth', config.catchlightWidth);
    add('catchlightHeight', config.catchlightHeight);
  }
  // the position and colour only matter once there is a glint to place
  if (config.catchlightWidth > 0 && config.catchlightHeight > 0) {
    const [catchlightX, catchlightY] = config.catchlightPosition;
    if (catchlightX !== eyeDefaults.catchlightPosition[0] || catchlightY !== eyeDefaults.catchlightPosition[1]) {
      add('catchlightPosition', [catchlightX, catchlightY]);
    }
    if (config.catchlightColor !== eyeDefaults.catchlightColor) add('catchlightColor', config.catchlightColor);
  }

  if (config.upperLidSize === config.lowerLidSize) {
    if (config.upperLidSize !== eyeDefaults.lidSize) add('lidSize', config.upperLidSize);
  } else {
    add('upperLidSize', config.upperLidSize);
    add('lowerLidSize', config.lowerLidSize);
  }
  if (config.upperLidColor === config.lowerLidColor) {
    if (config.upperLidColor !== eyeDefaults.lidColor) add('lidColor', config.upperLidColor);
  } else {
    add('upperLidColor', config.upperLidColor);
    add('lowerLidColor', config.lowerLidColor);
  }

  if (config.upperEyelinerSize === config.lowerEyelinerSize) {
    if (config.upperEyelinerSize !== eyeDefaults.eyelinerSize) add('eyelinerSize', config.upperEyelinerSize);
  } else {
    add('upperEyelinerSize', config.upperEyelinerSize);
    add('lowerEyelinerSize', config.lowerEyelinerSize);
  }
  // only a side with a line to draw needs a colour, so a one-sided liner never
  // drags the other side's unused colour into the snippet
  const eyelinerColored = {
    upper: config.upperEyelinerSize > 0 && config.upperEyelinerColor !== eyeDefaults.eyelinerColor,
    lower: config.lowerEyelinerSize > 0 && config.lowerEyelinerColor !== eyeDefaults.eyelinerColor,
  };
  if (eyelinerColored.upper && eyelinerColored.lower
    && config.upperEyelinerColor === config.lowerEyelinerColor) {
    add('eyelinerColor', config.upperEyelinerColor);
  } else {
    if (eyelinerColored.upper) add('upperEyelinerColor', config.upperEyelinerColor);
    if (eyelinerColored.lower) add('lowerEyelinerColor', config.lowerEyelinerColor);
  }

  if (config.rotation !== eyeDefaults.rotation) add('rotation', config.rotation);

  const [lensX, lensY] = lensPosition.map(Math.round);
  if (lensX !== 0 || lensY !== 0) add('lensPosition', [lensX, lensY]);

  if (config.blinking) {
    add('blinking', true);
    if (config.blinkSpeed !== eyeDefaults.blinkSpeed) add('blinkSpeed', config.blinkSpeed);
    if (config.blinkFrequency !== eyeDefaults.blinkFrequency) add('blinkFrequency', config.blinkFrequency);
    if (config.blinkSqueeze) add('blinkSqueeze', true);
  }

  // the per-eye override goes last: everything above it is what both eyes share.
  // Naming lensPosition there is what takes that eye off the pair's shared gaze
  if (pair) {
    const rightEye = {};
    if (config.oddEye) rightEye.irisColor = config.rightIrisColor;
    if (config.oddGaze) rightEye.lensPosition = ODD_GAZE;
    if (Object.keys(rightEye).length > 0) add('rightEye', rightEye);
  }
  return props;
}

// a prop value as it is written in JSX
const jsxValue = (value) => (
  Array.isArray(value) ? `[${value.join(', ')}]`
    : typeof value === 'number' ? String(value)
      : typeof value === 'object' ? `{ ${Object.entries(value)
        .map(([key, own]) => `${key}: ${jsxValue(own)}`).join(', ')} }`
        : `'${upperHex(value)}'`
);

function buildCodeProps(config, lensPosition) {
  // a wandering eye is driven by lensMovement, which ignores lensPosition: the
  // snippet asks for the wander rather than the spot the eye happens to be at
  const wandering = config.movement === 'wander';
  const props = diffEyeProps(config, lensPosition)
    .filter(({ name }) => !(wandering && name === 'lensPosition'))
    .map(({ name, value }) => ({
      name,
      value: value === true ? null // bare boolean prop
        : (Array.isArray(value) || typeof value === 'object') ? `{${jsxValue(value)}}`
          : typeof value === 'number' ? `{${value}}`
            : `'${upperHex(value)}'`,
    }));
  if (wandering) props.push({ name: 'lensMovement', value: null });
  return props;
}

// the query string carries the same collapsed, non-default props as the JSX
// snippet (hex colors travel without their '#') plus the demo-only `movement`
// and `eyes` count. `movement` is always emitted so a share URL is never bare:
// a bare URL means the pristine demo (initialConfig), any config param means
// "component defaults + overrides"
function buildShareParams(config) {
  const params = new URLSearchParams();
  for (const { name, value } of diffEyeProps(config)) {
    // the right eye's override travels as the two properties the demo can set
    if (name === 'rightEye') {
      if (value.irisColor) params.set('rightIrisColor', value.irisColor.replace(/^#/, ''));
      if (value.lensPosition) params.set('rightGaze', '1');
      continue;
    }
    params.set(name, value === true ? '1'
      : Array.isArray(value) ? value.join(',')
        : typeof value === 'string' ? value.replace(/^#/, '')
          : String(value));
  }
  params.set('movement', config.movement);
  if (config.eyeCount === 2) params.set('eyes', '2');
  return params;
}

// inverse of buildShareParams: expand shorthand params over the component
// defaults; malformed values are ignored so hand-edited URLs degrade gracefully,
// as do parameters from older versions (`pairRotation` and `size`, which no
// longer exist). Returns null when the URL carries no recognised config at all.
function parseShareParams(search) {
  const params = new URLSearchParams(search);
  const config = {
    ...initialConfig, // key order matters: preset matching compares JSON strings
    eyeCount: 1,
    gap: eyeDefaults.gap, eyeRotation: eyeDefaults.eyeRotation,
    oddEye: false, rightIrisColor: initialConfig.rightIrisColor, oddGaze: false,
    scleraWidth: eyeDefaults.scleraWidth, scleraHeight: eyeDefaults.scleraHeight, scleraColor: eyeDefaults.scleraColor,
    eyeOutlineThickness: eyeDefaults.eyeOutlineThickness, eyeOutlineColor: eyeDefaults.eyeOutlineColor,
    irisWidth: eyeDefaults.irisSize, irisHeight: eyeDefaults.irisSize, irisColor: eyeDefaults.irisColor,
    limbusThickness: eyeDefaults.limbusThickness, limbusColor: eyeDefaults.limbusColor,
    pupilWidth: eyeDefaults.pupilSize, pupilHeight: eyeDefaults.pupilSize, pupilColor: eyeDefaults.pupilColor,
    catchlightWidth: eyeDefaults.catchlightSize, catchlightHeight: eyeDefaults.catchlightSize,
    catchlightPosition: [...eyeDefaults.catchlightPosition], catchlightColor: eyeDefaults.catchlightColor,
    upperLidSize: eyeDefaults.lidSize, upperLidColor: eyeDefaults.lidColor,
    lowerLidSize: eyeDefaults.lidSize, lowerLidColor: eyeDefaults.lidColor,
    upperEyelinerSize: eyeDefaults.eyelinerSize, upperEyelinerColor: eyeDefaults.eyelinerColor,
    lowerEyelinerSize: eyeDefaults.eyelinerSize, lowerEyelinerColor: eyeDefaults.eyelinerColor,
    rotation: eyeDefaults.rotation,
    lensPosition: [0, 0],
    blinking: false, blinkSqueeze: false,
    movement: 'still',
  };
  let found = false;

  const num = (name, min, max, apply) => {
    if (!params.has(name)) return;
    const value = Number(params.get(name));
    if (!Number.isFinite(value)) return;
    found = true;
    apply(Math.min(max, Math.max(min, value)));
  };
  const color = (name, apply) => {
    const raw = (params.get(name) || '').replace(/^#/, '');
    if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(raw)) return;
    found = true;
    apply(upperHex(`#${raw}`));
  };
  const flag = (name, apply) => {
    if (!params.has(name)) return;
    found = true;
    apply(!['0', 'false'].includes(params.get(name)));
  };

  if (params.get('eyes') === '2') {
    found = true;
    config.eyeCount = 2;
  }
  num('gap', 0, 100, (v) => { config.gap = v; });
  num('eyeRotation', -60, 60, (v) => { config.eyeRotation = v; });
  // the demo's two left/right overrides: an odd-coloured right iris, and a right
  // eye that keeps its own gaze
  color('rightIrisColor', (v) => { config.oddEye = true; config.rightIrisColor = v; });
  flag('rightGaze', (v) => { config.oddGaze = v; });

  num('scleraWidth', 0, 100, (v) => { config.scleraWidth = v; });
  num('scleraHeight', 0, 100, (v) => { config.scleraHeight = v; });
  color('scleraColor', (v) => { config.scleraColor = v; });

  num('eyeOutlineThickness', 0, 100, (v) => { config.eyeOutlineThickness = v; });
  color('eyeOutlineColor', (v) => { config.eyeOutlineColor = v; });

  // shorthands first so the specific params win if a hand-edited URL has both
  num('irisSize', 0, 100, (v) => { config.irisWidth = v; config.irisHeight = v; });
  num('irisWidth', 0, 100, (v) => { config.irisWidth = v; });
  num('irisHeight', 0, 100, (v) => { config.irisHeight = v; });
  color('irisColor', (v) => { config.irisColor = v; });

  num('limbusThickness', 0, 100, (v) => { config.limbusThickness = v; });
  color('limbusColor', (v) => { config.limbusColor = v; });

  num('pupilSize', 0, 100, (v) => { config.pupilWidth = v; config.pupilHeight = v; });
  num('pupilWidth', 0, 100, (v) => { config.pupilWidth = v; });
  num('pupilHeight', 0, 100, (v) => { config.pupilHeight = v; });
  color('pupilColor', (v) => { config.pupilColor = v; });

  num('catchlightSize', 0, 100, (v) => { config.catchlightWidth = v; config.catchlightHeight = v; });
  num('catchlightWidth', 0, 100, (v) => { config.catchlightWidth = v; });
  num('catchlightHeight', 0, 100, (v) => { config.catchlightHeight = v; });
  color('catchlightColor', (v) => { config.catchlightColor = v; });

  num('lidSize', 0, 100, (v) => { config.upperLidSize = v; config.lowerLidSize = v; });
  num('upperLidSize', 0, 100, (v) => { config.upperLidSize = v; });
  num('lowerLidSize', 0, 100, (v) => { config.lowerLidSize = v; });
  color('lidColor', (v) => { config.upperLidColor = v; config.lowerLidColor = v; });
  color('upperLidColor', (v) => { config.upperLidColor = v; });
  color('lowerLidColor', (v) => { config.lowerLidColor = v; });

  num('eyelinerSize', 0, 100, (v) => { config.upperEyelinerSize = v; config.lowerEyelinerSize = v; });
  num('upperEyelinerSize', 0, 100, (v) => { config.upperEyelinerSize = v; });
  num('lowerEyelinerSize', 0, 100, (v) => { config.lowerEyelinerSize = v; });
  color('eyelinerColor', (v) => { config.upperEyelinerColor = v; config.lowerEyelinerColor = v; });
  color('upperEyelinerColor', (v) => { config.upperEyelinerColor = v; });
  color('lowerEyelinerColor', (v) => { config.lowerEyelinerColor = v; });

  // the Eye itself takes any angle, but the demo's slider is a single turn
  num('rotation', -180, 180, (v) => { config.rotation = v; });

  // "x,y", each clamped to the axis range; a malformed half is dropped
  const axisPair = (name, apply) => {
    if (!params.has(name)) return;
    const [x, y] = params.get(name).split(',').map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    found = true;
    apply([x, y].map(clampAxis));
  };
  axisPair('lensPosition', (v) => { config.lensPosition = v; });
  axisPair('catchlightPosition', (v) => { config.catchlightPosition = v; });

  flag('blinking', (v) => { config.blinking = v; });
  num('blinkSpeed', 30, 400, (v) => { config.blinkSpeed = v; });
  num('blinkFrequency', 500, 8000, (v) => { config.blinkFrequency = v; });
  flag('blinkSqueeze', (v) => { config.blinkSqueeze = v; });

  if (['follow', 'wander', 'still'].includes(params.get('movement'))) {
    found = true;
    config.movement = params.get('movement');
  }

  return found ? config : null;
}

// the reference the Props tab prints: the shorthand form of the API, in the
// order the eye is drawn, with the name the snippet would write
const PROP_ROWS = [
  { name: 'scleraWidth', type: 'number', def: '100', desc: 'Width of the eye as a % of the drawing area.' },
  { name: 'scleraHeight', type: 'number', def: '100', desc: 'Height of the eye as a % of the drawing area.' },
  { name: 'scleraColor', type: 'string', def: "'#ffffff'", desc: 'The white of the eye. Any CSS colour, alpha allowed.' },
  { name: 'eyeOutlineThickness', type: 'number', def: '0', desc: 'Ink line, taken out of the sclera so the eye never outgrows its box.' },
  { name: 'irisSize', type: 'number', def: '60', desc: 'Both iris axes as a % of the sclera. irisWidth / irisHeight split them.' },
  { name: 'limbusThickness', type: 'number', def: '0', desc: 'Darker rim, taken out of the outer % of the iris.' },
  { name: 'pupilSize', type: 'number', def: '50', desc: 'Both pupil axes as a % of the iris. Narrow + tall gives a cat slit.' },
  { name: 'catchlightSize', type: 'number', def: '0', desc: 'The glint, as a % of the whole outer iris.' },
  { name: 'catchlightPosition', type: '[x, y]', def: '[-40, -40]', desc: "Where the glint sits, −100 to 100 on the screen's own axes." },
  { name: 'lidSize', type: 'number', def: '20', desc: 'Both lids as a % of the sclera half-height.' },
  { name: 'eyelinerSize', type: 'number', def: '0', desc: 'Liner on the lid margins, so it rides with every blink.' },
  { name: 'lensPosition', type: '[x, y]', def: '[0, 0]', desc: 'Where the eye looks, −100 to 100. Ignored while lensMovement is on.' },
  { name: 'lensMovement', type: 'bool | ms', def: 'false', desc: 'Let the eye wander on its own; a number sets the interval.' },
  { name: 'rotation', type: 'number', def: '0', desc: 'Tilt in degrees. Everything turns except the catchlight.' },
  { name: 'blinking', type: 'bool | ms', def: 'false', desc: 'Blink on a timer; blinkSpeed and blinkFrequency shape it.' },
  { name: 'gap', type: 'number', def: '20', desc: 'EyePair only: space between the two, as a % of one eye.' },
  { name: 'rightEye', type: 'EyeProps', def: 'none', desc: 'EyePair only: overrides for one eye, gaze and blink included.' },
];

// a Props row is lit when the current config actually emits it, under whichever
// of its names the snippet chose
const PROP_ROW_NAMES = {
  irisSize: ['irisSize', 'irisWidth', 'irisHeight'],
  pupilSize: ['pupilSize', 'pupilWidth', 'pupilHeight'],
  catchlightSize: ['catchlightSize', 'catchlightWidth', 'catchlightHeight'],
  lidSize: ['lidSize', 'upperLidSize', 'lowerLidSize'],
  eyelinerSize: ['eyelinerSize', 'upperEyelinerSize', 'lowerEyelinerSize'],
  scleraColor: ['scleraColor'],
  eyeOutlineThickness: ['eyeOutlineThickness', 'eyeOutlineColor'],
  limbusThickness: ['limbusThickness', 'limbusColor'],
};

const INSTALL_SNIPPET = `import { Eye, EyePair } from 'cartoon-eyes';

<Eye irisColor='#3E7BFA' blinking lensMovement />
<EyePair gap={20} lensMovement />`;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

// the inspector renders the same controls in two shapes: a tight label/track/
// value row inside the desktop panel, and a stacked, thumb-sized version in the
// phone's sheet. One context switch rather than a prop on every control
const DenseContext = createContext(false);
const useDense = () => useContext(DenseContext);

// a bipolar control (rotation, the outward tilt) reads as a deflection from its
// origin, not as an amount filled from the left end; MUI lays the track out
// inline, so the override has to be !important to win
const originTrackSx = (value, min, max, origin) => ({
  '& .MuiSlider-track': {
    left: `${((Math.min(value, origin) - min) / (max - min)) * 100}% !important`,
    width: `${(Math.abs(value - origin) / (max - min)) * 100}% !important`,
  },
  '& .MuiSlider-mark': { width: 3, height: 3, borderRadius: '50%', backgroundColor: INK, opacity: 0.45 },
});

// the little coral ring beside a control that has been moved off the default;
// clicking it puts the value back. It keeps its 14px of the row either way, so
// nothing shifts sideways as values change
const ResetDot = ({ label, changed, onReset }) => (
  <Box sx={{ width: 14, height: 14, flexShrink: 0 }}>
    {changed ? (
      <Tooltip title='Back to default'>
        <Box component='button' type='button' aria-label={`Reset ${label}`} onClick={onReset}
          sx={{
            width: 14, height: 14, p: 0, borderRadius: '50%', cursor: 'pointer',
            border: `2px solid ${CORAL}`, backgroundColor: CANVAS,
            transition: 'background-color 120ms ease',
            '&:hover': { backgroundColor: CORAL },
          }} />
      </Tooltip>
    ) : null}
  </Box>
);

const ControlSlider = ({
  label, value, onChange, onReset = null, changed = false, ariaLabel = null,
  min = 0, max = 100, step = 1, unit = '',
  disabled = false, marks = false, origin = null,
}) => {
  const dense = useDense();
  const name = ariaLabel ?? label;
  const slider = (
    <Slider size='small' value={value} min={min} max={max} step={step} disabled={disabled}
      marks={marks} onChange={(e, v) => onChange(v)} aria-label={name}
      sx={{
        ...(origin === null ? null : originTrackSx(value, min, max, origin)),
        ...(dense ? { '& .MuiSlider-thumb': { width: 24, height: 24 }, '& .MuiSlider-rail, & .MuiSlider-track': { height: 8 } } : null),
      }} />
  );
  const readout = (
    <Typography component='span' variant='body2' sx={{
      fontFamily: "'Fira Code', monospace", fontSize: 12.5, whiteSpace: 'nowrap',
      color: disabled ? 'text.disabled' : 'text.secondary',
    }}>
      {value}{unit}
    </Typography>
  );
  const heading = (
    <Typography component='span' variant='body2' sx={{
      fontWeight: 700, fontSize: dense ? 13.5 : 13,
      color: disabled ? 'text.disabled' : 'text.primary',
    }}>
      {label}
    </Typography>
  );

  if (dense) {
    return (
      <Box sx={{ opacity: disabled ? 0.55 : 1 }}>
        <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          {heading}
          <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
            {readout}
            <ResetDot label={name} changed={changed && !!onReset} onReset={onReset} />
          </Stack>
        </Stack>
        {slider}
      </Box>
    );
  }
  return (
    <Box sx={{
      display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr) 54px 14px',
      alignItems: 'center', columnGap: 1.25, opacity: disabled ? 0.55 : 1,
    }}>
      {heading}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>{slider}</Box>
      <Box sx={{ textAlign: 'right' }}>{readout}</Box>
      <ResetDot label={name} changed={changed && !!onReset} onReset={onReset} />
    </Box>
  );
};

// width and height as one control: a lock keeps them equal (which is also what
// makes the Eye size the shape against the smaller parent radius, so a locked
// pair really is a circle inside an ellipse), and unlocking splits them
const LinkedSizeControl = ({
  label, name, width, height, onChange, locked, onLock,
  changed = false, onReset = null, disabled = false,
}) => {
  const dense = useDense();
  const set = (axis) => (value) => onChange(
    locked ? { width: value, height: value } : { ...{ width, height }, [axis]: value }
  );
  return (
    <Box sx={{
      border: `2px solid rgba(41,34,58,0.13)`, borderRadius: 3.5,
      p: dense ? 1.25 : 1.5, backgroundColor: '#FFF9EF', opacity: disabled ? 0.55 : 1,
    }}>
      <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography component='span' variant='body2' sx={{ fontWeight: 700, fontSize: dense ? 13.5 : 13 }}>
          {label}
        </Typography>
        <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
          {dense ? null : (
            <Typography component='span' variant='body2' sx={{
              fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap',
            }}>
              {width} × {height}%
            </Typography>
          )}
          <Tooltip title={locked
            ? 'Width and height are locked together. Click to set them separately'
            : 'Width and height are separate. Click to lock them together'}>
            <Box component='button' type='button' onClick={onLock}
              aria-pressed={locked} aria-label={`Lock ${name} width and height together`}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: dense ? 30 : 24, height: dense ? 30 : 24, p: 0, borderRadius: 2,
                border: `2px solid ${INK}`, cursor: 'pointer', flexShrink: 0,
                backgroundColor: locked ? CORAL : PAPER, color: locked ? PAPER : INK,
                transition: 'background-color 120ms ease',
                '&:hover': { filter: 'brightness(0.94)' },
              }}>
              {locked
                ? <LockRoundedIcon sx={{ fontSize: dense ? 15 : 13 }} />
                : <LockOpenRoundedIcon sx={{ fontSize: dense ? 15 : 13 }} />}
            </Box>
          </Tooltip>
          <ResetDot label={`${name} size`} changed={changed && !!onReset} onReset={onReset} />
        </Stack>
      </Stack>
      {[['W', 'width', width], ['H', 'height', height]].map(([axis, key, value]) => (
        <Box key={key} sx={{
          display: 'grid', gridTemplateColumns: dense ? '16px minmax(0, 1fr) 42px' : '14px minmax(0, 1fr) 40px',
          alignItems: 'center', columnGap: 1, mt: 0.25,
        }}>
          <Typography component='span' sx={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: 'text.secondary' }}>
            {axis}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider size='small' value={value} min={0} max={100} disabled={disabled}
              aria-label={`${name} ${key}`} onChange={(e, v) => set(key)(v)}
              sx={dense ? { '& .MuiSlider-thumb': { width: 24, height: 24 }, '& .MuiSlider-rail, & .MuiSlider-track': { height: 8 } } : null} />
          </Box>
          <Typography component='span' sx={{
            fontFamily: "'Fira Code', monospace", fontSize: 12, color: 'text.secondary', textAlign: 'right',
          }}>
            {value}%
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// the colour fields keep whatever case was typed in their own state, so the
// uppercase shown here is CSS; the value handed back to the config is uppercased
// too. An alpha field reads and writes the 8-digit HEXA form, which the Eye
// splits into fill and fill-opacity
const ColorControl = ({
  label, value, onChange, onReset = null, changed = false,
  ariaLabel = null, disabled = false, alpha = false,
}) => {
  const dense = useDense();
  const name = ariaLabel ?? label;
  return (
    <Stack direction='row' spacing={1.25} sx={{
      alignItems: 'center', justifyContent: 'space-between', opacity: disabled ? 0.55 : 1,
    }}>
      <Typography component='span' variant='body2' sx={{
        fontWeight: 700, fontSize: dense ? 13.5 : 13,
        color: disabled ? 'text.disabled' : 'text.primary',
      }}>
        {label}
      </Typography>
      <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
        <MuiColorInput format={alpha ? 'hex8' : 'hex'} isAlphaHidden={!alpha}
          size='small' value={value} disabled={disabled}
          onChange={(v) => onChange(upperHex(v))}
          slotProps={{ htmlInput: { 'aria-label': name } }}
          sx={{
            width: alpha ? (dense ? 168 : 158) : (dense ? 148 : 138),
            '& .MuiInputBase-root': {
              height: dense ? 40 : 32, borderRadius: 999, pl: 0.75, pr: 1,
              backgroundColor: PAPER,
            },
            '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: 'rgba(41,34,58,0.35)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: INK },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: CORAL },
            '& .MuiColorInput-Button': {
              width: dense ? 24 : 20, height: dense ? 24 : 20, minWidth: 0,
              border: `2px solid ${INK}`, borderRadius: '50%',
            },
            '& input': {
              fontFamily: "'Fira Code', monospace", fontSize: 12,
              textTransform: 'uppercase', px: 0.5,
            },
          }} />
        <ResetDot label={name} changed={changed && !!onReset} onReset={onReset} />
      </Stack>
    </Stack>
  );
};

const SwitchControl = ({ label, checked, onChange, disabled = false, ariaLabel = null }) => {
  const dense = useDense();
  return (
    <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      {/* the label sits beside the switch rather than wrapping it, so the switch
          carries the name itself */}
      <Typography component='span' variant='body2' sx={{
        fontWeight: 700, fontSize: dense ? 13.5 : 13,
        color: disabled ? 'text.disabled' : 'text.primary',
      }}>
        {label}
      </Typography>
      <Switch checked={checked} disabled={disabled} slotProps={{ input: { 'aria-label': ariaLabel ?? label } }}
        onChange={(e) => onChange(e.target.checked)} />
    </Stack>
  );
};

// the gaze and the glint are both a point inside a box, so they get a box to put
// it in rather than two sliders to convert in your head: drag (or nudge with the
// arrow keys, ten at a time with shift) to set both axes at once. While a
// movement mode drives the eye the pad is read-only but still live, so the dot
// keeps showing where the eye is looking
const XYPad = ({ label, value, onChange, disabled = false, smooth = false, sx = null }) => {
  const boxRef = useRef(null);
  const [x, y] = value.map(Math.round);

  const pointAt = (event) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box?.width || !box?.height) return;
    onChange([
      clampAxis(((event.clientX - box.left) / box.width) * 200 - 100),
      clampAxis(((event.clientY - box.top) / box.height) * 200 - 100),
    ]);
  };
  const onPointerDown = (event) => {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointAt(event);
  };
  const onPointerMove = (event) => {
    if (disabled || !event.currentTarget.hasPointerCapture?.(event.pointerId)) return;
    pointAt(event);
  };
  const onKeyDown = (event) => {
    const step = event.shiftKey ? 10 : 1;
    const nudge = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    }[event.key];
    if (disabled || !nudge) return;
    event.preventDefault();
    onChange([clampAxis(x + nudge[0]), clampAxis(y + nudge[1])]);
  };

  // the same easing and duration as the lens itself, so the dot travels with it
  const glide = smooth ? 'left 500ms cubic-bezier(0.22, 1, 0.36, 1), top 500ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
  return (
    <Box ref={boxRef} role='group' aria-label={`${label}: ${x}, ${y}`} aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onKeyDown={onKeyDown}
      sx={{
        position: 'relative', flex: '0 0 auto',
        borderRadius: 3.5, border: `2.5px solid ${INK}`, backgroundColor: PAPER,
        boxShadow: `2px 2px 0 ${INK}`,
        backgroundImage: 'radial-gradient(rgba(41,34,58,0.14) 1.5px, transparent 1.5px)',
        backgroundSize: '13px 13px',
        backgroundPosition: 'center',
        touchAction: 'none', cursor: disabled ? 'default' : 'crosshair',
        opacity: disabled ? 0.6 : 1,
        '&:focus-visible': { outline: `3px solid ${CORAL}`, outlineOffset: 3 },
        ...sx,
      }}>
      {/* the centre notch, so "straight ahead" is somewhere you can aim for */}
      <Box sx={{ position: 'absolute', left: 6, right: 6, top: '50%', borderTop: '1.5px dashed rgba(41,34,58,0.28)' }} />
      <Box sx={{ position: 'absolute', top: 6, bottom: 6, left: '50%', borderLeft: '1.5px dashed rgba(41,34,58,0.28)' }} />
      <Box sx={{
        position: 'absolute', width: 16, height: 16, borderRadius: '50%',
        backgroundColor: CORAL, border: `2.5px solid ${INK}`, boxSizing: 'border-box',
        left: `${(x + 100) / 2}%`, top: `${(y + 100) / 2}%`,
        transform: 'translate(-50%, -50%)',
        transition: glide,
      }} />
    </Box>
  );
};

// a pad with its name and its two numbers, and room beside it (or under it, on a
// phone) for whatever the panel wants to say about it
const PadControl = ({ label, value, onChange, disabled = false, smooth = false, note = null }) => {
  const dense = useDense();
  const [x, y] = value.map(Math.round);
  const heading = (
    <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
      <Typography component='span' variant='body2' sx={{
        fontWeight: 700, fontSize: dense ? 13.5 : 13, color: disabled ? 'text.disabled' : 'text.primary',
      }}>
        {label}
      </Typography>
      <Typography component='span' variant='body2' sx={{
        fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: disabled ? 'text.disabled' : 'text.secondary',
      }}>
        [{x}, {y}]
      </Typography>
    </Stack>
  );

  if (dense) {
    return (
      <Box>
        {heading}
        <XYPad label={label} value={value} onChange={onChange} disabled={disabled} smooth={smooth}
          sx={{ width: '100%', aspectRatio: '1.7', borderRadius: 4 }} />
        {note ? (
          <Typography variant='caption' sx={{ display: 'block', mt: 0.75, color: 'text.secondary', lineHeight: 1.5 }}>
            {note}
          </Typography>
        ) : null}
      </Box>
    );
  }
  return (
    <Stack direction='row' spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <XYPad label={label} value={value} onChange={onChange} disabled={disabled} smooth={smooth}
        sx={{ width: 120, height: 120 }} />
      <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
        {heading}
        {note ? (
          <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.5 }}>
            {note}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
};

const CopyButton = ({ getText, label = 'Copy', color = 'primary', variant = 'contained', sx = null }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Button size='small' variant={variant} disableElevation color={color} sx={sx}
      onClick={() => {
        navigator.clipboard?.writeText(getText());
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}>
      {copied ? 'Copied!' : label}
    </Button>
  );
};

// ---------------------------------------------------------------------------
// The eye on the stage
// ---------------------------------------------------------------------------

// eye props derived from a demo config (shared by the stage and the previews)
const eyeProps = (config, lensPosition) => ({
  scleraWidth: config.scleraWidth,
  scleraHeight: config.scleraHeight,
  scleraColor: config.scleraColor,
  eyeOutlineThickness: config.eyeOutlineThickness,
  eyeOutlineColor: config.eyeOutlineColor,
  irisWidth: config.irisWidth,
  irisHeight: config.irisHeight,
  irisColor: config.irisColor,
  limbusThickness: config.limbusThickness,
  limbusColor: config.limbusColor,
  pupilWidth: config.pupilWidth,
  pupilHeight: config.pupilHeight,
  pupilColor: config.pupilColor,
  catchlightWidth: config.catchlightWidth,
  catchlightHeight: config.catchlightHeight,
  catchlightPosition: config.catchlightPosition,
  catchlightColor: config.catchlightColor,
  upperLidSize: config.upperLidSize,
  upperLidColor: config.upperLidColor,
  lowerLidSize: config.lowerLidSize,
  lowerLidColor: config.lowerLidColor,
  upperEyelinerSize: config.upperEyelinerSize,
  upperEyelinerColor: config.upperEyelinerColor,
  lowerEyelinerSize: config.lowerEyelinerSize,
  lowerEyelinerColor: config.lowerEyelinerColor,
  rotation: config.rotation,
  blinking: config.blinking,
  blinkSpeed: config.blinkSpeed,
  blinkFrequency: config.blinkFrequency,
  blinkSqueeze: config.blinkSqueeze,
  lensPosition,
});

// the right eye's override, exactly as the snippet writes it
const rightEyeOverride = (config) => {
  const override = {};
  if (config.oddEye) override.irisColor = config.rightIrisColor;
  if (config.oddGaze) override.lensPosition = ODD_GAZE;
  return Object.keys(override).length > 0 ? override : undefined;
};

// the stage and the preset previews draw the same thing: one Eye, or the real
// EyePair when the config asks for two. The demo drives the movement itself (so
// the pad can track it), which is why lensMovement stays off here. Each eye
// takes its share of the box, so a pair always fits the width it is given
const StageEyes = ({ config, lensPosition, lensSpeed = 500 }) => {
  const shared = { ...eyeProps(config, lensPosition), lensMovement: false, lensSpeed };
  if (config.eyeCount !== 2) return <Eye {...shared} width='100%' height='100%' />;
  return (
    <EyePair {...shared}
      width={`${(100 / pairSpan(config.gap)).toFixed(3)}%`} height='100%'
      gap={config.gap} eyeRotation={config.eyeRotation}
      rightEye={rightEyeOverride(config)}
      style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center' }} />
  );
};

// ---------------------------------------------------------------------------
// The part labels on the canvas
// ---------------------------------------------------------------------------

// The chips point at the parts they name, so every setting has somewhere on the
// eye to look. The anchors are computed in the Eye's own 0-100 viewBox space
// (the stage box is exactly that box), following the same geometry the component
// draws with: a circular shape measures against the smaller parent radius, the
// limbus eats inwards from the iris edge, and the lens travels the slack between
// iris and sclera.
const partAnchors = (config, lens) => {
  const c = config;
  const scleraRadiusX = c.scleraWidth / 2;
  const scleraRadiusY = c.scleraHeight / 2;
  const circle = (w, h) => w === h;
  const smallSclera = Math.min(scleraRadiusX, scleraRadiusY);
  const irisRadiusX = circle(c.irisWidth, c.irisHeight)
    ? smallSclera * c.irisWidth / 100 : scleraRadiusX * c.irisWidth / 100;
  const irisRadiusY = circle(c.irisWidth, c.irisHeight)
    ? smallSclera * c.irisHeight / 100 : scleraRadiusY * c.irisHeight / 100;
  const limbusRatio = Math.min(100, Math.max(0, c.limbusThickness)) / 100;
  const irisFillRadiusX = irisRadiusX * (1 - limbusRatio);
  const smallIris = Math.min(irisRadiusX, irisRadiusY);
  const pupilRadiusX = circle(c.pupilWidth, c.pupilHeight)
    ? smallIris * c.pupilWidth / 100 : irisRadiusX * c.pupilWidth / 100;
  const catchlightRadiusX = circle(c.catchlightWidth, c.catchlightHeight)
    ? smallIris * c.catchlightWidth / 100 : irisRadiusX * c.catchlightWidth / 100;
  const catchlightRadiusY = circle(c.catchlightWidth, c.catchlightHeight)
    ? smallIris * c.catchlightHeight / 100 : irisRadiusY * c.catchlightHeight / 100;
  const catchlightX = (irisRadiusX - catchlightRadiusX) / 100 * c.catchlightPosition[0];
  const catchlightY = (irisRadiusY - catchlightRadiusY) / 100 * c.catchlightPosition[1];
  const lensX = 50 + (scleraRadiusX - irisRadiusX) / 100 * lens[0];
  const lensY = 50 + (scleraRadiusY - irisRadiusY) / 100 * lens[1];
  const upperLidHeight = scleraRadiusY * c.upperLidSize / 100;
  const upperLinerHeight = scleraRadiusY * c.upperEyelinerSize / 100;
  const outlineRatio = Math.min(100, Math.max(0, c.eyeOutlineThickness)) / 100;

  // the lid rect is clipped by the sclera ellipse, so at an off-centre x the
  // white starts lower: walk inwards until the band is actually visible there
  const bandAt = (topEdge, bottomEdge) => {
    for (const dx of [0.5, 0.4, 0.3, 0.2, 0.1, 0]) {
      const rim = 50 - scleraRadiusY * Math.sqrt(Math.max(0, 1 - dx * dx));
      const top = Math.max(rim, topEdge);
      if (bottomEdge - top > 0.9) return { x: 50 - scleraRadiusX * dx, y: (top + bottomEdge) / 2 };
    }
    return { x: 50, y: Math.max(50 - scleraRadiusY + 0.9, (50 - scleraRadiusY + bottomEdge) / 2) };
  };
  const lidPoint = bandAt(50 - scleraRadiusY, 50 - scleraRadiusY + upperLidHeight);
  const linerPoint = bandAt(50 - scleraRadiusY + upperLidHeight,
    50 - scleraRadiusY + upperLidHeight + upperLinerHeight);

  const parts = [
    {
      id: 'lid', name: 'Eyelid', section: 'lids', tab: 'lids', side: 'L',
      x: lidPoint.x, y: lidPoint.y, on: c.upperLidSize > 0 || c.lowerLidSize > 0,
    },
    {
      id: 'sclera', name: 'Sclera', section: 'shape', tab: 'shape', side: 'L',
      x: ((50 - scleraRadiusX) + (lensX - irisRadiusX)) / 2, y: 50 + scleraRadiusY * 0.16, on: true,
    },
    {
      id: 'limbus', name: 'Limbus', section: 'limbus', tab: 'iris', side: 'L',
      x: lensX - irisRadiusX * (1 - limbusRatio / 2) * 0.8,
      y: lensY + irisRadiusY * (1 - limbusRatio / 2) * 0.58, on: c.limbusThickness > 0,
    },
    {
      id: 'outline', name: 'Outline', section: 'outline', tab: 'shape', side: 'L',
      x: 50 - scleraRadiusX * (1 - outlineRatio / 2) * 0.72,
      y: 50 + scleraRadiusY * (1 - outlineRatio / 2) * 0.69, on: c.eyeOutlineThickness > 0,
    },
    {
      id: 'catchlight', name: 'Catchlight', section: 'shine', tab: 'shine', side: 'R',
      x: lensX + catchlightX, y: lensY + catchlightY,
      on: c.catchlightWidth > 0 && c.catchlightHeight > 0,
    },
    {
      id: 'iris', name: 'Iris', section: 'iris', tab: 'iris', side: 'R',
      x: lensX + (pupilRadiusX + irisFillRadiusX) / 2, y: lensY, on: true,
    },
    { id: 'pupil', name: 'Pupil', section: 'pupil', tab: 'iris', side: 'R', x: lensX, y: lensY, on: true },
    {
      id: 'liner', name: 'Eyeliner', section: 'liner', tab: 'lids', side: 'R',
      x: 100 - linerPoint.x, y: linerPoint.y,
      on: c.upperEyelinerSize > 0 || c.lowerEyelinerSize > 0,
    },
  ];

  // the two shapes that travel with the gaze pick the side they are already on
  for (const part of parts) {
    if (part.id === 'catchlight' || part.id === 'limbus') part.side = part.x < 50 ? 'L' : 'R';
  }
  // then each side's chips are spread down its own edge, in the order the parts
  // sit on the eye, so no two leader lines cross
  for (const side of ['L', 'R']) {
    const column = parts.filter((part) => part.side === side).sort((a, b) => a.y - b.y);
    column.forEach((part, index) => {
      part.chipY = column.length === 1 ? 50 : 8 + index * (84 / (column.length - 1));
    });
  }
  return parts.map((part) => ({
    ...part,
    chipX: part.side === 'L' ? 50 - scleraRadiusX - 3 : 50 + scleraRadiusX + 3,
    chipY: Math.max(3, Math.min(97, part.chipY)),
  }));
};

// ---------------------------------------------------------------------------
// The generated SVG
// ---------------------------------------------------------------------------

// the drawing as it stands on the canvas, one tag per line and indented: what
// the SVG tab shows for anyone who wants the picture without the component
const prettyMarkup = (element) => {
  let depth = 0;
  return element.outerHTML.replace(/></g, '>\n<').split('\n').map((line) => {
    if (/^<\//.test(line)) depth = Math.max(0, depth - 1);
    const pad = '  '.repeat(depth);
    const opens = /^<[a-z]/i.test(line) && !/\/>$/.test(line) && !/<\/[a-z-]+>$/i.test(line);
    if (opens) depth += 1;
    return pad + line;
  }).join('\n');
};

// ---------------------------------------------------------------------------
// The studio's chrome: tabs, rails and the stage
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'shape', label: 'Shape' },
  { id: 'iris', label: 'Iris' },
  { id: 'shine', label: 'Shine' },
  { id: 'lids', label: 'Lids' },
  { id: 'motion', label: 'Motion' },
  { id: 'pair', label: 'Pair' },
];

// which config keys each tab owns, for the dot that marks a tab holding
// something moved off the default
const TAB_KEYS = {
  shape: ['scleraWidth', 'scleraHeight', 'scleraColor', 'rotation', 'eyeOutlineThickness', 'eyeOutlineColor'],
  iris: ['irisWidth', 'irisHeight', 'irisColor', 'limbusThickness', 'limbusColor', 'pupilWidth', 'pupilHeight', 'pupilColor'],
  shine: ['catchlightWidth', 'catchlightHeight', 'catchlightColor', 'catchlightPosition'],
  lids: ['upperLidSize', 'lowerLidSize', 'upperLidColor', 'lowerLidColor',
    'upperEyelinerSize', 'lowerEyelinerSize', 'upperEyelinerColor', 'lowerEyelinerColor'],
  motion: ['lensPosition', 'blinking', 'blinkSqueeze', 'blinkSpeed', 'blinkFrequency'],
  pair: ['gap', 'eyeRotation', 'oddEye', 'rightIrisColor', 'oddGaze'],
};

const CODE_TABS = [
  { id: 'jsx', label: 'JSX' },
  { id: 'svg', label: 'SVG' },
  { id: 'props', label: 'Props' },
  { id: 'install', label: 'Install' },
];

// a folder tab: the selected one loses its bottom border into the panel below it
const FolderTab = ({ label, selected, onClick, dark = false, id, controls, sx = null }) => (
  <Box component='button' type='button' role='tab' id={id} aria-controls={controls}
    aria-selected={selected} tabIndex={selected ? 0 : -1} onClick={onClick}
    sx={{
      position: 'relative', bottom: '-2.5px',
      font: 'inherit', fontFamily: "'Fredoka', sans-serif", fontWeight: 500, fontSize: 13,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6,
      px: 1.5, py: '8px', cursor: 'pointer', whiteSpace: 'nowrap',
      borderRadius: '12px 12px 0 0',
      border: `2.5px solid ${selected ? (dark ? '#17121F' : INK) : 'transparent'}`,
      borderBottomColor: selected ? (dark ? INK : PAPER) : 'transparent',
      backgroundColor: selected ? (dark ? INK : PAPER) : 'transparent',
      color: selected ? (dark ? CREAM : INK) : (dark ? '#9E93B5' : '#8B8199'),
      zIndex: selected ? 2 : 1,
      transition: 'background-color 120ms ease, color 120ms ease',
      '&:hover': selected ? null : {
        backgroundColor: dark ? 'rgba(255,255,255,0.09)' : 'rgba(255,253,248,0.72)',
        color: dark ? CREAM : INK,
      },
      ...sx,
    }}>
    {label}
  </Box>
);

// one named block of settings inside the inspector: a coloured bead that lights
// up when its part is hovered on the canvas, a title, and a one-line hint
const SettingsGroup = ({ title, hint, hot, onEnter, onLeave, sectionRef, children, first = false }) => (
  <Box component='section' ref={sectionRef} onMouseEnter={onEnter} onMouseLeave={onLeave}
    sx={{ pt: first ? 1.5 : 2.5, pb: 2.5, borderBottom: '2px dashed rgba(41,34,58,0.14)' }}>
    <Stack direction='row' spacing={1} sx={{ alignItems: 'baseline', mb: 1.5 }}>
      <Box component='span' aria-hidden='true' sx={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, alignSelf: 'center',
        backgroundColor: hot ? CORAL : 'rgba(41,34,58,0.22)',
        transition: 'background-color 120ms ease',
      }} />
      <Typography variant='h3' sx={{ fontSize: 15 }}>{title}</Typography>
      {hint ? (
        <Typography component='span' sx={{ fontSize: 11, color: '#8B8199', lineHeight: 1.35 }}>{hint}</Typography>
      ) : null}
    </Stack>
    <Stack spacing={1.75}>{children}</Stack>
  </Box>
);

const GroupNote = ({ children }) => (
  <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.55 }}>
    {children}
  </Typography>
);

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

// width and height start out linked wherever the config has them equal, so a
// preset with a circular iris keeps it circular under the slider
const locksFor = (config) => ({
  sclera: config.scleraWidth === config.scleraHeight,
  iris: config.irisWidth === config.irisHeight,
  pupil: config.pupilWidth === config.pupilHeight,
  catchlight: config.catchlightWidth === config.catchlightHeight,
});

function App() {
  const [config, setConfig] = useState(() => parseShareParams(window.location.search) ?? initialConfig);
  const [locks, setLocks] = useState(() => locksFor(config));
  const set = (key) => (value) => setConfig((c) => ({ ...c, [key]: value }));
  // a whole new config (a preset, a reset, a shuffle) also re-links the sizes
  const replaceConfig = (next) => { setConfig(next); setLocks(locksFor(next)); };

  const [tab, setTab] = useState('shape'); // the inspector section in view
  const [showLabels, setShowLabels] = useState(true);
  const [hotPart, setHotPart] = useState(null); // the part the pointer is over
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [codeTab, setCodeTab] = useState('jsx');
  const [svgText, setSvgText] = useState('');
  const [sheetStep, setSheetStep] = useState(1); // phone: peek / half / full
  const [sheetSection, setSheetSection] = useState('shape');

  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const pairMode = config.eyeCount === 2;
  const span = pairMode ? pairSpan(config.gap) : 1;

  const changed = (key) => {
    const now = config[key];
    const was = initialConfig[key];
    return Array.isArray(now) ? now.join() !== was.join() : now !== was;
  };
  const resetKeys = (...keys) => () => setConfig((c) => {
    const next = { ...c };
    for (const key of keys) next[key] = initialConfig[key];
    return next;
  });

  // shareable URL for the current config; the address bar follows it (debounced)
  // once the user changes anything. The pristine-load value is compared by
  // ref (not a first-run flag) so the loaded URL stays untouched even under
  // StrictMode's double-invoked effects; after the first real change the
  // sentinel is cleared and every change syncs.
  const shareUrl = useMemo(() => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}?${buildShareParams(config)}`;
  }, [config]);
  const loadedConfig = useRef(config);
  useEffect(() => {
    if (loadedConfig.current && config === loadedConfig.current) return;
    loadedConfig.current = null;
    const timeoutId = setTimeout(() => window.history.replaceState(null, '', shareUrl), 300);
    return () => clearTimeout(timeoutId);
  }, [config, shareUrl]);

  // wander: one shared random target, so the stage and the gaze pad agree on
  // where the eyes are looking (EyePair does the same for its own two eyes)
  const [wanderLens, setWanderLens] = useState([0, 0]);
  useEffect(() => {
    if (config.movement !== 'wander') return;
    const intervalId = setInterval(() => {
      setWanderLens([randomNumber(-90, 90), randomNumber(-90, 90)]);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [config.movement]);

  // follow-the-cursor: mousemove only records a target; a damped rAF loop eases
  // the lens towards it, so motion stays smooth regardless of event rate
  const stageRef = useRef(null);
  const [followLens, setFollowLens] = useState([0, 0]);
  useEffect(() => {
    if (config.movement !== 'follow') return;
    const target = { x: 0, y: 0 };
    const onMove = (e) => {
      const box = stageRef.current?.getBoundingClientRect();
      if (!box) return;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      target.x = Math.max(-90, Math.min(90, ((e.clientX - cx) / (window.innerWidth / 2)) * 140));
      target.y = Math.max(-90, Math.min(90, ((e.clientY - cy) / (window.innerHeight / 2)) * 140));
    };
    let raf;
    const tick = () => {
      setFollowLens((prev) => {
        const [px, py] = prev;
        const dx = target.x - px;
        const dy = target.y - py;
        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return prev; // settled: skip re-render
        return [px + dx * 0.14, py + dy * 0.14];
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, [config.movement]);

  // where the lens actually is right now: driven by the active movement mode, or
  // by the gaze pad when the eye is still
  const lensPosition =
    config.movement === 'follow' ? followLens :
    config.movement === 'wander' ? wanderLens : config.lensPosition;
  const stillEye = config.movement === 'still';
  // both catchlight axes need something to place before they mean anything
  const catchlightOn = config.catchlightWidth > 0 && config.catchlightHeight > 0;

  // the snippet tracks the live lens, so a cursor-following eye writes its own code
  const [lensX, lensY] = lensPosition;
  const codeProps = useMemo(
    () => buildCodeProps(config, [lensX, lensY]),
    [config, lensX, lensY]);
  const componentName = pairMode ? 'EyePair' : 'Eye';
  const codeText = useMemo(() => {
    const inner = codeProps.map((p) => `  ${p.name}${p.value === null ? '' : `=${p.value}`}`).join('\n');
    return `import { ${componentName} } from 'cartoon-eyes';\n\n<${componentName}\n${inner}\n/>`;
  }, [codeProps, componentName]);

  // the live drawing, read back off the stage whenever the SVG tab is looking
  const svgVisible = desktop
    ? (drawerOpen && codeTab === 'svg')
    : (sheetSection === 'code' && codeTab === 'svg');
  const grabSvg = useCallback(() => {
    const stage = stageRef.current;
    const drawing = stage?.querySelector('.cartoon-eye-pair') ?? stage?.querySelector('svg');
    setSvgText(drawing ? prettyMarkup(drawing) : 'The stage has not drawn anything yet.');
  }, []);
  useEffect(() => {
    if (!svgVisible) return;
    const timeoutId = setTimeout(grabSvg, 60);
    return () => clearTimeout(timeoutId);
  }, [svgVisible, config, grabSvg]);

  // the Props table lights up exactly what the snippet writes, and the drawer
  // counts the same list
  const emitted = useMemo(() => new Set(codeProps.map((p) => p.name)), [codeProps]);
  const propCount = emitted.size;

  const activePreset = Object.keys(presets).find(
    (name) => JSON.stringify(presets[name]) === JSON.stringify(config)
  );

  const surpriseMe = () => replaceConfig({
    ...config,
    scleraWidth: randomNumber(45, 100), scleraHeight: randomNumber(40, 100),
    irisWidth: randomNumber(40, 100), irisHeight: randomNumber(40, 100),
    irisColor: randomOf(['#3E7BFA', '#E8A33D', '#16A34A', '#B45309', '#7A6EA8', '#FF5D3A', '#0E9E9E']),
    pupilWidth: randomNumber(10, 90), pupilHeight: randomNumber(10, 95),
    limbusThickness: randomOf([0, 0, 8, 12]),
    catchlightWidth: randomOf([0, 16, 22, 26]), catchlightHeight: randomOf([0, 16, 22, 26]),
    upperLidSize: randomNumber(0, 45), lowerLidSize: randomNumber(0, 35),
    rotation: randomOf([0, 0, 0, -12, 12]),
  });

  // -------------------------------------------------------------------------
  // The settings themselves: one list, rendered whole in the desktop inspector
  // and a tab at a time in the phone's sheet
  // -------------------------------------------------------------------------

  const sizeControl = (label, name, widthKey, heightKey, lockKey, extra = {}) => (
    <LinkedSizeControl label={label} name={name}
      width={config[widthKey]} height={config[heightKey]}
      locked={locks[lockKey]}
      onLock={() => setLocks((l) => ({ ...l, [lockKey]: !l[lockKey] }))}
      onChange={({ width, height }) => setConfig((c) => ({ ...c, [widthKey]: width, [heightKey]: height }))}
      changed={changed(widthKey) || changed(heightKey)}
      onReset={resetKeys(widthKey, heightKey)}
      {...extra} />
  );
  const slider = (label, key, extra = {}) => (
    <ControlSlider label={label} value={config[key]} onChange={set(key)}
      changed={changed(key)} onReset={resetKeys(key)} unit='%' {...extra} />
  );
  const color = (label, key, extra = {}) => (
    <ColorControl label={label} value={config[key]} onChange={set(key)}
      changed={changed(key)} onReset={resetKeys(key)} {...extra} />
  );

  const sections = [
    {
      id: 'shape', tab: 'shape', part: 'sclera', title: 'Eye shape', hint: '% of the drawing area',
      body: (
        <>
          {sizeControl('Size', 'Sclera', 'scleraWidth', 'scleraHeight', 'sclera')}
          {color('Colour', 'scleraColor', { ariaLabel: 'Sclera colour' })}
          <ControlSlider label='Tilt' value={config.rotation} onChange={set('rotation')}
            changed={changed('rotation')} onReset={resetKeys('rotation')}
            min={-180} max={180} unit='°' origin={0}
            marks={[-180, -90, 0, 90, 180].map((value) => ({ value }))} />
          <GroupNote>
            The whole eye turns, lids and all. Only the catchlight stays put, the way a
            reflection of a fixed light would.
          </GroupNote>
        </>
      ),
    },
    {
      id: 'outline', tab: 'shape', part: 'outline', title: 'Outline', hint: 'taken out of the sclera',
      body: (
        <>
          {slider('Thickness', 'eyeOutlineThickness', { ariaLabel: 'Outline thickness' })}
          {color('Colour', 'eyeOutlineColor', { ariaLabel: 'Outline colour', disabled: config.eyeOutlineThickness === 0 })}
          <GroupNote>
            Taken out of the sclera rather than added around it, so the eye never outgrows its box.
          </GroupNote>
        </>
      ),
    },
    {
      id: 'iris', tab: 'iris', part: 'iris', title: 'Iris', hint: '% of the sclera',
      body: (
        <>
          {sizeControl('Size', 'Iris', 'irisWidth', 'irisHeight', 'iris')}
          {color('Colour', 'irisColor', { ariaLabel: 'Iris colour' })}
        </>
      ),
    },
    {
      id: 'limbus', tab: 'iris', part: 'limbus', title: 'Limbus', hint: 'the darker rim of the iris',
      body: (
        <>
          {slider('Thickness', 'limbusThickness', { ariaLabel: 'Limbus thickness' })}
          {color('Colour', 'limbusColor', { ariaLabel: 'Limbus colour', disabled: config.limbusThickness === 0 })}
          <GroupNote>
            Taken out of the outer edge of the iris: the iris keeps its size and the pupil stays put.
          </GroupNote>
        </>
      ),
    },
    {
      id: 'pupil', tab: 'iris', part: 'pupil', title: 'Pupil', hint: '% of the iris',
      body: (
        <>
          {sizeControl('Size', 'Pupil', 'pupilWidth', 'pupilHeight', 'pupil')}
          {color('Colour', 'pupilColor', { ariaLabel: 'Pupil colour' })}
          <GroupNote>A narrow width with a tall height gives the slit of a cat or a snake.</GroupNote>
        </>
      ),
    },
    {
      id: 'shine', tab: 'shine', part: 'catchlight', title: 'Catchlight', hint: 'the glint',
      body: (
        <>
          {sizeControl('Size', 'Catchlight', 'catchlightWidth', 'catchlightHeight', 'catchlight')}
          {/* a glint is usually a touch transparent, so this one field carries an alpha channel */}
          {color('Colour', 'catchlightColor', { ariaLabel: 'Catchlight colour', alpha: true, disabled: !catchlightOn })}
          <PadControl label='Catchlight position' value={config.catchlightPosition}
            onChange={set('catchlightPosition')} disabled={!catchlightOn}
            note={"Drag to place the glint. It travels with the gaze but keeps to the screen's own axes: tilt the eye on Shape and watch it hold its place."} />
          <GroupNote>
            Sized against the whole iris, limbus included, and drawn over the pupil as well, so it
            can cross the edge of either.
          </GroupNote>
        </>
      ),
    },
    {
      id: 'lids', tab: 'lids', part: 'lid', title: 'Eyelids', hint: '% of the sclera half-height',
      body: (
        <>
          {slider('Upper', 'upperLidSize', { ariaLabel: 'Upper lid size' })}
          {slider('Lower', 'lowerLidSize', { ariaLabel: 'Lower lid size' })}
          {color('Upper colour', 'upperLidColor', { ariaLabel: 'Upper lid colour' })}
          {color('Lower colour', 'lowerLidColor', { ariaLabel: 'Lower lid colour' })}
        </>
      ),
    },
    {
      id: 'liner', tab: 'lids', part: 'liner', title: 'Eyeliner', hint: 'rides with every blink',
      body: (
        <>
          {slider('Upper', 'upperEyelinerSize', { ariaLabel: 'Upper eyeliner size' })}
          {slider('Lower', 'lowerEyelinerSize', { ariaLabel: 'Lower eyeliner size' })}
          {color('Upper colour', 'upperEyelinerColor', { ariaLabel: 'Upper eyeliner colour', disabled: config.upperEyelinerSize === 0 })}
          {color('Lower colour', 'lowerEyelinerColor', { ariaLabel: 'Lower eyeliner colour', disabled: config.lowerEyelinerSize === 0 })}
          <GroupNote>
            The liner belongs to the lid margins, so it rides up and down with every blink.
          </GroupNote>
        </>
      ),
    },
    {
      id: 'gaze', tab: 'motion', part: 'pupil', title: 'Gaze',
      hint: stillEye ? 'lensPosition' : 'read-only while the eye moves itself',
      body: (
        <>
          <PadControl label='Eye position' value={lensPosition} onChange={set('lensPosition')}
            disabled={!stillEye} smooth={config.movement === 'wander'}
            note={stillEye
              ? 'Drag to aim the eye, or nudge it with the arrow keys (shift for bigger steps). This is lensPosition: −100 to 100 on each axis.'
              : `The eye is ${config.movement === 'wander' ? 'wandering on its own' : 'following your cursor'}, so the pad only reports where it is looking. Pick Still above the canvas to aim it by hand.`} />
          {pairMode ? (
            <GroupNote>A pair shares one gaze: it is not mirrored, so a pair looking right looks right.</GroupNote>
          ) : null}
        </>
      ),
    },
    {
      id: 'blink', tab: 'motion', part: 'lid', title: 'Blinking', hint: '',
      body: (
        <>
          <SwitchControl label='Blinking' checked={config.blinking} onChange={set('blinking')} />
          <SwitchControl label='Squeeze' ariaLabel='Blink squeeze' checked={config.blinkSqueeze}
            onChange={set('blinkSqueeze')} disabled={!config.blinking} />
          <ControlSlider label='Speed' ariaLabel='Blink speed' value={config.blinkSpeed} onChange={set('blinkSpeed')}
            changed={changed('blinkSpeed')} onReset={resetKeys('blinkSpeed')}
            min={30} max={400} step={10} unit=' ms' disabled={!config.blinking} />
          <ControlSlider label='Every' ariaLabel='Blink every' value={config.blinkFrequency} onChange={set('blinkFrequency')}
            changed={changed('blinkFrequency')} onReset={resetKeys('blinkFrequency')}
            min={500} max={8000} step={100} unit=' ms' disabled={!config.blinking} />
          {pairMode ? (
            <GroupNote>A pair blinks on one clock, so both lids come down together.</GroupNote>
          ) : null}
        </>
      ),
    },
    {
      id: 'pair', tab: 'pair', part: 'sclera', title: 'The pair',
      hint: pairMode ? 'gap is a share of one eye' : 'switch to 2 eyes above the canvas',
      body: pairMode ? (
        <>
          {slider('Gap', 'gap')}
          <ControlSlider label='Outward tilt' value={config.eyeRotation} onChange={set('eyeRotation')}
            changed={changed('eyeRotation')} onReset={resetKeys('eyeRotation')}
            min={-60} max={60} unit='°' origin={0} marks={[{ value: 0 }]} />
          <SwitchControl label='Odd right eye' checked={config.oddEye} onChange={set('oddEye')} />
          {color('Right iris', 'rightIrisColor', { ariaLabel: 'Right iris colour', disabled: !config.oddEye })}
          <SwitchControl label='Right eye looks away' checked={config.oddGaze} onChange={set('oddGaze')} />
          <GroupNote>
            leftEye and rightEye override any shared prop for one eye. Naming lensPosition there
            takes that eye off the pair's shared gaze: it holds its own look while the other one
            wanders.
          </GroupNote>
        </>
      ) : (
        <>
          <GroupNote>
            <Box component='code' sx={{ fontFamily: "'Fira Code', monospace" }}>EyePair</Box>{' '}
            draws two eyes as one component: they share a gaze, blink on one clock and splay
            outwards together, and either one can be overridden on its own.
          </GroupNote>
          <Box>
            <Button variant='contained' size='small' disableElevation onClick={() => set('eyeCount')(2)}>
              Show a pair
            </Button>
          </Box>
        </>
      ),
    },
  ];

  const tabDot = (tabId) => TAB_KEYS[tabId].some(changed);

  // -------------------------------------------------------------------------
  // The inspector: one scroller, with the tabs above it jumping into it and
  // following it back
  // -------------------------------------------------------------------------

  const scrollerRef = useRef(null);
  const sectionRefs = useRef({});
  const jumpTo = (sectionId, tabId) => {
    setTab(tabId);
    setSheetSection(tabId);
    setSheetStep((step) => (step === 0 ? 1 : step));
    const element = sectionRefs.current[sectionId];
    scrollerRef.current?.scrollTo?.({ top: Math.max(0, (element?.offsetTop ?? 0) - 6), behavior: 'smooth' });
  };
  const onInspectorScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let current = sections[0];
    for (const section of sections) {
      const element = sectionRefs.current[section.id];
      if (element && element.offsetTop - 16 <= scroller.scrollTop) current = section;
    }
    if (current.tab !== tab) setTab(current.tab);
  };

  const chips = partAnchors(config, lensPosition);
  // the labels need the room the phone's canvas has not got, and the toggle
  // that turns them off only exists in the studio's stage bar
  const showChips = showLabels && !pairMode && desktop;

  // -------------------------------------------------------------------------
  // Pieces both layouts share
  // -------------------------------------------------------------------------

  const stage = (
    <Box ref={stageRef} className='eye-stage' sx={{
      position: 'relative', flex: '0 0 auto',
      height: `min(100cqh, calc(100cqw / ${span}))`,
      aspectRatio: String(span),
    }}>
      <StageEyes config={config} lensPosition={lensPosition}
        // in follow mode the rAF loop already eases, so the CSS transition would
        // only lag behind it
        lensSpeed={config.movement === 'follow' ? 0 : 500} />
      {showChips ? (
        <Box sx={{ position: 'absolute', inset: 0 }}>
          {/* the leader lines live in the eye's own coordinate space, so they
              land on the part however the stage is sized */}
          <Box component='svg' viewBox='0 0 100 100' preserveAspectRatio='none' aria-hidden='true'
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
            {chips.map((chip) => (
              <line key={chip.id} x1={chip.chipX} y1={chip.chipY} x2={chip.x} y2={chip.y}
                stroke={hotPart === chip.id ? CORAL : (chip.on ? 'rgba(41,34,58,0.6)' : 'rgba(41,34,58,0.28)')}
                strokeWidth='0.4' strokeDasharray='1.4 1.4' />
            ))}
            {chips.map((chip) => (
              <circle key={chip.id} cx={chip.x} cy={chip.y} r='0.85'
                fill={hotPart === chip.id ? CORAL : (chip.on ? 'rgba(41,34,58,0.6)' : 'rgba(41,34,58,0.28)')} />
            ))}
          </Box>
          {chips.map((chip) => (
            <Tooltip key={chip.id} disableInteractive describeChild
              title={chip.on ? `Jump to the ${chip.name.toLowerCase()} settings` : `${chip.name} is switched off. Open its settings to turn it on`}>
              <Box component='button' type='button'
                onClick={() => jumpTo(chip.section, chip.tab)}
                onMouseEnter={() => setHotPart(chip.id)} onMouseLeave={() => setHotPart(null)}
                onFocus={() => setHotPart(chip.id)} onBlur={() => setHotPart(null)}
                sx={{
                  position: 'absolute', left: `${chip.chipX}%`, top: `${chip.chipY}%`,
                  transform: chip.side === 'L' ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
                  font: 'inherit', fontFamily: "'Fredoka', sans-serif", fontWeight: 500, fontSize: 11.5,
                  px: 1.1, py: '2px', borderRadius: 999, whiteSpace: 'nowrap', cursor: 'pointer',
                  border: `2px solid ${chip.on ? INK : 'rgba(41,34,58,0.3)'}`,
                  backgroundColor: hotPart === chip.id ? CORAL : (chip.on ? PAPER : 'rgba(255,253,248,0.6)'),
                  color: hotPart === chip.id ? PAPER : (chip.on ? INK : 'rgba(41,34,58,0.45)'),
                  boxShadow: chip.on ? `1.5px 1.5px 0 ${INK}` : 'none',
                  transition: 'background-color 120ms ease, color 120ms ease',
                }}>
                {chip.name}
              </Box>
            </Tooltip>
          ))}
        </Box>
      ) : null}
    </Box>
  );

  const eyeCountToggle = (labels) => (
    <ToggleButtonGroup exclusive size='small' value={config.eyeCount} aria-label='How many eyes'
      onChange={(e, v) => v && set('eyeCount')(v)}
      sx={{ backgroundColor: PAPER, boxShadow: `2px 2px 0 ${INK}`, borderRadius: 4 }}>
      <ToggleButton value={1} sx={{ py: 0.5, px: 1.5 }}>{labels[0]}</ToggleButton>
      <ToggleButton value={2} sx={{ py: 0.5, px: 1.5 }}>{labels[1]}</ToggleButton>
    </ToggleButtonGroup>
  );

  const movementToggle = (
    <ToggleButtonGroup exclusive size='small' value={config.movement} aria-label='Movement'
      onChange={(e, v) => v && set('movement')(v)}
      sx={{ backgroundColor: PAPER, boxShadow: `2px 2px 0 ${INK}`, borderRadius: 4 }}>
      <ToggleButton value='wander' sx={{ py: 0.5, px: 1.5 }}>Wander</ToggleButton>
      <ToggleButton value='follow' sx={{ py: 0.5, px: 1.5 }}>Follow</ToggleButton>
      <ToggleButton value='still' sx={{ py: 0.5, px: 1.5 }}>Still</ToggleButton>
    </ToggleButtonGroup>
  );

  const copyTextFor = {
    jsx: () => codeText,
    svg: () => svgText,
    props: () => PROP_ROWS.map((r) => `${r.name}: ${r.type}  (default ${r.def})`).join('\n'),
    install: () => 'npm install cartoon-eyes',
  };
  const copyLabel = { jsx: 'Copy JSX', svg: 'Copy SVG', props: 'Copy props', install: 'Copy install' }[codeTab];

  const codePanel = (
    <Box role='tabpanel' id={`code-panel-${codeTab}`} aria-labelledby={`code-tab-${codeTab}`}>
      {codeTab === 'jsx' ? (
        <Box component='pre' sx={{
          m: 0, fontFamily: "'Fira Code', monospace", fontSize: { xs: 11.5, md: 13 },
          lineHeight: 1.65, color: CREAM, whiteSpace: 'pre',
        }}>
          <code>
            <Box component='span' sx={{ color: '#9D8CFF' }}>import</Box>
            {` { ${componentName} } `}
            <Box component='span' sx={{ color: '#9D8CFF' }}>from</Box>
            <Box component='span' sx={{ color: '#FFD166' }}>{" 'cartoon-eyes'"}</Box>
            {';\n\n'}
            <Box component='span' sx={{ color: '#7FD8D8' }}>{`<${componentName}`}</Box>
            {'\n'}
            {codeProps.map((p) => (
              <React.Fragment key={p.name}>
                {'  '}
                <Box component='span' sx={{ color: '#FFA07A' }}>{p.name}</Box>
                {p.value !== null && (
                  <>
                    {'='}
                    <Box component='span' sx={{ color: p.value.startsWith("'") ? '#FFD166' : '#B5E48C' }}>
                      {p.value}
                    </Box>
                  </>
                )}
                {'\n'}
              </React.Fragment>
            ))}
            <Box component='span' sx={{ color: '#7FD8D8' }}>{'/>'}</Box>
          </code>
        </Box>
      ) : null}

      {codeTab === 'svg' ? (
        <Box>
          <Stack direction='row' spacing={1.25} sx={{ alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Typography component='span' sx={{ fontSize: 12, color: '#B7AEC6' }}>
              The exact SVG on the canvas right now. Paste it anywhere, no React needed.
            </Typography>
            <Button size='small' onClick={grabSvg} sx={{
              flexShrink: 0, fontSize: 11.5, py: 0.25, px: 1.25, borderRadius: 999,
              backgroundColor: 'transparent', color: CREAM,
              border: '2px solid rgba(255,255,255,0.28)', boxShadow: 'none',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.09)', boxShadow: 'none', transform: 'none' },
            }}>
              Re-grab
            </Button>
          </Stack>
          <Box component='pre' sx={{
            m: 0, fontFamily: "'Fira Code', monospace", fontSize: { xs: 11, md: 12 },
            lineHeight: 1.6, color: '#B5E48C', whiteSpace: 'pre-wrap',
          }}>
            <code>{svgText}</code>
          </Box>
        </Box>
      ) : null}

      {codeTab === 'props' ? (
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{
            minWidth: 560, display: 'grid',
            gridTemplateColumns: '180px 96px 104px minmax(0, 1fr)',
            fontFamily: "'Fira Code', monospace", fontSize: 12.5,
            borderRadius: 3, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.12)',
          }}>
            {PROP_ROWS.map((row, index) => {
              const bg = index % 2 ? 'rgba(255,255,255,0.04)' : 'transparent';
              const live = (PROP_ROW_NAMES[row.name] ?? [row.name]).some((name) => emitted.has(name));
              return (
                <React.Fragment key={row.name}>
                  <Box sx={{ px: 1.25, py: 0.75, backgroundColor: bg, color: '#FFD166', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box component='span' aria-hidden='true' sx={{ color: CORAL, opacity: live ? 1 : 0 }}>●</Box>
                    {row.name}
                  </Box>
                  <Box sx={{ px: 1.25, py: 0.75, backgroundColor: bg, color: '#7FD8D8' }}>{row.type}</Box>
                  <Box sx={{ px: 1.25, py: 0.75, backgroundColor: bg, color: '#B5E48C' }}>{row.def}</Box>
                  <Box sx={{ px: 1.25, py: 0.75, backgroundColor: bg, color: '#D8D2E4', fontFamily: "'Nunito', sans-serif" }}>
                    {row.desc}
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>
        </Box>
      ) : null}

      {codeTab === 'install' ? (
        <Box sx={{
          color: CREAM, display: 'grid', gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'start',
        }}>
          <Box>
            <Box component='pre' sx={{
              m: 0, mb: 1.5, p: 1.75, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)',
              fontFamily: "'Fira Code', monospace", fontSize: 13,
            }}>
              npm install cartoon-eyes
            </Box>
            <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: '#D8D2E4' }}>
              No dependencies beyond React, TypeScript declarations included, and the whole eye is
              one piece of inline SVG, with no images, no canvas and no runtime CSS.
            </Typography>
          </Box>
          <Box component='pre' sx={{
            m: 0, p: 1.75, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)',
            fontFamily: "'Fira Code', monospace", fontSize: 13, lineHeight: 1.65,
            overflowX: 'auto',
          }}>
            {INSTALL_SNIPPET}
          </Box>
        </Box>
      ) : null}
    </Box>
  );

  const story = (
    <>
      <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
        <Box sx={{ width: 38, height: 38, flexShrink: 0 }}>
          <Eye width='100%' height='100%' scleraWidth={92} scleraHeight={72}
            irisSize={72} irisColor={CORAL} pupilSize={45}
            lidSize={12} lidColor={INK} blinking blinkFrequency={2600} />
        </Box>
        <Typography variant='h2' sx={{ fontSize: { xs: '1.35rem', md: '1.9rem' } }}>
          The story behind these eyes
        </Typography>
      </Stack>
      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '5fr 4fr' } }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, boxShadow: `3px 3px 0 ${INK}`, borderWidth: 2.5 }}>
          <Typography variant='h6' sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.15rem' } }}>
            Coded by hand, one maths headache at a time
          </Typography>
          <Typography variant='body2' sx={{ mb: 1.5 }}>
            I built this mini app and the <Link href='https://www.npmjs.com/package/cartoon-eyes'
            target='_blank' rel='noopener'>cartoon-eyes</Link> npm package in January 2023,
            back before AI coding assistants were a thing. The idea just sparked in my head
            one day and would not let go, so I kept coding away at it until I managed to
            code it to completion.
          </Typography>
          <Typography variant='body2' sx={{ mb: 1.5 }}>
            It turned out to be a brilliant exercise, too. Getting the geometry right
            forced my brain to do far more maths than everyday UI work ever does, and
            working the formulas out properly was the only way to wrap my head around
            some of it and make the SVG code accurate. It taught me a lot. Which, of
            course, became slightly obsolete not long after, when the AI coding
            assistants arrived!
          </Typography>
          <Typography variant='body2'>
            Speaking of which: V2 was done with the help of Claude, though mostly
            the cosmetics of this demo and the documentation I never got around to
            writing. The underlying eye code remains proudly mine.
          </Typography>
        </Paper>
        <Paper sx={{ p: { xs: 2, md: 3 }, backgroundColor: CANVAS, boxShadow: `3px 3px 0 ${INK}`, borderWidth: 2.5 }}>
          <Typography variant='h6' sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.15rem' } }}>
            Nothing is hardcoded
          </Typography>
          <Typography variant='body2' sx={{ mb: 1.5 }}>
            The whole eye is one 100% dynamic piece of SVG, and every measurement is
            relative: each shape is sized as a percentage of its parent.
          </Typography>
          <Stack direction='row' spacing={0.75} useFlexGap
            sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1.5, rowGap: 0.75 }}>
            {['pupil', 'iris', 'sclera', 'drawing area'].map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && (
                  <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>% of</Typography>
                )}
                <Box sx={{
                  px: 1.25, py: 0.25, border: `2px solid ${INK}`, borderRadius: 2,
                  backgroundColor: PAPER, fontFamily: "'Fredoka', sans-serif", fontSize: 13.5,
                }}>
                  {label}
                </Box>
              </React.Fragment>
            ))}
          </Stack>
          <Typography variant='body2'>
            Change any value and the rest adapt proportionally, and because it is pure
            vector it stays razor sharp at any size, from favicon to billboard.
          </Typography>
        </Paper>
      </Box>
      <Stack direction='row' sx={{ mt: 2.5, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
          MIT © <Link href='https://github.com/tmrk' target='_blank' rel='noopener' color='inherit'>Tamas Marki</Link>
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
          <Link href='https://www.npmjs.com/package/cartoon-eyes' target='_blank' rel='noopener' color='inherit'>
            cartoon-eyes on npm
          </Link>
        </Typography>
      </Stack>
    </>
  );

  // -------------------------------------------------------------------------
  // The desktop studio: preset rail, canvas, inspector, code drawer
  // -------------------------------------------------------------------------

  const desktopStudio = (
    <Paper sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'clamp(600px, calc(100vh - 148px), 880px)' }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { md: '148px minmax(0, 1fr) 340px', lg: '168px minmax(0, 1fr) 408px' },
        flex: 1, minHeight: 0,
      }}>

        {/* the presets, as a rail you start from */}
        <Box sx={{ borderRight: `3px solid ${INK}`, backgroundColor: TINT, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Typography variant='overline' component='h2' sx={{ px: 1.75, pt: 1.5, pb: 1, fontSize: 11, color: 'text.secondary' }}>
            Start from
          </Typography>
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 1.25, pb: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {Object.entries(presets).map(([name, presetConfig]) => {
              const active = activePreset === name;
              return (
                <Box key={name} component='button' type='button' aria-pressed={active}
                  onClick={() => replaceConfig(presetConfig)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, flex: '0 0 auto',
                    height: 40, px: 1.25, borderRadius: 3.5, cursor: 'pointer', textAlign: 'left',
                    font: 'inherit', fontFamily: "'Fredoka', sans-serif", fontWeight: 500, fontSize: 13.5,
                    border: `2.5px solid ${active ? INK : 'rgba(41,34,58,0.22)'}`,
                    backgroundColor: active ? CORAL : PAPER,
                    color: active ? PAPER : INK,
                    transition: 'transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
                    '&:hover': {
                      backgroundColor: active ? CORAL : TINT, borderColor: INK,
                      boxShadow: `2px 2px 0 ${INK}`, transform: 'translate(-1px, -1px)',
                    },
                  }}>
                  <Box sx={{
                    width: 28, height: 24, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Box sx={{
                      width: presetConfig.eyeCount === 2 ? 28 : 24, display: 'flex', alignItems: 'center',
                      aspectRatio: presetConfig.eyeCount === 2 ? String(pairSpan(presetConfig.gap)) : '1',
                    }}>
                      <StageEyes config={{ ...presetConfig, blinking: false }} lensPosition={[0, 0]} lensSpeed={0} />
                    </Box>
                  </Box>
                  {name}
                </Box>
              );
            })}
          </Box>
          <Stack spacing={1} sx={{ p: 1.25, borderTop: '2.5px dashed rgba(41,34,58,0.25)' }}>
            <Button fullWidth size='small' variant='contained' color='secondary' disableElevation onClick={surpriseMe}>
              Surprise me
            </Button>
            <Button fullWidth size='small' variant='contained' disableElevation
              onClick={() => replaceConfig(initialConfig)}
              sx={{ backgroundColor: PAPER, color: INK, '&:hover': { backgroundColor: TINT } }}>
              Reset all
            </Button>
          </Stack>
        </Box>

        {/* the canvas */}
        <Box sx={{
          position: 'relative', containerType: 'size', minWidth: 0, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pt: '62px', pb: '22px', px: { md: '92px', lg: '116px' },
          backgroundColor: CANVAS, backgroundImage: STAGE_DOTS, backgroundSize: '18px 18px',
        }}>
          <Stack direction='row' spacing={1.25} sx={{
            position: 'absolute', top: 14, left: 14, right: 14, zIndex: 3,
            justifyContent: 'center', flexWrap: 'wrap', rowGap: 1.25,
          }}>
            {eyeCountToggle(['1 eye', '2 eyes'])}
            {movementToggle}
            <Tooltip title={pairMode ? 'The part labels point at a single eye' : 'Name the parts of the eye on the canvas'}>
              <Box component='span'>
                <Button size='small' variant='contained' disableElevation disabled={pairMode}
                  aria-pressed={showLabels} onClick={() => setShowLabels((v) => !v)}
                  sx={{
                    borderRadius: 4, py: 0.5, px: 1.5,
                    backgroundColor: showLabels ? CORAL : PAPER,
                    color: showLabels ? PAPER : INK,
                    '&:hover': { backgroundColor: showLabels ? CORAL : TINT },
                  }}>
                  Part labels
                </Button>
              </Box>
            </Tooltip>
          </Stack>
          {stage}
        </Box>

        {/* the inspector */}
        <Box sx={{ borderLeft: `3px solid ${INK}`, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: PAPER }}>
          <Box role='group' aria-label='Jump to settings' sx={{
            display: 'flex', gap: '2px', px: 1, pt: 1.25,
            backgroundColor: TINT, borderBottom: `2.5px solid ${INK}`,
          }}>
            {TABS.map((entry) => {
              const selected = tab === entry.id;
              const first = sections.find((s) => s.tab === entry.id);
              return (
                <Box key={entry.id} component='button' type='button' aria-current={selected || undefined}
                  onClick={() => jumpTo(first.id, entry.id)}
                  sx={{
                    position: 'relative', bottom: '-2.5px', flex: '1 1 0', minWidth: 0,
                    font: 'inherit', fontFamily: "'Fredoka', sans-serif", fontWeight: 500, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6,
                    px: 0.25, py: '8px', cursor: 'pointer', whiteSpace: 'nowrap',
                    borderRadius: '12px 12px 0 0',
                    border: `2.5px solid ${selected ? INK : 'transparent'}`,
                    borderBottomColor: selected ? PAPER : 'transparent',
                    backgroundColor: selected ? PAPER : 'transparent',
                    color: selected ? INK : '#8B8199',
                    zIndex: selected ? 2 : 1,
                    transition: 'background-color 120ms ease, color 120ms ease',
                    '&:hover': selected ? null : { backgroundColor: 'rgba(255,253,248,0.72)', color: INK },
                  }}>
                  {entry.label}
                  {tabDot(entry.id) ? (
                    <Tooltip title='Changed from the default'>
                      <Box component='span' sx={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: selected ? CORAL : 'rgba(41,34,58,0.35)',
                      }} />
                    </Tooltip>
                  ) : null}
                </Box>
              );
            })}
          </Box>
          <Box ref={scrollerRef} onScroll={onInspectorScroll} sx={{
            position: 'relative', flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 2, pb: 3,
          }}>
            <DenseContext.Provider value={false}>
              {sections.map((section, index) => (
                <SettingsGroup key={section.id} title={section.title} hint={section.hint} first={index === 0}
                  hot={hotPart === section.part}
                  sectionRef={(el) => { sectionRefs.current[section.id] = el; }}
                  onEnter={() => setHotPart(section.part)} onLeave={() => setHotPart(null)}>
                  {section.body}
                </SettingsGroup>
              ))}
            </DenseContext.Provider>
          </Box>
        </Box>
      </Box>

      {/* the code drawer */}
      <Box sx={{ borderTop: `3px solid ${INK}`, backgroundColor: NIGHT, flexShrink: 0 }}>
        <Stack direction='row' sx={{
          alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.5,
          px: 1.75, pt: 1.25, borderBottom: '2.5px solid #17121F',
        }}>
          <Box role='tablist' aria-label='Generated code' sx={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
            {CODE_TABS.map((entry) => (
              <FolderTab key={entry.id} dark label={entry.label} selected={codeTab === entry.id}
                id={`code-tab-${entry.id}`} controls={`code-panel-${entry.id}`}
                sx={{ px: 2 }}
                onClick={() => { setCodeTab(entry.id); setDrawerOpen(true); }} />
            ))}
          </Box>
          <Stack direction='row' spacing={1} sx={{ alignItems: 'center', pb: 1.25 }}>
            <Typography component='span' sx={{
              fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: '#B7AEC6', whiteSpace: 'nowrap',
            }}>
              {propCount} props set
            </Typography>
            <CopyButton getText={() => shareUrl} label='Copy link' color='secondary'
              sx={{ borderColor: '#0B7C7C', boxShadow: 'none', '&:hover': { boxShadow: 'none', transform: 'none' } }} />
            <CopyButton getText={copyTextFor[codeTab]} label={copyLabel}
              sx={{ borderColor: '#C43F22', boxShadow: 'none', '&:hover': { boxShadow: 'none', transform: 'none' } }} />
            <Tooltip title={drawerOpen ? 'Hide the code' : 'Show the code'}>
              <Box component='button' type='button' aria-expanded={drawerOpen}
                aria-label={drawerOpen ? 'Hide the code' : 'Show the code'}
                onClick={() => setDrawerOpen((v) => !v)}
                sx={{
                  width: 28, height: 28, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 2.5, backgroundColor: '#4C4169', color: CREAM,
                  border: '2.5px solid #17121F', cursor: 'pointer',
                  transition: 'background-color 120ms ease',
                  '&:hover': { backgroundColor: '#5B4E7D' },
                }}>
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, transform: drawerOpen ? 'none' : 'rotate(180deg)' }} />
              </Box>
            </Tooltip>
          </Stack>
        </Stack>
        <Box sx={{
          height: drawerOpen ? 268 : 0, overflow: 'hidden', backgroundColor: INK,
          transition: 'height 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <Box sx={{ height: '100%', overflow: 'auto', p: 2, pb: 4 }}>{codePanel}</Box>
        </Box>
      </Box>
    </Paper>
  );

  // -------------------------------------------------------------------------
  // The phone: the eye takes whatever the sheet is not using
  // -------------------------------------------------------------------------

  const SHEET_CHIPS = [...TABS, { id: 'code', label: 'Code' }, { id: 'story', label: 'Story' }];
  const sheetHeights = ['104px', '46dvh', 'calc(100dvh - 210px)'];

  const mobileStudio = (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1.75, py: 1, flexShrink: 0 }}>
        <Typography variant='h1' sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
          cartoon-eyes<Box component='span' sx={{ color: CORAL }}>.</Box>
        </Typography>
        <Stack direction='row' spacing={0.75}>
          <Button size='small' variant='contained' color='secondary' disableElevation onClick={surpriseMe}>
            Surprise
          </Button>
          <CopyButton getText={() => codeText} label='Copy JSX' />
        </Stack>
      </Stack>

      <Box sx={{
        flex: 1, minHeight: 0, mx: 1.5, mb: 1.25, position: 'relative',
        border: `3px solid ${INK}`, borderRadius: 5, boxShadow: `4px 4px 0 ${INK}`, overflow: 'hidden',
        containerType: 'size',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pt: '52px', pb: '10px', px: '10px',
        backgroundColor: CANVAS, backgroundImage: STAGE_DOTS, backgroundSize: '18px 18px',
      }}>
        <Stack direction='row' spacing={0.75} sx={{
          position: 'absolute', top: 10, left: 10, right: 10, zIndex: 3, justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {movementToggle}
          {eyeCountToggle(['1', '2'])}
        </Stack>
        {stage}
      </Box>

      <Box sx={{
        flexShrink: 0, height: sheetHeights[sheetStep],
        backgroundColor: PAPER, borderTop: `3px solid ${INK}`, borderRadius: '24px 24px 0 0',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'height 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <Box component='button' type='button'
          aria-label={['Open the settings', 'Open the settings fully', 'Collapse the settings'][sheetStep]}
          onClick={() => setSheetStep((step) => (step + 1) % 3)}
          sx={{
            border: 0, background: 'none', p: 0, pt: 0.9, pb: 0.4, cursor: 'pointer',
            display: 'flex', justifyContent: 'center', flexShrink: 0,
          }}>
          <Box component='span' sx={{ width: 46, height: 5, borderRadius: 3, backgroundColor: 'rgba(41,34,58,0.35)' }} />
        </Box>
        <Box role='group' aria-label='Settings sections' sx={{
          display: 'flex', gap: 0.75, overflowX: 'auto', px: 1.75, pt: 0.5, pb: 1.25, flexShrink: 0,
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}>
          {SHEET_CHIPS.map((entry) => {
            const active = sheetSection === entry.id;
            return (
              <Box key={entry.id} component='button' type='button' aria-current={active || undefined}
                onClick={() => { setSheetSection(entry.id); setSheetStep((s) => (s === 0 ? 1 : s)); }}
                sx={{
                  flex: '0 0 auto', font: 'inherit', fontFamily: "'Fredoka', sans-serif", fontSize: 13,
                  px: 1.6, py: 0.6, borderRadius: 999, cursor: 'pointer',
                  border: `2.5px solid ${INK}`,
                  backgroundColor: active ? CORAL : PAPER, color: active ? PAPER : INK,
                }}>
                {entry.label}
              </Box>
            );
          })}
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', px: 2, pb: 3 }}>
          <DenseContext.Provider value>
            {sheetSection === 'story' ? <Box sx={{ pt: 1 }}>{story}</Box> : null}

            {sheetSection === 'code' ? (
              <Box sx={{ pt: 1 }}>
                <Box role='tablist' aria-label='Generated code' sx={{ display: 'flex', gap: 0.75, mb: 1.25, flexWrap: 'wrap' }}>
                  {CODE_TABS.map((entry) => (
                    <Box key={entry.id} component='button' type='button' role='tab'
                      id={`code-tab-${entry.id}`} aria-controls={`code-panel-${entry.id}`}
                      aria-selected={codeTab === entry.id} tabIndex={codeTab === entry.id ? 0 : -1}
                      onClick={() => setCodeTab(entry.id)}
                      sx={{
                        font: 'inherit', fontFamily: "'Fredoka', sans-serif", fontSize: 12.5,
                        px: 1.4, py: 0.5, borderRadius: 999, cursor: 'pointer',
                        border: `2.5px solid ${INK}`,
                        backgroundColor: codeTab === entry.id ? CORAL : PAPER,
                        color: codeTab === entry.id ? PAPER : INK,
                      }}>
                      {entry.label}
                    </Box>
                  ))}
                  <Box sx={{ flex: 1 }} />
                  <CopyButton getText={copyTextFor[codeTab]} label={copyLabel} />
                </Box>
                <Box sx={{ p: 1.75, borderRadius: 4, backgroundColor: INK, overflowX: 'auto' }}>
                  {codePanel}
                </Box>
              </Box>
            ) : null}

            {sections.filter((section) => section.tab === sheetSection).map((section, index) => (
              <SettingsGroup key={section.id} title={section.title} hint={section.hint} first={index === 0}
                hot={false} sectionRef={null} onEnter={undefined} onLeave={undefined}>
                {section.body}
              </SettingsGroup>
            ))}
          </DenseContext.Provider>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        body: {
          backgroundColor: CREAM,
          backgroundImage: DOTS,
          backgroundSize: '22px 22px',
          backgroundAttachment: 'fixed',
        },
        '@keyframes popIn': {
          from: { opacity: 0, transform: 'translateY(14px)' },
          to: { opacity: 1, transform: 'none' },
        },
        '.pop-in': { animation: 'popIn 500ms ease backwards' },
      }} />

      {desktop ? (
        <Box sx={{ maxWidth: 1440, mx: 'auto', px: 3, py: 2.5 }}>
          <Stack direction='row' className='pop-in' sx={{
            mb: 2, gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
          }}>
            <Stack direction='row' spacing={1.75} sx={{ alignItems: 'baseline' }}>
              <Typography variant='h1' sx={{ fontSize: '1.6rem', lineHeight: 1 }}>
                cartoon-eyes<Box component='span' sx={{ color: CORAL }}>.</Box>
              </Typography>
              <Typography color='text.secondary' sx={{ fontWeight: 600, fontSize: 13 }}>
                Design an eye, copy the React code.
              </Typography>
            </Stack>
            <Stack direction='row' spacing={1.25} sx={{ alignItems: 'center' }}>
              <Box sx={{
                px: 1.5, py: 0.6, backgroundColor: INK, color: CREAM, borderRadius: 3.5,
                fontFamily: "'Fira Code', monospace", fontSize: 12.5, whiteSpace: 'nowrap',
              }}>
                npm i cartoon-eyes
              </Box>
              <CopyButton getText={() => 'npm install cartoon-eyes'} />
              <Button size='small' variant='contained' disableElevation component={Link}
                href='https://github.com/tmrk/cartoon-eyes' target='_blank' rel='noopener'
                sx={{ backgroundColor: PAPER, color: INK, '&:hover': { backgroundColor: TINT } }}>
                GitHub
              </Button>
            </Stack>
          </Stack>

          <Box className='pop-in' sx={{ animationDelay: '80ms' }}>{desktopStudio}</Box>

          <Box component='section' className='pop-in' sx={{ mt: 6, mb: 4, animationDelay: '160ms' }}>
            {story}
          </Box>
        </Box>
      ) : mobileStudio}
    </ThemeProvider>
  );
}

export default App;
