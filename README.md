# Cartoon Eyes for React

A React component that renders a customisable, animated cartoon eye as inline SVG —
plus the interactive playground that demos it.

### 👉 [Live playground](https://tmrk.github.io/cartoon-eyes/)

## Example usage

`npm install cartoon-eyes`

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

Full documentation lives in the [package README](src/components/README.md).

## Repository layout

- **Root** — the playground app (React + Vite + MUI), deployed to GitHub Pages.
- **[`src/components/`](src/components)** — the `cartoon-eyes` npm package itself.

## Development

```
npm install
npm start          # playground dev server on http://localhost:3000
npm run build      # production build of the playground
npm run deploy     # publish the playground to GitHub Pages

cd src/components
npm run build      # build the npm package (dist/)
```

## Licence

MIT
