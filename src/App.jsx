import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Button, Container, CssBaseline, GlobalStyles, IconButton, Link, Paper,
  Slider, Stack, Switch, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
  scleraWidth: 70, scleraHeight: 50, scleraColor: '#ffffff',
  irisWidth: 80, irisHeight: 80, irisColor: '#3E7BFA',
  pupilWidth: 30, pupilHeight: 30, pupilColor: '#000000',
  upperLidSize: 20, upperLidColor: '#aaaaaa',
  lowerLidSize: 20, lowerLidColor: '#aaaaaa',
  blinking: true, blinkSpeed: 80, blinkFrequency: 3000, blinkSqueeze: false,
  movement: 'wander', // demo-only: 'follow' | 'wander' | 'still'
};

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const presets = {
  Default: initialConfig,
  Snake: {
    ...initialConfig,
    scleraWidth: 80, scleraHeight: 70, scleraColor: '#aaffaa',
    irisWidth: 100, irisHeight: 100, irisColor: '#ff7700',
    pupilWidth: 10, pupilHeight: 80, pupilColor: '#000000',
    upperLidSize: 0, lowerLidSize: 0,
    blinking: false,
  },
  Zombie: {
    ...initialConfig,
    scleraWidth: 80, scleraHeight: 65, scleraColor: '#ffffdd',
    irisWidth: 70, irisHeight: 65, irisColor: '#559933',
    pupilWidth: 50, pupilHeight: 50, pupilColor: '#330000',
    upperLidSize: 35, upperLidColor: '#557755',
    lowerLidSize: 20, lowerLidColor: '#557755',
    blinkSpeed: 250, blinkFrequency: 5000,
  },
  Cat: {
    ...initialConfig,
    scleraWidth: 72, scleraHeight: 66, scleraColor: '#f6edd2',
    irisWidth: 95, irisHeight: 95, irisColor: '#E8A33D',
    pupilWidth: 14, pupilHeight: 90, pupilColor: '#1c1c1c',
    upperLidSize: 12, upperLidColor: '#8a6d3b',
    lowerLidSize: 8, lowerLidColor: '#8a6d3b',
    blinkFrequency: 4500,
  },
  Sleepy: {
    ...initialConfig,
    scleraWidth: 75, scleraHeight: 45, scleraColor: '#fff5f0',
    irisWidth: 70, irisHeight: 70, irisColor: '#7a6ea8',
    pupilWidth: 40, pupilHeight: 40, pupilColor: '#2a2438',
    upperLidSize: 55, upperLidColor: '#d9b8a6',
    lowerLidSize: 25, lowerLidColor: '#d9b8a6',
    blinkSpeed: 300, blinkFrequency: 2200,
  },
  Surprised: {
    ...initialConfig,
    scleraWidth: 82, scleraHeight: 82, scleraColor: '#ffffff',
    irisWidth: 45, irisHeight: 45, irisColor: '#16a34a',
    pupilWidth: 55, pupilHeight: 55, pupilColor: '#000000',
    upperLidSize: 0, lowerLidSize: 0,
    blinking: false,
  },
  Alien: {
    ...initialConfig,
    scleraWidth: 62, scleraHeight: 88, scleraColor: '#0d0d15',
    irisWidth: 85, irisHeight: 85, irisColor: '#16162a',
    pupilWidth: 55, pupilHeight: 55, pupilColor: '#000000',
    upperLidSize: 0, upperLidColor: '#0d0d15',
    lowerLidSize: 0, lowerLidColor: '#0d0d15',
    blinkSpeed: 160, blinkFrequency: 6000,
  },
  Frog: {
    ...initialConfig,
    scleraWidth: 80, scleraHeight: 80, scleraColor: '#f7c948',
    irisWidth: 70, irisHeight: 70, irisColor: '#b45309',
    pupilWidth: 85, pupilHeight: 30, pupilColor: '#101010',
    upperLidSize: 10, upperLidColor: '#3f6212',
    lowerLidSize: 10, lowerLidColor: '#3f6212',
    blinkFrequency: 4200,
  },
};

