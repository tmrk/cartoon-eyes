# Cartoon Eyes for React

A React component that exports a customisable cartoon eye as inline SVG code.

## Example usage

`npm install cartoon-eyes`

```jsx
import { Eye } from 'cartoon-eyes';

function App() {
  return (
    <Eye 
      irisColor='#0000ff' 
      scleraWidth={80} 
      scleraHeight={55} 
      irisSize={80} 
      pupilWidth={30} 
      blinking={true} />
  );
}

export default App;
```

### 👉 [Demo](https://tmrk.github.io/cartoon-eyes/)

More documentation coming soon.

## Licence

MIT
