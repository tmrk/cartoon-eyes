import * as React from 'react';

export interface EyeProps {
  /** Sets both `width` and `height` of the rendered SVG. */
  size?: number | string;
  /** Width of the rendered SVG (overrides `size`). */
  width?: number | string;
  /** Height of the rendered SVG (overrides `size`). */
  height?: number | string;

  /** Width of the eye outline as a percentage (0-100) of the drawing area. Default 100. */
  scleraWidth?: number;
  /** Height of the eye outline as a percentage (0-100) of the drawing area. Default 100. */
  scleraHeight?: number;
  /** Fill colour of the sclera (the white of the eye). Default `#ffffff`. */
  scleraColor?: string;
  scleraStyle?: React.CSSProperties;

  /** Sets both iris width and height as a percentage (0-100) of the sclera. Default 60. */
  irisSize?: number;
  irisWidth?: number;
  irisHeight?: number;
  /** Default `#666666`. */
  irisColor?: string;
  irisStyle?: React.CSSProperties;

  /**
   * Thickness of the limbus (the darker ring around the iris) as a percentage
   * (0-100) of the iris radius: `10` colours the outer 10% of the iris. The iris
   * keeps its outer dimensions, so a limbus never grows the iris or moves the
   * pupil. Default 0 (no limbus rendered).
   */
  limbusThickness?: number;
  /** Fill colour of the limbus ring. Default `#000000`. */
  limbusColor?: string;
  limbusStyle?: React.CSSProperties;

  /** Sets both pupil width and height as a percentage (0-100) of the iris. Default 50. */
  pupilSize?: number;
  pupilWidth?: number;
  pupilHeight?: number;
  /** Default `#000000`. */
  pupilColor?: string;
  pupilStyle?: React.CSSProperties;

  /** Sets both eyelid sizes as a percentage (0-100) of the sclera half-height. Default 20. */
  lidSize?: number;
  /** Sets both eyelid colours. Default `#aaaaaa`. */
  lidColor?: string;
  upperLidSize?: number;
  upperLidColor?: string;
  upperLidStyle?: React.CSSProperties;
  lowerLidSize?: number;
  lowerLidColor?: string;
  lowerLidStyle?: React.CSSProperties;

  /**
   * Position of the iris+pupil within the eye: `[x, y]`, each from -100 (left/top)
   * to 100 (right/bottom). Default `[0, 0]` (centred). Ignored while `lensMovement` is on.
   */
  lensPosition?: [number, number];
  /** `true` to make the eye wander randomly; a number sets the wander interval in ms (default 1000). */
  lensMovement?: boolean | number;
  /** Duration of the lens movement transition in ms. Default 500. */
  lensSpeed?: number;

  /**
   * Tilt of the whole eye in degrees: negative rotates left (anticlockwise),
   * positive rotates right (clockwise). Default 0. Not clamped to ±180, so it can
   * be driven past a full turn to animate a spin.
   */
  rotation?: number;
  /** Duration of the rotation transition in ms. Default 0 (rotate immediately). */
  rotationSpeed?: number;

  /** `true` to blink periodically; a number also sets `blinkSpeed` in ms. */
  blinking?: boolean | number;
  /** How long a blink lasts, in ms. Default 80. */
  blinkSpeed?: number;
  /** Time between blinks, in ms. Default 3000. */
  blinkFrequency?: number;
  /** Squash the whole eye vertically while blinking. Default false. */
  blinkSqueeze?: boolean;

  /** Accessible name for the eye (rendered as an SVG `<title>`). */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Eye: React.FC<EyeProps>;
export default Eye;