// the Eye component's own defaults, used to emit only non-default props
const eyeDefaults = {
  scleraWidth: 100, scleraHeight: 100, scleraColor: '#ffffff',
  irisSize: 60, irisColor: '#666666',
  pupilSize: 50, pupilColor: '#000000',
  lidSize: 20, lidColor: '#aaaaaa',
  blinkSpeed: 80, blinkFrequency: 3000,
};

function buildCodeProps(config) {
  const props = [];
  const add = (name, value) => props.push({ name, value });

  if (config.scleraWidth !== eyeDefaults.scleraWidth) add('scleraWidth', `{${config.scleraWidth}}`);
  if (config.scleraHeight !== eyeDefaults.scleraHeight) add('scleraHeight', `{${config.scleraHeight}}`);
  if (config.scleraColor !== eyeDefaults.scleraColor) add('scleraColor', `'${config.scleraColor}'`);

  if (config.irisWidth === config.irisHeight) {
    if (config.irisWidth !== eyeDefaults.irisSize) add('irisSize', `{${config.irisWidth}}`);
  } else {
    add('irisWidth', `{${config.irisWidth}}`);
    add('irisHeight', `{${config.irisHeight}}`);
  }
  if (config.irisColor !== eyeDefaults.irisColor) add('irisColor', `'${config.irisColor}'`);

  if (config.pupilWidth === config.pupilHeight) {
    if (config.pupilWidth !== eyeDefaults.pupilSize) add('pupilSize', `{${config.pupilWidth}}`);
  } else {
    add('pupilWidth', `{${config.pupilWidth}}`);
    add('pupilHeight', `{${config.pupilHeight}}`);
  }
  if (config.pupilColor !== eyeDefaults.pupilColor) add('pupilColor', `'${config.pupilColor}'`);

  if (config.upperLidSize === config.lowerLidSize) {
    if (config.upperLidSize !== eyeDefaults.lidSize) add('lidSize', `{${config.upperLidSize}}`);
  } else {
    add('upperLidSize', `{${config.upperLidSize}}`);
    add('lowerLidSize', `{${config.lowerLidSize}}`);
  }
  if (config.upperLidColor === config.lowerLidColor) {
    if (config.upperLidColor !== eyeDefaults.lidColor) add('lidColor', `'${config.upperLidColor}'`);
  } else {
    add('upperLidColor', `'${config.upperLidColor}'`);
    add('lowerLidColor', `'${config.lowerLidColor}'`);
  }

  if (config.blinking) {
    add('blinking', null); // bare boolean prop
    if (config.blinkSpeed !== eyeDefaults.blinkSpeed) add('blinkSpeed', `{${config.blinkSpeed}}`);
    if (config.blinkFrequency !== eyeDefaults.blinkFrequency) add('blinkFrequency', `{${config.blinkFrequency}}`);
    if (config.blinkSqueeze) add('blinkSqueeze', null);
  }
  if (config.movement === 'wander') add('lensMovement', null);
  return props;
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

const ControlSlider = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = '', disabled = false }) => (
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
      onChange={(e, v) => onChange(v)} aria-label={label} />
  </Box>
);

