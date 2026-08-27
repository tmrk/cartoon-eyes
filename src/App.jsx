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
import { Eye } from './components/src/CartoonEyes';

// ---------------------------------------------------------------------------
// Theme: warm "sticker sheet" look: thick ink outlines, offset shadows,
// halftone dots, rounded toy-like type.
// ---------------------------------------------------------------------------

const INK = '#29223A';
const CREAM = '#FBF3E4';
const PAPER = '#FFFDF8';
const CORAL = '#FF5D3A';
const TEAL = '#0E9E9E';

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
  scleraWidth: 70, scleraHeight: 50, scleraColor: '#FFFFFF',
  irisWidth: 80, irisHeight: 80, irisColor: '#3E7BFA',
  pupilWidth: 30, pupilHeight: 30, pupilColor: '#000000',
  upperLidSize: 20, upperLidColor: '#AAAAAA',
  lowerLidSize: 20, lowerLidColor: '#AAAAAA',
  rotation: 0,
  // where the lens rests while the eye is still; the animated modes drive their
  // own position and leave this one untouched
  lensPosition: [0, 0],
  blinking: true, blinkSpeed: 80, blinkFrequency: 3000, blinkSqueeze: false,
  movement: 'wander', // demo-only: 'follow' | 'wander' | 'still'
};

// hex colours are stored (and shown) uppercase wherever they surface
const upperHex = (color) => (typeof color === 'string' ? color.toUpperCase() : color);

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const presets = {
  Default: initialConfig,
  Snake: {
    ...initialConfig,
    scleraWidth: 80, scleraHeight: 70, scleraColor: '#AAFFAA',
    irisWidth: 100, irisHeight: 100, irisColor: '#FF7700',
    pupilWidth: 10, pupilHeight: 80, pupilColor: '#000000',
    upperLidSize: 0, lowerLidSize: 0,
    blinking: false,
  },
  Zombie: {
    ...initialConfig,
    scleraWidth: 80, scleraHeight: 65, scleraColor: '#FFFFDD',
    irisWidth: 70, irisHeight: 65, irisColor: '#559933',
    pupilWidth: 50, pupilHeight: 50, pupilColor: '#330000',
    upperLidSize: 35, upperLidColor: '#557755',
    lowerLidSize: 20, lowerLidColor: '#557755',
    blinkSpeed: 250, blinkFrequency: 5000,
  },
  Cat: {
    ...initialConfig,
    scleraWidth: 72, scleraHeight: 66, scleraColor: '#F6EDD2',
    irisWidth: 95, irisHeight: 95, irisColor: '#E8A33D',
    pupilWidth: 14, pupilHeight: 90, pupilColor: '#1C1C1C',
    upperLidSize: 12, upperLidColor: '#8A6D3B',
    lowerLidSize: 8, lowerLidColor: '#8A6D3B',
    blinkSpeed: 200, blinkFrequency: 4500, // the languid cat blink
  },
  Sleepy: {
    ...initialConfig,
    scleraWidth: 75, scleraHeight: 45, scleraColor: '#FFF5F0',
    irisWidth: 70, irisHeight: 70, irisColor: '#7A6EA8',
    pupilWidth: 40, pupilHeight: 40, pupilColor: '#2A2438',
    upperLidSize: 55, upperLidColor: '#D9B8A6',
    lowerLidSize: 25, lowerLidColor: '#D9B8A6',
    blinkSpeed: 300, blinkFrequency: 2200,
    movement: 'still', // too drowsy to look around
  },
  Surprised: {
    ...initialConfig,
    scleraWidth: 82, scleraHeight: 82, scleraColor: '#FFFFFF',
    irisWidth: 45, irisHeight: 45, irisColor: '#16A34A',
    pupilWidth: 55, pupilHeight: 55, pupilColor: '#000000',
    upperLidSize: 0, lowerLidSize: 0,
    blinking: false,
  },
  Alien: {
    ...initialConfig,
    scleraWidth: 62, scleraHeight: 88, scleraColor: '#0D0D15',
    // just light enough against the near-black sclera that the wander reads
    irisWidth: 85, irisHeight: 85, irisColor: '#252542',
    pupilWidth: 55, pupilHeight: 55, pupilColor: '#000000',
    upperLidSize: 0, upperLidColor: '#0D0D15',
    lowerLidSize: 0, lowerLidColor: '#0D0D15',
    blinkSpeed: 160, blinkFrequency: 6000,
  },
  Frog: {
    ...initialConfig,
    scleraWidth: 80, scleraHeight: 80, scleraColor: '#F7C948',
    irisWidth: 70, irisHeight: 70, irisColor: '#B45309',
    pupilWidth: 85, pupilHeight: 30, pupilColor: '#101010',
    upperLidSize: 10, upperLidColor: '#3F6212',
    lowerLidSize: 10, lowerLidColor: '#3F6212',
    blinkFrequency: 4200,
  },
};

