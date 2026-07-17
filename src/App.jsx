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
// Theme: warm "sticker sheet" look — thick ink outlines, offset shadows,
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
  movement: 'follow', // demo-only: 'follow' | 'wander' | 'still'
};

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
};

// the Eye component's own defaults — used to emit only non-default props
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

const ControlSlider = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = '' }) => (
  <Box>
    <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Typography variant='body2' sx={{ fontWeight: 700 }}>{label}</Typography>
      <Typography variant='body2' color='text.secondary' sx={{ fontFamily: "'Fira Code', monospace" }}>
        {value}{unit}
      </Typography>
    </Stack>
    <Slider size='small' value={value} min={min} max={max} step={step}
      onChange={(e, v) => onChange(v)} aria-label={label} />
  </Box>
);

const ColorControl = ({ label, value, onChange }) => (
  <Box>
    <Typography variant='body2' gutterBottom sx={{ fontWeight: 700 }}>{label}</Typography>
    <MuiColorInput format='hex' isAlphaHidden size='small' value={value}
      onChange={(v) => onChange(v)} sx={{ width: '100%' }} />
  </Box>
);

const SwitchControl = ({ label, checked, onChange }) => (
  <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant='body2' sx={{ fontWeight: 700 }}>{label}</Typography>
    <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
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

  // follow-the-cursor: convert mouse position into a lensPosition percentage
  const eyesRef = useRef(null);
  const [followLens, setFollowLens] = useState([0, 0]);
  useEffect(() => {
    if (config.movement !== 'follow') return;
    const onMove = (e) => {
      const box = eyesRef.current?.getBoundingClientRect();
      if (!box) return;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const x = Math.max(-90, Math.min(90, ((e.clientX - cx) / (window.innerWidth / 2)) * 140));
      const y = Math.max(-90, Math.min(90, ((e.clientY - cy) / (window.innerHeight / 2)) * 140));
      setFollowLens([Math.round(x), Math.round(y)]);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [config.movement]);

  const lensPosition = config.movement === 'follow' ? followLens : [0, 0];
  const heroEye = {
    ...eyeProps(config, lensPosition),
    lensSpeed: config.movement === 'follow' ? 120 : 500,
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
              A tiny React component for expressive, blinking SVG eyes — they're watching your cursor.
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
          mb: 3, p: { xs: 2, md: 4 }, bgcolor: '#FFE8CF',
          backgroundImage: `radial-gradient(rgba(41,34,58,0.12) 2px, transparent 2px)`,
          backgroundSize: '18px 18px',
        }}>
          <Box ref={eyesRef} sx={{
            display: 'flex', justifyContent: 'center', gap: { xs: 2, md: 4 },
            py: { xs: 1, md: 2 },
          }}>
            {[0, 1].map((i) => (
              <Box key={i} sx={{
                width: 'clamp(130px, 30vw, 280px)', aspectRatio: '4 / 3',
              }}>
                <Eye {...heroEye} title={i === 0 ? 'left cartoon eye' : 'right cartoon eye'} />
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
                display: 'flex', gap: 1, alignItems: 'center',
              }}>
              <Box sx={{ width: 42, height: 30, display: 'flex' }}>
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
                <Typography variant='body2' gutterBottom sx={{ fontWeight: 700 }}>Eye movement</Typography>
                <ToggleButtonGroup exclusive fullWidth size='small' value={config.movement}
                  onChange={(e, v) => v && set('movement')(v)}>
                  <ToggleButton value='follow'>Follow cursor</ToggleButton>
                  <ToggleButton value='wander'>Wander</ToggleButton>
                  <ToggleButton value='still'>Still</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <SwitchControl label='Blinking' checked={config.blinking} onChange={set('blinking')} />
              <SwitchControl label='Blink squeeze' checked={config.blinkSqueeze} onChange={set('blinkSqueeze')} />
              <ControlSlider label='Blink speed' value={config.blinkSpeed} onChange={set('blinkSpeed')}
                min={30} max={400} step={10} unit=' ms' />
              <ControlSlider label='Blink every' value={config.blinkFrequency} onChange={set('blinkFrequency')}
                min={500} max={8000} step={100} unit=' ms' />
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