const ColorControl = ({ label, value, onChange }) => (
  <Box>
    <Typography variant='body2' gutterBottom sx={{ fontWeight: 700 }}>{label}</Typography>
    <MuiColorInput format='hex' isAlphaHidden size='small' value={value}
      onChange={(v) => onChange(v)}
      sx={{ width: '100%', '& input': { fontFamily: "'Fira Code', monospace" } }} />
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

const CopyButton = ({ getText, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Button size='small' variant='contained' disableElevation
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
  const [config, setConfig] = useState(initialConfig);
  const set = (key) => (value) => setConfig((c) => ({ ...c, [key]: value }));
  const [eyeCount, setEyeCount] = useState(2); // demo-only, not an Eye prop
  const [eyeSize, setEyeSize] = useState(680); // demo-only display size in px

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

  const lensPosition =
    config.movement === 'follow' ? followLens :
    config.movement === 'wander' ? wanderLens : [0, 0];
  const heroEye = {
    ...eyeProps(config, lensPosition),
    // the demo drives all movement itself (so multiple eyes stay in sync);
    // in follow mode the rAF loop already eases, so the CSS transition is disabled
    lensMovement: false,
    lensSpeed: config.movement === 'follow' ? 0 : 600,
    width: '100%',
    height: '100%',
  };

  const codeProps = useMemo(() => buildCodeProps(config), [config]);
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
          mb: 3, p: 0, overflow: 'hidden', bgcolor: '#FFE8CF',
          backgroundImage: `radial-gradient(rgba(41,34,58,0.12) 2px, transparent 2px)`,
          backgroundSize: '18px 18px',
        }}>
          <Box ref={eyesRef} sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: { xs: 2, md: 4 },
            // fixed height, no padding: at the default size the eyes touch the
            // container edges and bleed past them, cropped by overflow hidden
            height: { xs: '24vw', md: 300 },
            overflow: 'hidden',
          }}>
            {Array.from({ length: eyeCount }, (_, i) => (
              // the key includes eyeCount so both eyes remount together when the
              // count changes, keeping their blink timers in sync.
              // square boxes: the eye SVG keeps its 1:1 drawing aspect, so the
              // slider scales uniformly; flex must never shrink the boxes
              <Box key={`${eyeCount}-${i}`} sx={{
                flex: '0 0 auto',
                width: { xs: `min(${eyeSize}px, 52vw)`, md: eyeSize },
                height: { xs: `min(${eyeSize}px, 52vw)`, md: eyeSize },
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
              onClick={() => setConfig(presetConfig)}
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
            </Stack>
          </Card>

          <Card title='Colours' sx={{ animationDelay: '200ms' }}>
            <Stack spacing={2}>
              <ColorControl label='Sclera' value={config.scleraColor} onChange={set('scleraColor')} />
              <ColorControl label='Iris' value={config.irisColor} onChange={set('irisColor')} />
              <ColorControl label='Pupil' value={config.pupilColor} onChange={set('pupilColor')} />
              <ColorControl label='Upper eyelid' value={config.upperLidColor} onChange={set('upperLidColor')} />
              <ColorControl label='Lower eyelid' value={config.lowerLidColor} onChange={set('lowerLidColor')} />
            </Stack>
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
            <CopyButton getText={() => codeText} label='Copy JSX' />
          </Stack>
          <Box component='pre' sx={{
            m: 0, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)',
            fontFamily: "'Fira Code', monospace", fontSize: 13.5, lineHeight: 1.7,
            overflowX: 'auto',
          }}>
            <code>
              <Box component='span' sx={{ color: '#9d8cff' }}>import</Box>
              {' { Eye } '}
              <Box component='span' sx={{ color: '#9d8cff' }}>from</Box>
              <Box component='span' sx={{ color: '#ffd166' }}>{" 'cartoon-eyes'"}</Box>
              {';\n\n'}
              <Box component='span' sx={{ color: '#7fd8d8' }}>{'<Eye'}</Box>
              {'\n'}
              {codeProps.map((p) => (
                <React.Fragment key={p.name}>
                  {'  '}
                  <Box component='span' sx={{ color: '#ffa07a' }}>{p.name}</Box>
                  {p.value !== null && (
                    <>
                      {'='}
                      <Box component='span' sx={{
                        color: p.value.startsWith("'") ? '#ffd166' : '#b5e48c',
                      }}>{p.value}</Box>
                    </>
                  )}
                  {'\n'}
                </React.Fragment>
              ))}
              <Box component='span' sx={{ color: '#7fd8d8' }}>{'/>'}</Box>
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
