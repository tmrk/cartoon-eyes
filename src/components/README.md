# Cartoon Eyes for React

A tiny React component that renders a customisable, animated cartoon eye as inline SVG.
No dependencies, ~7 kB, TypeScript types included.

### 👉 [Live playground](https://tmrk.github.io/cartoon-eyes/)

## Installation

```
npm install cartoon-eyes
```

## Example usage

```jsx
import { Eye } from 'cartoon-eyes';

function App() {
  return (
    <Eye
      irisColor='#3E7BFA'
      scleraWidth={80}
      scleraHeight={55}
      irisSize={80}
      pupilSize={30}
      blinking
    />
  );
}

export default App;
```

All geometry props are **percentages relative to their parent shape**: the sclera is sized
against the drawing area, the iris against the sclera, and the pupil against the iris. A
circular iris or pupil is fitted against the smaller of its parent's radii, so it always
stays inside an elliptical parent.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | number \| string | – | Sets both `width` and `height` of the SVG |
| `width`, `height` | number \| string | `size` | Rendered SVG dimensions |
| `scleraWidth` | number | `100` | Eye outline width, % of the drawing area |
| `scleraHeight` | number | `100` | Eye outline height, % of the drawing area |
| `scleraColor` | string | `'#ffffff'` | Sclera fill colour |
| `irisSize` | number | `60` | Iris width and height, % of the sclera |
| `irisWidth`, `irisHeight` | number | `irisSize` | Set iris dimensions separately |
| `irisColor` | string | `'#666666'` | Iris fill colour |
| `pupilSize` | number | `50` | Pupil width and height, % of the iris |
| `pupilWidth`, `pupilHeight` | number | `pupilSize` | Set pupil dimensions separately (e.g. `pupilWidth={14} pupilHeight={90}` for a cat's slit) |
| `pupilColor` | string | `'#000000'` | Pupil fill colour |
| `lidSize` | number | `20` | Both eyelid sizes, % of the sclera half-height |
| `upperLidSize`, `lowerLidSize` | number | `lidSize` | Set eyelid sizes separately |
| `lidColor` | string | `'#aaaaaa'` | Both eyelid colours |
| `upperLidColor`, `lowerLidColor` | string | `lidColor` | Set eyelid colours separately |
| `lensPosition` | `[x, y]` | `[0, 0]` | Where the eye looks; each axis −100 (left/top) to 100 (right/bottom) |
| `lensMovement` | boolean \| number | `false` | Wander randomly; a number sets the interval in ms (default 1000) |
| `lensSpeed` | number | `500` | Lens movement transition duration, ms |
| `blinking` | boolean \| number | `false` | Blink periodically; a number also sets `blinkSpeed` |
| `blinkSpeed` | number | `80` | How long a blink lasts, ms |
| `blinkFrequency` | number | `3000` | Time between blinks, ms |
| `blinkSqueeze` | boolean | `false` | Squash the whole eye vertically while blinking |
| `title` | string | – | Accessible name (rendered as an SVG `<title>`) |
| `className`, `style` | – | – | Passed through to the `<svg>` element |
| `scleraStyle`, `irisStyle`, `pupilStyle`, `upperLidStyle`, `lowerLidStyle` | object | `{}` | Inline styles for the individual shapes |

### Making the eye look somewhere

`lensPosition` is fully controlled, so you can point the eye anywhere — for example at the
mouse cursor:

```jsx
const [lens, setLens] = useState([0, 0]);

useEffect(() => {
  const onMove = (e) => setLens([
    (e.clientX / window.innerWidth) * 200 - 100,
    (e.clientY / window.innerHeight) * 200 - 100,
  ]);
  window.addEventListener('mousemove', onMove);
  return () => window.removeEventListener('mousemove', onMove);
}, []);

<Eye lensPosition={lens} lensSpeed={120} />
```

## Changes in v2

- **Fixed:** dark `scleraColor` values no longer make the iris and lids fade out
  (the internal SVG mask was luminance-based on the sclera colour).
- **Fixed:** multiple eyes on one page no longer risk sharing SVG element IDs.
- **Fixed:** the `lensMovement` timer is cleaned up on unmount.
- **Fixed:** `blinkSqueeze` no longer double-applies its squash.
- **New:** `lensSpeed`, `title`, `className` and `style` props; TypeScript types.
- The package now ships as ESM and requires React ≥ 18.

## Licence

MIT
