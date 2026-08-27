import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Button, Container, CssBaseline, GlobalStyles, IconButton, Link, Paper,
  Slider, Stack, Switch, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
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

// the page's halftone dots; the sticky stage repeats them so it blends into the
// background as the settings scroll underneath it on a phone
const DOTS = 'radial-gradient(#E9DCC5 1.5px, transparent 1.5px)';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: CORAL },
    secondary: { main: TEAL },
    background: { default: CREAM, paper: PAPER },
    text: { primary: INK, secondary: '#6E6580' },
  },
  typography: {
    fontFamily: "'Nunito', sans-serif",
    h1: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600 },
    h2: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600 },
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
          boxShadow: `3px 3px 0 ${INK}`,
          '&:hover': { boxShadow: `4px 4px 0 ${INK}`, transform: 'translate(-1px, -1px)' },
          '&:active': { boxShadow: `1px 1px 0 ${INK}`, transform: 'translate(2px, 2px)' },
          transition: 'transform 120ms ease, box-shadow 120ms ease',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          border: `2.5px solid ${INK}`,
          backgroundColor: PAPER,
          width: 20,
          height: 20,
        },
        rail: { color: INK, opacity: 0.25, height: 6 },
        track: { height: 6, border: 'none' },
      },
    },
    // the colour fields carry the same ink outline as the buttons and cards
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: PAPER,
          '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2.5, borderColor: INK },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderWidth: 2.5, borderColor: INK },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2.5, borderColor: CORAL },
        },
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

// what the demo starts with
const initialConfig = {
  // demo-only: one Eye, or two of them through EyePair
  eyeCount: 1,
  // EyePair props, in play once there are two eyes
  gap: 20, eyeRotation: 0,
  // the two per-eye overrides the demo can show off: an odd iris colour, and a
  // right eye that keeps its own gaze while the pair looks around
  oddEye: false, rightIrisColor: '#F2A03D', oddGaze: false,
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
  // where the lens rests while the eye is still; the animated modes drive their
  // own position and leave this one untouched
  lensPosition: [0, 0],
  blinking: true, blinkSpeed: 80, blinkFrequency: 3000, blinkSqueeze: false,
  movement: 'wander', // demo-only: 'follow' | 'wander' | 'still'
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
    ...initialConfig,
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
    ...initialConfig,
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
    ...initialConfig,
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
    ...initialConfig,
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
    ...initialConfig,
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
    ...initialConfig,
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
    ...initialConfig,
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
    ...initialConfig,
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
    ...initialConfig,
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

// each preset's default display size (per eye), chosen so its sclera fits the
// fixed-height stage: taller scleras get a smaller box, keeping the drawn eye
// roughly the same visual size. A pair is sized so the two eyes and their gap
// fit the stage side by side
const presetDisplaySize = {
  Default: 680, Googly: 300, Owl: 260, Snake: 490, Zombie: 520, Cat: 520,
  Sleepy: 750, Surprised: 410, Alien: 390, Frog: 430,
};

const defaultEyeSize = presetDisplaySize.Default;

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
// snippet (hex colors travel without their '#') plus the demo-only `movement`,
// `eyes` count and display `size`. `movement` is always emitted so a share URL
// is never bare: a bare URL means the pristine demo (initialConfig), any config
// param means "component defaults + overrides"
function buildShareParams(config, eyeSize) {
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
  if (eyeSize !== defaultEyeSize) params.set('size', String(eyeSize));
  return params;
}

// inverse of buildShareParams: expand shorthand params over the component
// defaults; malformed values are ignored so hand-edited URLs degrade gracefully,
// as do parameters from older versions (`pairRotation`, which no longer exists).
// Returns null when the URL carries no recognised config at all.
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

// demo-only display size, kept outside the config object (and so outside
// parseShareParams); clamped to the display-size slider's range
function parseShareSize(search) {
  const value = Number(new URLSearchParams(search).get('size'));
  return Number.isFinite(value) && value > 0 ? Math.min(900, Math.max(140, value)) : null;
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

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

const ControlSlider = ({
  label, value, onChange, min = 0, max = 100, step = 1, unit = '',
  disabled = false, marks = false, origin = null,
}) => (
  <Box>
    <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Typography variant='body2' sx={{ fontWeight: 700, color: disabled ? 'text.disabled' : 'text.primary' }}>
        {label}
      </Typography>
      <Typography variant='body2'
        sx={{ fontFamily: "'Fira Code', monospace", color: disabled ? 'text.disabled' : 'text.secondary' }}>
        {value}{unit}
      </Typography>
    </Stack>
    <Slider size='small' value={value} min={min} max={max} step={step} disabled={disabled}
      marks={marks}
      onChange={(e, v) => onChange(v)} aria-label={label}
      sx={origin === null ? null : originTrackSx(value, min, max, origin)} />
  </Box>
);

// the gaze and the glint are both a point inside a box, so they get a box to put
// it in rather than two sliders to convert in your head: drag (or nudge with the
// arrow keys, ten at a time with shift) to set both axes at once. While a
// movement mode drives the eye the pad is read-only but still live, so the dot
// keeps showing where the eye is looking
const XYPad = ({ label, value, onChange, disabled = false, smooth = false, size = 156 }) => {
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
        width: '100%', maxWidth: size, aspectRatio: '1',
        borderRadius: 3, border: `2.5px solid ${INK}`, bgcolor: PAPER,
        boxShadow: `3px 3px 0 ${INK}`,
        backgroundImage: 'radial-gradient(rgba(41,34,58,0.14) 1.5px, transparent 1.5px)',
        backgroundSize: '13px 13px',
        backgroundPosition: 'center',
        touchAction: 'none', cursor: disabled ? 'default' : 'crosshair',
        opacity: disabled ? 0.6 : 1,
        '&:focus-visible': { outline: `3px solid ${CORAL}`, outlineOffset: 3 },
      }}>
      {/* the centre notch, so "straight ahead" is somewhere you can aim for */}
      <Box sx={{ position: 'absolute', left: 8, right: 8, top: '50%', borderTop: `1.5px dashed rgba(41,34,58,0.28)` }} />
      <Box sx={{ position: 'absolute', top: 8, bottom: 8, left: '50%', borderLeft: `1.5px dashed rgba(41,34,58,0.28)` }} />
      <Box sx={{
        position: 'absolute', width: 18, height: 18, borderRadius: '50%',
        bgcolor: CORAL, border: `2.5px solid ${INK}`,
        left: `${(x + 100) / 2}%`, top: `${(y + 100) / 2}%`,
        transform: 'translate(-50%, -50%)',
        transition: glide,
      }} />
    </Box>
  );
};