// each preset's default display size, chosen so its sclera fits the fixed-height
// stage: taller scleras get a smaller box, keeping the drawn eye roughly the same
// visual size (sclera height ≈ 340px on desktop)
const presetDisplaySize = {
  Default: 680, Snake: 490, Zombie: 520, Cat: 520,
  Sleepy: 750, Surprised: 410, Alien: 390, Frog: 430,
};

const defaultEyeSize = presetDisplaySize.Default;

// the Eye component's own defaults, used to emit only non-default props
const eyeDefaults = {
  scleraWidth: 100, scleraHeight: 100, scleraColor: '#FFFFFF',
  irisSize: 60, irisColor: '#666666',
  pupilSize: 50, pupilColor: '#000000',
  lidSize: 20, lidColor: '#AAAAAA',
  rotation: 0,
  blinkSpeed: 80, blinkFrequency: 3000,
};

// diff a demo config against the Eye component's own defaults, collapsing
// symmetric width/height (and lid) pairs into their shorthand props; raw values
// (number | [x, y] | color string | true), shared by the JSX snippet and the
// share URL. `lensPosition` defaults to the config's resting position, but the
// snippet passes the live one so the code follows a wandering eye
function diffEyeProps(config, lensPosition = config.lensPosition) {
  const props = [];
  const add = (name, value) => props.push({ name, value });

  if (config.scleraWidth !== eyeDefaults.scleraWidth) add('scleraWidth', config.scleraWidth);
  if (config.scleraHeight !== eyeDefaults.scleraHeight) add('scleraHeight', config.scleraHeight);
  if (config.scleraColor !== eyeDefaults.scleraColor) add('scleraColor', config.scleraColor);

  if (config.irisWidth === config.irisHeight) {
    if (config.irisWidth !== eyeDefaults.irisSize) add('irisSize', config.irisWidth);
  } else {
    add('irisWidth', config.irisWidth);
    add('irisHeight', config.irisHeight);
  }
  if (config.irisColor !== eyeDefaults.irisColor) add('irisColor', config.irisColor);

  if (config.pupilWidth === config.pupilHeight) {
    if (config.pupilWidth !== eyeDefaults.pupilSize) add('pupilSize', config.pupilWidth);
  } else {
    add('pupilWidth', config.pupilWidth);
    add('pupilHeight', config.pupilHeight);
  }
  if (config.pupilColor !== eyeDefaults.pupilColor) add('pupilColor', config.pupilColor);

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

  if (config.rotation !== eyeDefaults.rotation) add('rotation', config.rotation);

  const [lensX, lensY] = lensPosition.map(Math.round);
  if (lensX !== 0 || lensY !== 0) add('lensPosition', [lensX, lensY]);

  if (config.blinking) {
    add('blinking', true);
    if (config.blinkSpeed !== eyeDefaults.blinkSpeed) add('blinkSpeed', config.blinkSpeed);
    if (config.blinkFrequency !== eyeDefaults.blinkFrequency) add('blinkFrequency', config.blinkFrequency);
    if (config.blinkSqueeze) add('blinkSqueeze', true);
  }
  return props;
}

function buildCodeProps(config, lensPosition) {
  const props = diffEyeProps(config, lensPosition).map(({ name, value }) => ({
    name,
    value: value === true ? null // bare boolean prop
      : Array.isArray(value) ? `{[${value.join(', ')}]}`
        : typeof value === 'number' ? `{${value}}`
          : `'${upperHex(value)}'`,
  }));
  if (config.movement === 'wander') props.push({ name: 'lensMovement', value: null });
  return props;
}

// the query string carries the same collapsed, non-default props as the JSX
// snippet (hex colors travel without their '#') plus the demo-only `movement`
// and display `size`. `movement` is always emitted so a share URL is never
// bare: a bare URL means the pristine demo (initialConfig), any config param
// means "Eye defaults + overrides"
function buildShareParams(config, eyeSize) {
  const params = new URLSearchParams();
  for (const { name, value } of diffEyeProps(config)) {
    params.set(name, value === true ? '1'
      : Array.isArray(value) ? value.join(',')
        : typeof value === 'string' ? value.replace(/^#/, '')
          : String(value));
  }
  params.set('movement', config.movement);
  if (eyeSize !== defaultEyeSize) params.set('size', String(eyeSize));
  return params;
}

// inverse of buildShareParams: expand shorthand params over the Eye defaults;
// malformed values are ignored so hand-edited URLs degrade gracefully. Returns
// null when the URL carries no recognised config at all.
function parseShareParams(search) {
  const params = new URLSearchParams(search);
  const config = {
    ...initialConfig, // key order matters: preset matching compares JSON strings
    scleraWidth: eyeDefaults.scleraWidth, scleraHeight: eyeDefaults.scleraHeight, scleraColor: eyeDefaults.scleraColor,
    irisWidth: eyeDefaults.irisSize, irisHeight: eyeDefaults.irisSize, irisColor: eyeDefaults.irisColor,
    pupilWidth: eyeDefaults.pupilSize, pupilHeight: eyeDefaults.pupilSize, pupilColor: eyeDefaults.pupilColor,
    upperLidSize: eyeDefaults.lidSize, upperLidColor: eyeDefaults.lidColor,
    lowerLidSize: eyeDefaults.lidSize, lowerLidColor: eyeDefaults.lidColor,
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
    if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return;
    found = true;
    apply(upperHex(`#${raw}`));
  };
  const flag = (name, apply) => {
    if (!params.has(name)) return;
    found = true;
    apply(!['0', 'false'].includes(params.get(name)));
  };

  num('scleraWidth', 0, 100, (v) => { config.scleraWidth = v; });
  num('scleraHeight', 0, 100, (v) => { config.scleraHeight = v; });
  color('scleraColor', (v) => { config.scleraColor = v; });

  // shorthands first so the specific params win if a hand-edited URL has both
  num('irisSize', 0, 100, (v) => { config.irisWidth = v; config.irisHeight = v; });
  num('irisWidth', 0, 100, (v) => { config.irisWidth = v; });
  num('irisHeight', 0, 100, (v) => { config.irisHeight = v; });
  color('irisColor', (v) => { config.irisColor = v; });

  num('pupilSize', 0, 100, (v) => { config.pupilWidth = v; config.pupilHeight = v; });
  num('pupilWidth', 0, 100, (v) => { config.pupilWidth = v; });
  num('pupilHeight', 0, 100, (v) => { config.pupilHeight = v; });
  color('pupilColor', (v) => { config.pupilColor = v; });

  num('lidSize', 0, 100, (v) => { config.upperLidSize = v; config.lowerLidSize = v; });
  num('upperLidSize', 0, 100, (v) => { config.upperLidSize = v; });
  num('lowerLidSize', 0, 100, (v) => { config.lowerLidSize = v; });
  color('lidColor', (v) => { config.upperLidColor = v; config.lowerLidColor = v; });
  color('upperLidColor', (v) => { config.upperLidColor = v; });
  color('lowerLidColor', (v) => { config.lowerLidColor = v; });

  // the Eye itself takes any angle, but the demo's slider is a single turn
  num('rotation', -180, 180, (v) => { config.rotation = v; });

  // "x,y", each clamped to the axis sliders' range; a malformed half is dropped
  if (params.has('lensPosition')) {
    const [x, y] = params.get('lensPosition').split(',').map(Number);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      found = true;
      config.lensPosition = [x, y].map((v) => Math.min(100, Math.max(-100, v)));
    }
  }

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

// a bipolar control (rotation, the two eye-position axes) reads as a deflection
// from its origin, not as an amount filled from the left end; MUI lays the track
// out inline, so the override has to be !important to win
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

// one axis of the eye position: the two ends are named rather than numbered, and
// the readout sits between them so the pair reads as a little crosshair
const AxisSlider = ({ label, startLabel, endLabel, value, onChange, disabled = false, smooth = false }) => (
  <Box>
    {/* 1fr auto 1fr keeps the readout dead centre over the slider's zero notch,
        whatever the two end labels are called */}
    <Box sx={{
      display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'baseline',
      color: disabled ? 'text.disabled' : 'text.secondary',
    }}>
      <Typography variant='caption' sx={{ fontWeight: 700 }}>{startLabel}</Typography>
      <Typography variant='caption' sx={{
        fontFamily: "'Fira Code', monospace", px: 1,
        color: disabled ? 'text.disabled' : 'text.primary',
      }}>
        {Math.round(value)}
      </Typography>
      <Typography variant='caption' sx={{ fontWeight: 700, textAlign: 'right' }}>{endLabel}</Typography>
    </Box>
    {/* the animated modes keep driving the sliders while they are disabled, so a
        greyed-out thumb still shows where the eye is looking; a wandering eye
        takes 600ms to reach its new target, so the thumb glides with it rather
        than snapping ahead */}
    <Slider size='small' value={Math.round(value)} min={-100} max={100} disabled={disabled}
      marks={[{ value: 0 }]}
      onChange={(e, v) => onChange(v)} aria-label={label}
      sx={{
        ...originTrackSx(Math.round(value), -100, 100, 0),
        '&.Mui-disabled': {
          '& .MuiSlider-thumb': {
            color: PAPER, borderColor: INK, opacity: 0.6,
            transition: smooth ? 'left 600ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          },
          '& .MuiSlider-track': {
            opacity: 0.5,
            transition: smooth ? 'left 600ms cubic-bezier(0.22, 1, 0.36, 1), width 600ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          },
        },
      }} />
  </Box>
);

const ColorControl = ({ label, value, onChange, sx }) => (
  <Box sx={sx}>
    <Typography variant='body2' gutterBottom sx={{ fontWeight: 700 }}>{label}</Typography>
    {/* the field keeps whatever case was typed in its own state, so the uppercase
        shown here is CSS; the value handed back to the config is uppercased too */}
    <MuiColorInput format='hex' isAlphaHidden size='small' value={value}
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
    <Switch checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
  </Stack>
);

const Card = ({ title, children, sx }) => (
  <Paper sx={{ p: 2.5, ...sx }} className='pop-in'>
    <Typography variant='h6' sx={{ mb: 1.5 }}>{title}</Typography>
    {children}
  </Paper>
);

const CopyButton = ({ getText, label = 'Copy', color = 'primary' }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Button size='small' variant='contained' disableElevation color={color}
      onClick={() => {
        navigator.clipboard.writeText(getText());
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}>
      {copied ? 'Copied!' : label}
    </Button>
  );
};

// eye props derived from a demo config (shared by hero + previews)
const eyeProps = (config, lensPosition) => ({
  scleraWidth: config.scleraWidth,
  scleraHeight: config.scleraHeight,
  scleraColor: config.scleraColor,
  irisWidth: config.irisWidth,
  irisHeight: config.irisHeight,
  irisColor: config.irisColor,
  pupilWidth: config.pupilWidth,
  pupilHeight: config.pupilHeight,
  pupilColor: config.pupilColor,
  upperLidSize: config.upperLidSize,
  upperLidColor: config.upperLidColor,
  lowerLidSize: config.lowerLidSize,
  lowerLidColor: config.lowerLidColor,
  rotation: config.rotation,
  blinking: config.blinking,
  blinkSpeed: config.blinkSpeed,
  blinkFrequency: config.blinkFrequency,
  blinkSqueeze: config.blinkSqueeze,
  lensMovement: config.movement === 'wander',
  lensPosition,
});

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const [config, setConfig] = useState(() => parseShareParams(window.location.search) ?? initialConfig);
  const set = (key) => (value) => setConfig((c) => ({ ...c, [key]: value }));
  const [eyeCount, setEyeCount] = useState(1); // demo-only, not an Eye prop
  const [eyeSize, setEyeSize] = useState( // demo-only display size in px
    () => parseShareSize(window.location.search) ?? defaultEyeSize);
  // the stage crops tall eyes by default; expanding it reveals the whole drawing area
  const [stageExpanded, setStageExpanded] = useState(false);

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

  // wander: one shared random target so all eyes look the same way in sync
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
  // by the eye-position sliders when the eye is still
  const lensPosition =
    config.movement === 'follow' ? followLens :
    config.movement === 'wander' ? wanderLens : config.lensPosition;
  const setLensAxis = (axis) => (value) => setConfig((c) => ({
    ...c,
    lensPosition: axis === 0 ? [value, c.lensPosition[1]] : [c.lensPosition[0], value],
  }));
  const heroEye = {
    ...eyeProps(config, lensPosition),
    // the demo drives all movement itself (so multiple eyes stay in sync);
    // in follow mode the rAF loop already eases, so the CSS transition is disabled
    lensMovement: false,
    lensSpeed: config.movement === 'follow' ? 0 : 600,
    width: '100%',
    height: '100%',
  };

  // on mobile the eye box scales with the viewport (52vw at the 680px default) so
  // the stage keeps the same proportions for every preset size
  const xsEyeBox = `min(${eyeSize}px, ${(eyeSize * 52 / 680).toFixed(1)}vw)`;

  // the snippet tracks the live lens, so a wandering eye writes its own code
  const [lensX, lensY] = lensPosition;
  const stillEye = config.movement === 'still';
  const codeProps = useMemo(
    () => buildCodeProps(config, [lensX, lensY]),
    [config, lensX, lensY]);
  const codeText = useMemo(() => {
    const inner = codeProps.map((p) => `  ${p.name}${p.value === null ? '' : `=${p.value}`}`).join('\n');
    return `import { Eye } from 'cartoon-eyes';\n\n<Eye\n${inner}\n/>`;
  }, [codeProps]);

  const activePreset = Object.keys(presets).find(
    (name) => JSON.stringify(presets[name]) === JSON.stringify(config)
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        body: {
          backgroundColor: CREAM,
          backgroundImage: `radial-gradient(#E9DCC5 1.5px, transparent 1.5px)`,
          backgroundSize: '22px 22px',
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
          sx={{ mb: { xs: 3, md: 4 }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box>
            <Typography variant='h1' sx={{ fontSize: { xs: '2.2rem', md: '3rem' }, lineHeight: 1.1 }}>
              cartoon-eyes
              <Box component='span' sx={{ color: CORAL }}>.</Box>
            </Typography>
            <Typography color='text.secondary' sx={{ mt: 0.5, fontWeight: 600 }}>
              A tiny React component for expressive, blinking SVG eyes. Try "Follow cursor" and they'll watch you.
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

        {/* hero eyes */}
        <Paper className='pop-in' sx={{
          position: 'relative',
          mb: 3, p: 0, overflow: 'hidden', bgcolor: '#FFE8CF',
          backgroundImage: `radial-gradient(rgba(41,34,58,0.12) 2px, transparent 2px)`,
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
                  bgcolor: '#FFF3DE', boxShadow: `4px 4px 0 ${INK}`,
                  transform: 'translate(-1px, -1px)',
                },
                '&:active': { boxShadow: `1px 1px 0 ${INK}`, transform: 'translate(2px, 2px)' },
              }}>
              {stageExpanded ? <FullscreenExitIcon fontSize='small' /> : <FullscreenIcon fontSize='small' />}
            </IconButton>
          </Tooltip>
          <Box ref={eyesRef} sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: { xs: 1, md: 2 },
            // collapsed: a fixed height tall enough for the default-size eye, with
            // larger sizes bleeding past the edges (cropped by overflow hidden).
            // expanded: the square eye box itself, which is exactly what a sclera
            // height of 100 fills, plus breathing room above and below
            height: stageExpanded
              ? { xs: `max(28vw, ${xsEyeBox} + 24px)`, md: Math.max(360, eyeSize + 72) }
              : { xs: '28vw', md: 360 },
            transition: 'height 350ms cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
          }}>
            {Array.from({ length: eyeCount }, (_, i) => (
              // the key includes eyeCount so both eyes remount together when the
              // count changes, keeping their blink timers in sync.
              // square boxes: the eye SVG keeps its 1:1 drawing aspect, so the
              // slider scales uniformly; flex must never shrink the boxes
              <Box key={`${eyeCount}-${i}`} sx={{
                flex: '0 0 auto',
                width: { xs: xsEyeBox, md: eyeSize },
                height: { xs: xsEyeBox, md: eyeSize },
              }}>
                <Eye {...heroEye} />
              </Box>
            ))}
          </Box>
        </Paper>

        {/* presets */}
        <Stack direction='row' spacing={1.5} useFlexGap className='pop-in'
          sx={{ mb: 3, animationDelay: '80ms', flexWrap: 'wrap' }}>
          {Object.entries(presets).map(([name, presetConfig]) => (
            <Button key={name} variant='contained' disableElevation
              onClick={() => { setConfig(presetConfig); setEyeSize(presetDisplaySize[name]); }}
              sx={{
                bgcolor: activePreset === name ? CORAL : PAPER,
                color: activePreset === name ? PAPER : INK,
                '&:hover': { bgcolor: activePreset === name ? CORAL : '#FFF3DE' },
                display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                flexGrow: 1,
              }}>
              <Box sx={{ width: 34, height: 34, display: 'flex' }}>
                <Eye {...eyeProps({ ...presetConfig, blinking: false, movement: 'still' }, [0, 0])}
                  width='100%' height='100%' />
              </Box>
              {name}
            </Button>
          ))}
        </Stack>

        {/* controls */}
        <Box sx={{
          display: 'grid', gap: 3, mb: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        }}>
          <Card title='Shape' sx={{ animationDelay: '140ms' }}>
            <Stack spacing={1}>
              <ControlSlider label='Sclera width' value={config.scleraWidth} onChange={set('scleraWidth')} />
              <ControlSlider label='Sclera height' value={config.scleraHeight} onChange={set('scleraHeight')} />
              <ControlSlider label='Iris width' value={config.irisWidth} onChange={set('irisWidth')} />
              <ControlSlider label='Iris height' value={config.irisHeight} onChange={set('irisHeight')} />
              <ControlSlider label='Pupil width' value={config.pupilWidth} onChange={set('pupilWidth')} />
              <ControlSlider label='Pupil height' value={config.pupilHeight} onChange={set('pupilHeight')} />
              <ControlSlider label='Upper eyelid' value={config.upperLidSize} onChange={set('upperLidSize')} />
              <ControlSlider label='Lower eyelid' value={config.lowerLidSize} onChange={set('lowerLidSize')} />
              {/* the track grows out of upright, with a mark every quarter turn */}
              <ControlSlider label='Rotation' value={config.rotation} onChange={set('rotation')}
                min={-180} max={180} unit='°' origin={0}
                marks={[-180, -90, 0, 90, 180].map((value) => ({ value }))} />
            </Stack>
          </Card>

          <Card title='Colours' sx={{ animationDelay: '200ms' }}>
            {/* two columns wherever the swatch fields still fit, keeping the card
                short and leaving room for more settings */}
            <Box sx={{
              display: 'grid', gap: 2,
              gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
            }}>
              <ColorControl label='Sclera' value={config.scleraColor} onChange={set('scleraColor')}
                sx={{ gridColumn: '1 / -1' }} />
              <ColorControl label='Iris' value={config.irisColor} onChange={set('irisColor')} />
              <ColorControl label='Pupil' value={config.pupilColor} onChange={set('pupilColor')} />
              <ColorControl label='Upper eyelid' value={config.upperLidColor} onChange={set('upperLidColor')} />
              <ColorControl label='Lower eyelid' value={config.lowerLidColor} onChange={set('lowerLidColor')} />
            </Box>
          </Card>

          <Card title='Behaviour' sx={{ animationDelay: '260ms' }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant='body2' gutterBottom sx={{ fontWeight: 700 }}>Eyes</Typography>
                <ToggleButtonGroup exclusive fullWidth size='small' value={eyeCount}
                  onChange={(e, v) => v && setEyeCount(v)}>
                  <ToggleButton value={1}>One</ToggleButton>
                  <ToggleButton value={2}>Two</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <ControlSlider label='Display size' value={eyeSize} onChange={setEyeSize}
                min={140} max={900} step={10} unit=' px' />
              <Box>
                <Typography variant='body2' gutterBottom sx={{ fontWeight: 700 }}>Eye movement</Typography>
                <ToggleButtonGroup exclusive fullWidth size='small' value={config.movement}
                  onChange={(e, v) => v && set('movement')(v)}>
                  <ToggleButton value='wander'>Wander</ToggleButton>
                  <ToggleButton value='follow'>Follow cursor</ToggleButton>
                  <ToggleButton value='still'>Still</ToggleButton>
                </ToggleButtonGroup>
                {/* the position belongs to the movement mode above it, so the two
                    sit in one block with only a hairline of space between them */}
                <Stack direction='row' sx={{ mt: 1.5, mb: 0.5, justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant='body2'
                    sx={{ fontWeight: 700, color: stillEye ? 'text.primary' : 'text.disabled' }}>
                    Eye position
                  </Typography>
                  {!stillEye && (
                    <Typography variant='caption' sx={{ color: 'text.disabled', fontWeight: 600 }}>
                      {config.movement === 'wander' ? 'wandering' : 'following'}
                    </Typography>
                  )}
                </Stack>
                <Stack spacing={0.5}>
                  <AxisSlider label='Eye position, horizontal' startLabel='Left' endLabel='Right'
                    value={lensX} onChange={setLensAxis(0)}
                    disabled={!stillEye} smooth={config.movement === 'wander'} />
                  <AxisSlider label='Eye position, vertical' startLabel='Up' endLabel='Down'
                    value={lensY} onChange={setLensAxis(1)}
                    disabled={!stillEye} smooth={config.movement === 'wander'} />
                </Stack>
              </Box>
              <SwitchControl label='Blinking' checked={config.blinking} onChange={set('blinking')} />
              <SwitchControl label='Blink squeeze' checked={config.blinkSqueeze} onChange={set('blinkSqueeze')}
                disabled={!config.blinking} />
              <ControlSlider label='Blink speed' value={config.blinkSpeed} onChange={set('blinkSpeed')}
                min={30} max={400} step={10} unit=' ms' disabled={!config.blinking} />
              <ControlSlider label='Blink every' value={config.blinkFrequency} onChange={set('blinkFrequency')}
                min={500} max={8000} step={100} unit=' ms' disabled={!config.blinking} />
            </Stack>
          </Card>
        </Box>

        {/* generated code */}
        <Paper className='pop-in' sx={{ p: 2.5, bgcolor: INK, color: CREAM, animationDelay: '320ms' }}>
          <Stack direction='row' sx={{ mb: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
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
              {' { Eye } '}
              <Box component='span' sx={{ color: '#9D8CFF' }}>from</Box>
              <Box component='span' sx={{ color: '#FFD166' }}>{" 'cartoon-eyes'"}</Box>
              {';\n\n'}
              <Box component='span' sx={{ color: '#7FD8D8' }}>{'<Eye'}</Box>
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
        <Box component='section' className='pop-in' sx={{ mt: 6, animationDelay: '380ms' }}>
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