// a pad with its name and its two numbers above it, and room beside it for
// whatever the panel wants to say about it
const PadControl = ({ label, value, onChange, disabled = false, smooth = false, note = null }) => {
  const [x, y] = value.map(Math.round);
  return (
    <Box>
      <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
        <Typography variant='body2' sx={{ fontWeight: 700, color: disabled ? 'text.disabled' : 'text.primary' }}>
          {label}
        </Typography>
        <Typography variant='body2'
          sx={{ fontFamily: "'Fira Code', monospace", color: disabled ? 'text.disabled' : 'text.secondary' }}>
          [{x}, {y}]
        </Typography>
      </Stack>
      <Stack direction='row' spacing={2} sx={{ alignItems: 'flex-start' }}>
        <XYPad label={label} value={value} onChange={onChange} disabled={disabled} smooth={smooth} />
        {note ? (
          <Typography variant='caption' sx={{ color: 'text.secondary', flex: '1 1 0', minWidth: 0 }}>
            {note}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
};

const ColorControl = ({ label, value, onChange, sx, disabled = false, alpha = false }) => (
  <Box sx={sx}>
    <Typography variant='body2' gutterBottom
      sx={{ fontWeight: 700, color: disabled ? 'text.disabled' : 'text.primary' }}>{label}</Typography>
    {/* the field keeps whatever case was typed in its own state, so the uppercase
        shown here is CSS; the value handed back to the config is uppercased too.
        An alpha field reads and writes the 8-digit HEXA form, which the Eye
        splits into fill and fill-opacity */}
    <MuiColorInput format={alpha ? 'hex8' : 'hex'} isAlphaHidden={!alpha}
      size='small' value={value} disabled={disabled}
      onChange={(v) => onChange(upperHex(v))}
      sx={{
        width: '100%',
        '& input': { fontFamily: "'Fira Code', monospace", textTransform: 'uppercase' },
      }} />
  </Box>
);

const SwitchControl = ({ label, checked, onChange, disabled = false }) => (
  <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant='body2' sx={{ fontWeight: 700, color: disabled ? 'text.disabled' : 'text.primary' }}>
      {label}
    </Typography>
    {/* the label sits beside the switch rather than wrapping it, so the switch
        carries the name itself */}
    <Switch checked={checked} disabled={disabled} slotProps={{ input: { 'aria-label': label } }}
      onChange={(e) => onChange(e.target.checked)} />
  </Stack>
);

// one named block of settings inside a tab: a rule and a small caps title, so a
// panel reads as two or three short lists rather than one run of sliders
const ControlGroup = ({ title, children, note = null, first = false }) => (
  <Box component='section' sx={{ pt: first ? 0 : 2.5 }}>
    <Typography variant='overline' component='h3' sx={{
      display: 'block', mb: 1, fontSize: 12, color: 'text.secondary',
    }}>
      {title}
    </Typography>
    <Stack spacing={1.25}>{children}</Stack>
    {note ? (
      <Typography variant='caption' sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
        {note}
      </Typography>
    ) : null}
  </Box>
);

// the colour fields pair up wherever there is room for two
const ColorRow = ({ children }) => (
  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(136px, 1fr))' }}>
    {children}
  </Box>
);

const CopyButton = ({ getText, label = 'Copy', color = 'primary', variant = 'contained' }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Button size='small' variant={variant} disableElevation color={color}
      onClick={() => {
        navigator.clipboard.writeText(getText());
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}>
      {copied ? 'Copied!' : label}
    </Button>
  );
};

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

// the box the eyes are drawn in: square for one eye, as wide as the pair spans
// for two, and never wider than the stage, so a pair scales down to fit instead
// of running off the edges
const eyeBoxSx = (config, eyeSize, xsEyeBox) => {
  const span = config.eyeCount === 2 ? pairSpan(config.gap) : 1;
  return {
    flex: '0 0 auto',
    aspectRatio: String(span),
    width: {
      xs: `min(calc(${xsEyeBox} * ${span}), 100%)`,
      md: `min(${(eyeSize * span).toFixed(1)}px, 100%)`,
    },
  };
};

// the settings are split into tabs rather than stacked into one long column: the
// stage stays in sight, and each group is a screenful at most on any device
const TABS = [
  { id: 'shape', label: 'Shape' },
  { id: 'iris', label: 'Iris' },
  { id: 'shine', label: 'Shine' },
  { id: 'lids', label: 'Lids' },
  { id: 'motion', label: 'Motion' },
  { id: 'pair', label: 'Pair' },
];

const TabButton = ({ tab, active, onClick, badge }) => (
  <Box component='button' type='button' role='tab' id={`tab-${tab.id}`}
    aria-selected={active} aria-controls={`panel-${tab.id}`} tabIndex={active ? 0 : -1}
    onClick={onClick}
    sx={{
      font: 'inherit', fontFamily: "'Fredoka', sans-serif", fontWeight: 500, fontSize: 15,
      display: 'inline-flex', alignItems: 'center', gap: 0.75,
      px: 1.75, py: 0.6, cursor: 'pointer', borderRadius: 999,
      border: `2.5px solid ${INK}`,
      backgroundColor: active ? CORAL : PAPER,
      color: active ? PAPER : INK,
      boxShadow: active ? `2px 2px 0 ${INK}` : 'none',
      transition: 'background-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
      '&:hover': { backgroundColor: active ? CORAL : TINT },
      '&:active': { transform: 'translate(1px, 1px)' },
    }}>
    {tab.label}
    {badge ? (
      <Box component='span' sx={{
        width: 7, height: 7, borderRadius: '50%',
        backgroundColor: active ? PAPER : TEAL,
      }} />
    ) : null}
  </Box>
);

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const [config, setConfig] = useState(() => parseShareParams(window.location.search) ?? initialConfig);
  const set = (key) => (value) => setConfig((c) => ({ ...c, [key]: value }));
  const [eyeSize, setEyeSize] = useState( // demo-only display size in px
    () => parseShareSize(window.location.search) ?? defaultEyeSize);
  // the stage crops tall eyes by default; expanding it reveals the whole drawing area
  const [stageExpanded, setStageExpanded] = useState(false);
  const [tab, setTab] = useState('shape');
  const pairMode = config.eyeCount === 2;

  // shareable URL for the current config; the address bar follows it (debounced)
  // once the user changes anything. The pristine-load values are compared by
  // ref/value (not a first-run flag) so the loaded URL stays untouched even
  // under StrictMode's double-invoked effects; after the first real change the
  // sentinel is cleared and every change syncs.
  const shareUrl = useMemo(() => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}?${buildShareParams(config, eyeSize)}`;
  }, [config, eyeSize]);
  const loadedState = useRef({ config, eyeSize });
  useEffect(() => {
    const loaded = loadedState.current;
    if (loaded && config === loaded.config && eyeSize === loaded.eyeSize) return;
    loadedState.current = null;
    const timeoutId = setTimeout(() => window.history.replaceState(null, '', shareUrl), 300);
    return () => clearTimeout(timeoutId);
  }, [config, eyeSize, shareUrl]);

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
  const eyesRef = useRef(null);
  const [followLens, setFollowLens] = useState([0, 0]);
  useEffect(() => {
    if (config.movement !== 'follow') return;
    const target = { x: 0, y: 0 };
    const onMove = (e) => {
      const box = eyesRef.current?.getBoundingClientRect();
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
  const eyelinerOn = config.upperEyelinerSize > 0 || config.lowerEyelinerSize > 0;

  // on mobile the eye box scales with the viewport (52vw at the 680px default) so
  // the stage keeps the same proportions for every preset size
  const xsEyeBox = `min(${eyeSize}px, ${(eyeSize * 52 / 680).toFixed(1)}vw)`;

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

  const activePreset = Object.keys(presets).find(
    (name) => JSON.stringify(presets[name]) === JSON.stringify(config)
  );

  // a dot on a tab marks a feature that is switched on inside it, so the
  // optional parts of the API are visible without opening every panel
  const badges = {
    shape: config.eyeOutlineThickness > 0,
    shine: catchlightOn,
    lids: eyelinerOn,
    pair: pairMode,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        body: {
          backgroundColor: CREAM,
          backgroundImage: DOTS,
          backgroundSize: '22px 22px',
          // fixed, so the sticky stage's own copy of the pattern lines up with
          // the page's while everything scrolls beneath it
          backgroundAttachment: 'fixed',
        },
        '@keyframes popIn': {
          from: { opacity: 0, transform: 'translateY(14px)' },
          to: { opacity: 1, transform: 'none' },
        },
        '.pop-in': { animation: 'popIn 500ms ease backwards' },
      }} />
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 5 } }}>

        {/* header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
          className='pop-in'
          sx={{ mb: { xs: 2.5, md: 4 }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box>
            <Typography variant='h1' sx={{ fontSize: { xs: '2.2rem', md: '3rem' }, lineHeight: 1.1 }}>
              cartoon-eyes
              <Box component='span' sx={{ color: CORAL }}>.</Box>
            </Typography>
            <Typography color='text.secondary' sx={{ mt: 0.5, fontWeight: 600 }}>
              A tiny React component for expressive, blinking SVG eyes. Set them to Follow and they'll watch your cursor.
            </Typography>
          </Box>
          <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box sx={{
              px: 1.5, py: 0.75, bgcolor: INK, color: CREAM, borderRadius: 2,
              fontFamily: "'Fira Code', monospace", fontSize: 14, whiteSpace: 'nowrap',
            }}>
              npm i cartoon-eyes
            </Box>
            <CopyButton getText={() => 'npm install cartoon-eyes'} />
            <Button variant='outlined' color='inherit' size='small' component={Link}
              href='https://github.com/tmrk/cartoon-eyes' target='_blank' rel='noopener'>
              GitHub
            </Button>
          </Stack>
        </Stack>

        {/* the workspace: the eye on one side, the settings on the other, so
            nothing has to scroll out of sight to be changed. On a phone the two
            stack and the stage pins itself to the top of the screen instead */}
        <Box sx={{
          display: { xs: 'block', md: 'grid' },
          gridTemplateColumns: { md: 'minmax(0, 1.05fr) minmax(0, 1fr)' },
          alignItems: 'start', columnGap: 3,
        }}>

          {/* left: the stage, what it is showing, and the presets. On a phone the
              column dissolves (display: contents) so the pinned stage is a child
              of the workspace itself and stays put while the settings below it
              scroll; from md up it is a real column the stage can stick inside */}
          <Box sx={{ display: { xs: 'contents', md: 'block' }, alignSelf: 'stretch' }}>
            <Box sx={{
              position: 'sticky', top: { xs: 0, md: 16 }, zIndex: 3,
              // on a phone the stage pins to the top of the viewport as a band
              // that spans the whole width, carrying the page's own dots so the
              // settings slide out of sight cleanly underneath it
              mx: { xs: -2, sm: -3, md: 0 },
              px: { xs: 2, sm: 3, md: 0 },
              py: { xs: 1.5, md: 0 },
              backgroundColor: { xs: CREAM, md: 'transparent' },
              backgroundImage: { xs: DOTS, md: 'none' },
              backgroundSize: '22px 22px',
              backgroundAttachment: 'fixed',
            }}>
              <Paper className='pop-in' sx={{
                position: 'relative',
                p: 0, overflow: 'hidden', bgcolor: '#FFE8CF',
                backgroundImage: 'radial-gradient(rgba(41,34,58,0.12) 2px, transparent 2px)',
                backgroundSize: '18px 18px',
              }}>
                <Tooltip title={stageExpanded ? 'Shrink the stage' : 'Expand the stage'} placement='left'>
                  <IconButton size='small' aria-pressed={stageExpanded}
                    aria-label={stageExpanded ? 'Shrink the stage' : 'Expand the stage'}
                    onClick={() => setStageExpanded((v) => !v)}
                    sx={{
                      position: 'absolute', top: 12, right: 12, zIndex: 1,
                      bgcolor: PAPER, color: INK, borderRadius: 2,
                      border: `2.5px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`,
                      transition: 'transform 120ms ease, box-shadow 120ms ease',
                      '&:hover': {
                        bgcolor: TINT, boxShadow: `4px 4px 0 ${INK}`,
                        transform: 'translate(-1px, -1px)',
                      },
                      '&:active': { boxShadow: `1px 1px 0 ${INK}`, transform: 'translate(2px, 2px)' },
                    }}>
                    {stageExpanded ? <FullscreenExitIcon fontSize='small' /> : <FullscreenIcon fontSize='small' />}
                  </IconButton>
                </Tooltip>
                <Box ref={eyesRef} sx={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  // collapsed: a fixed height tall enough for the default-size eye,
                  // with larger sizes bleeding past the edges (cropped by overflow
                  // hidden). expanded: the whole eye box, plus breathing room, and
                  // never so tall that the column stops fitting the screen it is
                  // pinned to
                  height: stageExpanded
                    ? {
                      xs: `min(max(34vw, calc(${xsEyeBox} + 24px)), 42vh)`,
                      md: `min(${Math.max(360, eyeSize + 72)}px, calc(100vh - 260px))`,
                    }
                    : { xs: 'min(34vw, 190px)', md: 360 },
                  transition: 'height 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                }}>
                  <Box sx={eyeBoxSx(config, eyeSize, xsEyeBox)}>
                    <StageEyes config={config} lensPosition={lensPosition}
                      // in follow mode the rAF loop already eases, so the CSS
                      // transition would only lag behind it
                      lensSpeed={config.movement === 'follow' ? 0 : 500} />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* what the stage is showing: one eye or two, how they move, how big
                they are drawn. Everything else is a property of the eye itself
                and lives in the settings panel */}
            <Paper className='pop-in' sx={{ mt: 2, p: 2, animationDelay: '80ms' }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <ToggleButtonGroup exclusive fullWidth size='small' value={config.eyeCount}
                    aria-label='How many eyes'
                    onChange={(e, v) => v && set('eyeCount')(v)}>
                    <ToggleButton value={1}>One eye</ToggleButton>
                    <ToggleButton value={2}>A pair</ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup exclusive fullWidth size='small' value={config.movement}
                    aria-label='Movement'
                    onChange={(e, v) => v && set('movement')(v)}>
                    <ToggleButton value='wander'>Wander</ToggleButton>
                    <ToggleButton value='follow'>Follow</ToggleButton>
                    <ToggleButton value='still'>Still</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
                <ControlSlider label='Display size' value={eyeSize} onChange={setEyeSize}
                  min={140} max={900} step={10} unit=' px' />
              </Stack>
            </Paper>

            {/* presets: a rail that wraps on a wide screen and scrolls sideways
                on a narrow one, so it never pushes the settings off the page */}
            <Box className='pop-in' sx={{ mt: 2.5, mb: { xs: 2.5, md: 0 }, animationDelay: '120ms' }}>
              <Typography variant='overline' component='h2'
                sx={{ display: 'block', mb: 1, fontSize: 12, color: 'text.secondary' }}>
                Presets
              </Typography>
              <Box sx={{
                display: 'flex', gap: 1.25,
                flexWrap: { xs: 'nowrap', md: 'wrap' },
                overflowX: { xs: 'auto', md: 'visible' },
                // the offset shadows need room inside the scroller not to be clipped
                p: 0.5, m: -0.5,
                scrollSnapType: { xs: 'x proximity', md: 'none' },
              }}>
                {Object.entries(presets).map(([name, presetConfig]) => (
                  <Button key={name} variant='contained' disableElevation size='small'
                    onClick={() => { setConfig(presetConfig); setEyeSize(presetDisplaySize[name]); }}
                    sx={{
                      flex: '0 0 auto', scrollSnapAlign: 'start',
                      bgcolor: activePreset === name ? CORAL : PAPER,
                      color: activePreset === name ? PAPER : INK,
                      '&:hover': { bgcolor: activePreset === name ? CORAL : TINT },
                      display: 'flex', gap: 0.75, alignItems: 'center', pl: 1, pr: 1.5, py: 0.75,
                    }}>
                    <Box sx={{
                      width: 26, display: 'flex', alignItems: 'center', flexShrink: 0,
                      aspectRatio: presetConfig.eyeCount === 2 ? String(pairSpan(presetConfig.gap)) : '1',
                    }}>
                      <StageEyes config={{ ...presetConfig, blinking: false, movement: 'still' }}
                        lensPosition={[0, 0]} lensSpeed={0} />
                    </Box>
                    {name}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>

          {/* right: the settings, one group at a time */}
          <Paper className='pop-in' sx={{ overflow: 'hidden', animationDelay: '160ms' }}>
            <Box role='tablist' aria-label='Eye settings' sx={{
              display: 'flex', flexWrap: 'wrap', gap: 1, p: 1.5,
              bgcolor: TINT, borderBottom: `3px solid ${INK}`,
            }}>
              {TABS.map((entry) => (
                <TabButton key={entry.id} tab={entry} active={tab === entry.id}
                  badge={badges[entry.id]} onClick={() => setTab(entry.id)} />
              ))}
            </Box>

            <Box role='tabpanel' id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}
              sx={{ p: 2.5, minHeight: { md: 430 } }}>

              {tab === 'shape' && (
                <>
                  <ControlGroup title='Sclera' first>
                    <ControlSlider label='Width' value={config.scleraWidth} onChange={set('scleraWidth')} unit='%' />
                    <ControlSlider label='Height' value={config.scleraHeight} onChange={set('scleraHeight')} unit='%' />
                    <ColorControl label='Colour' value={config.scleraColor} onChange={set('scleraColor')} />
                  </ControlGroup>
                  <ControlGroup title='Tilt'
                    note='The whole eye turns, lids and all. Only the catchlight stays put, the way a reflection would.'>
                    <ControlSlider label='Rotation' value={config.rotation} onChange={set('rotation')}
                      min={-180} max={180} unit='°' origin={0}
                      marks={[-180, -90, 0, 90, 180].map((value) => ({ value }))} />
                  </ControlGroup>
                  <ControlGroup title='Outline'
                    note='Taken out of the sclera rather than added around it, so the eye never outgrows its box.'>
                    <ControlSlider label='Thickness' value={config.eyeOutlineThickness}
                      onChange={set('eyeOutlineThickness')} unit='%' />
                    <ColorControl label='Colour' value={config.eyeOutlineColor} onChange={set('eyeOutlineColor')}
                      disabled={config.eyeOutlineThickness === 0} />
                  </ControlGroup>
                </>
              )}

              {tab === 'iris' && (
                <>
                  <ControlGroup title='Iris' first>
                    <ControlSlider label='Width' value={config.irisWidth} onChange={set('irisWidth')} unit='%' />
                    <ControlSlider label='Height' value={config.irisHeight} onChange={set('irisHeight')} unit='%' />
                    <ColorControl label='Colour' value={config.irisColor} onChange={set('irisColor')} />
                  </ControlGroup>
                  <ControlGroup title='Limbus'
                    note='The darker rim, taken out of the outer edge of the iris: the iris keeps its size and the pupil stays put.'>
                    <ControlSlider label='Thickness' value={config.limbusThickness}
                      onChange={set('limbusThickness')} unit='%' />
                    <ColorControl label='Colour' value={config.limbusColor} onChange={set('limbusColor')}
                      disabled={config.limbusThickness === 0} />
                  </ControlGroup>
                  <ControlGroup title='Pupil'
                    note='A narrow width with a tall height gives the slit of a cat or a snake.'>
                    <ControlSlider label='Width' value={config.pupilWidth} onChange={set('pupilWidth')} unit='%' />
                    <ControlSlider label='Height' value={config.pupilHeight} onChange={set('pupilHeight')} unit='%' />
                    <ColorControl label='Colour' value={config.pupilColor} onChange={set('pupilColor')} />
                  </ControlGroup>
                </>
              )}

              {tab === 'shine' && (
                <>
                  <ControlGroup title='Catchlight' first
                    note='Sized against the whole iris, limbus included, and drawn over the pupil as well, so it can cross the edge of either.'>
                    <ControlSlider label='Width' value={config.catchlightWidth}
                      onChange={set('catchlightWidth')} unit='%' />
                    <ControlSlider label='Height' value={config.catchlightHeight}
                      onChange={set('catchlightHeight')} unit='%' />
                    {/* a glint is usually a touch transparent, so this one field
                        carries an alpha channel */}
                    <ColorControl label='Colour' value={config.catchlightColor} alpha
                      onChange={set('catchlightColor')} disabled={!catchlightOn} />
                  </ControlGroup>
                  <ControlGroup title='Position'>
                    <PadControl label='Catchlight position' value={config.catchlightPosition}
                      onChange={set('catchlightPosition')} disabled={!catchlightOn}
                      note={"The glint travels with the eye's gaze but keeps to the screen's own axes: tilt the eye on the Shape tab and watch it hold its place, the way a reflection of a fixed light does."} />
                  </ControlGroup>
                </>
              )}

              {tab === 'lids' && (
                <>
                  <ControlGroup title='Eyelids' first>
                    <ControlSlider label='Upper' value={config.upperLidSize} onChange={set('upperLidSize')} unit='%' />
                    <ControlSlider label='Lower' value={config.lowerLidSize} onChange={set('lowerLidSize')} unit='%' />
                    <ColorRow>
                      <ColorControl label='Upper colour' value={config.upperLidColor}
                        onChange={set('upperLidColor')} />
                      <ColorControl label='Lower colour' value={config.lowerLidColor}
                        onChange={set('lowerLidColor')} />
                    </ColorRow>
                  </ControlGroup>
                  <ControlGroup title='Eyeliner'
                    note='The liner belongs to the lid margins, so it rides up and down with every blink.'>
                    <ControlSlider label='Upper' value={config.upperEyelinerSize}
                      onChange={set('upperEyelinerSize')} unit='%' />
                    <ControlSlider label='Lower' value={config.lowerEyelinerSize}
                      onChange={set('lowerEyelinerSize')} unit='%' />
                    <ColorRow>
                      <ColorControl label='Upper colour' value={config.upperEyelinerColor}
                        onChange={set('upperEyelinerColor')} disabled={config.upperEyelinerSize === 0} />
                      <ColorControl label='Lower colour' value={config.lowerEyelinerColor}
                        onChange={set('lowerEyelinerColor')} disabled={config.lowerEyelinerSize === 0} />
                    </ColorRow>
                  </ControlGroup>
                </>
              )}

              {tab === 'motion' && (
                <>
                  <ControlGroup title='Gaze' first
                    note={pairMode ? 'A pair shares one gaze: it is not mirrored, so a pair looking right looks right.' : null}>
                    <PadControl label='Eye position' value={lensPosition} onChange={set('lensPosition')}
                      disabled={!stillEye} smooth={config.movement === 'wander'}
                      note={stillEye
                        ? 'Drag to aim the eye, or nudge it with the arrow keys. This is lensPosition: -100 to 100 on each axis.'
                        : `The eye is ${config.movement === 'wander' ? 'wandering on its own' : 'following your cursor'}, so the pad only reports where it is looking. Switch to Still above to aim it by hand.`} />
                  </ControlGroup>
                  <ControlGroup title='Blinking'
                    note={pairMode ? 'A pair blinks on one clock, so both lids come down together.' : null}>
                    <SwitchControl label='Blinking' checked={config.blinking} onChange={set('blinking')} />
                    <SwitchControl label='Blink squeeze' checked={config.blinkSqueeze}
                      onChange={set('blinkSqueeze')} disabled={!config.blinking} />
                    <ControlSlider label='Blink speed' value={config.blinkSpeed} onChange={set('blinkSpeed')}
                      min={30} max={400} step={10} unit=' ms' disabled={!config.blinking} />
                    <ControlSlider label='Blink every' value={config.blinkFrequency}
                      onChange={set('blinkFrequency')}
                      min={500} max={8000} step={100} unit=' ms' disabled={!config.blinking} />
                  </ControlGroup>
                </>
              )}

              {tab === 'pair' && (pairMode ? (
                <>
                  <ControlGroup title='Layout' first
                    note='The gap is a share of one eye, so the pair keeps its proportions at any size. A positive tilt splays the two outwards.'>
                    <ControlSlider label='Gap' value={config.gap} onChange={set('gap')} unit='%' />
                    <ControlSlider label='Outward tilt' value={config.eyeRotation}
                      onChange={set('eyeRotation')} min={-60} max={60} unit='°' origin={0}
                      marks={[{ value: 0 }]} />
                  </ControlGroup>
                  <ControlGroup title='Right eye only'
                    note={"leftEye and rightEye override any shared prop for one eye. Naming lensPosition there takes that eye off the pair's shared gaze: it holds its own look while the other one wanders."}>
                    <SwitchControl label='Odd right eye' checked={config.oddEye} onChange={set('oddEye')} />
                    <ColorControl label='Right iris' value={config.rightIrisColor}
                      onChange={set('rightIrisColor')} disabled={!config.oddEye} />
                    <SwitchControl label='Right eye looks away' checked={config.oddGaze}
                      onChange={set('oddGaze')} />
                  </ControlGroup>
                </>
              ) : (
                <ControlGroup title='Two eyes' first>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    <Box component='code' sx={{ fontFamily: "'Fira Code', monospace" }}>EyePair</Box>{' '}
                    draws two eyes as one component: they share a gaze, blink on one clock and
                    splay outwards together, and either one can be overridden on its own.
                  </Typography>
                  <Box>
                    <Button variant='contained' disableElevation onClick={() => set('eyeCount')(2)}>
                      Show a pair
                    </Button>
                  </Box>
                </ControlGroup>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* generated code: what the stage above is, as something to paste */}
        <Paper className='pop-in' sx={{
          mt: { xs: 2.5, md: 3 }, p: 2.5, bgcolor: INK, color: CREAM, animationDelay: '200ms',
        }}>
          <Stack direction='row' sx={{
            mb: 1.5, gap: 1, justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap',
          }}>
            <Typography variant='h6' sx={{ color: CREAM }}>Your eye, as code</Typography>
            <Stack direction='row' spacing={1}>
              <CopyButton getText={() => shareUrl} label='Copy link' color='secondary' />
              <CopyButton getText={() => codeText} label='Copy JSX' />
            </Stack>
          </Stack>
          <Box component='pre' sx={{
            m: 0, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)',
            fontFamily: "'Fira Code', monospace", fontSize: 13.5, lineHeight: 1.7,
            overflowX: 'auto',
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
                      <Box component='span' sx={{
                        color: p.value.startsWith("'") ? '#FFD166' : '#B5E48C',
                      }}>{p.value}</Box>
                    </>
                  )}
                  {'\n'}
                </React.Fragment>
              ))}
              <Box component='span' sx={{ color: '#7FD8D8' }}>{'/>'}</Box>
            </code>
          </Box>
        </Paper>

        {/* about */}
        <Box component='section' className='pop-in' sx={{ mt: 6, animationDelay: '240ms' }}>
          <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ width: 40, height: 40, flexShrink: 0 }}>
              <Eye width='100%' height='100%' scleraWidth={92} scleraHeight={72}
                irisSize={72} irisColor={CORAL} pupilSize={45}
                lidSize={12} lidColor={INK} blinking blinkFrequency={2600} />
            </Box>
            <Typography variant='h2' sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' } }}>
              The story behind these eyes
            </Typography>
          </Stack>
          <Box sx={{
            display: 'grid', gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '5fr 4fr' },
          }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant='h6' sx={{ mb: 1 }}>
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
            <Paper sx={{ p: 3, bgcolor: '#FFE8CF' }}>
              <Typography variant='h6' sx={{ mb: 1 }}>Nothing is hardcoded</Typography>
              <Typography variant='body2' sx={{ mb: 1.5 }}>
                The whole eye is one 100% dynamic piece of SVG, and every measurement is
                relative: each shape is sized as a percentage of its parent.
              </Typography>
              <Stack direction='row' spacing={0.75} useFlexGap
                sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1.5, rowGap: 0.75 }}>
                {['pupil', 'iris', 'sclera', 'drawing area'].map((label, i) => (
                  <React.Fragment key={label}>
                    {i > 0 && (
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        % of
                      </Typography>
                    )}
                    <Box sx={{
                      px: 1.25, py: 0.25, border: `2px solid ${INK}`, borderRadius: 2,
                      bgcolor: PAPER, fontFamily: "'Fredoka', sans-serif", fontSize: 14,
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
        </Box>

        {/* footer */}
        <Stack direction='row' className='pop-in' sx={{ mt: 4, mb: 2, justifyContent: 'space-between' }}>
          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
            MIT © <Link href='https://github.com/tmrk' target='_blank' rel='noopener' color='inherit'>Tamas Marki</Link>
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
            <Link href='https://www.npmjs.com/package/cartoon-eyes' target='_blank' rel='noopener' color='inherit'>
              cartoon-eyes on npm
            </Link>
          </Typography>
        </Stack>

      </Container>
    </ThemeProvider>
  );
}

export default App;
