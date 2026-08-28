import * as React from 'react';

/**
 * Every colour prop takes any CSS colour the renderer understands, and may
 * carry an alpha channel as an 8-digit hex (`#RRGGBBAA`) or its 4-digit
 * shorthand (`#RGBA`): the alpha is split off into the shape's `fill-opacity`,
 * so the drawing stays valid plain SVG.
 */
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

  /**
   * Thickness of the outline drawn around the eye as a percentage (0-100) of the
   * sclera radius. Like the limbus it is taken out of the sclera rather than added
   * around it, so the eye never grows past the drawing area, and it is drawn over
   * the eyelids so it always frames the whole eye. Default 0 (no outline rendered).
   */
  eyeOutlineThickness?: number;
  /** Fill colour of the eye outline. Default `#000000`. */
  eyeOutlineColor?: string;
  eyeOutlineStyle?: React.CSSProperties;

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

  /**
   * Sets both catchlight width and height as a percentage (0-100) of the full
   * outer iris, limbus included, so adding a limbus never resizes it. The
   * catchlight is drawn over the iris and the pupil and travels with the lens,
   * but it does not turn with `rotation`: it is a reflection of a fixed light,
   * so both its place and its shape stay on the screen's own axes while the eye
   * tilts. Default 0 (no catchlight rendered).
   */
  catchlightSize?: number;
  catchlightWidth?: number;
  catchlightHeight?: number;
  /**
   * Position of the catchlight within the iris: `[x, y]`, each from -100 (left/top)
   * to 100 (right/bottom), measured against the full outer iris and along the
   * screen's axes, not the rotated eye's. Default `[-40, -40]`.
   */
  catchlightPosition?: [number, number];
  /**
   * Default `#ffffff`. Takes an alpha channel as an 8-digit hex, so
   * `#FFFFFF80` gives the half-transparent glint of a wet eye.
   */
  catchlightColor?: string;
  catchlightStyle?: React.CSSProperties;

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
   * Sets both eyeliner thicknesses as a percentage (0-100) of the sclera
   * half-height. The eyeliner belongs to the eyelid margins - along the bottom
   * edge of the upper lid and the top edge of the lower one - so it moves with
   * the lids as they blink. Default 0 (no eyeliner rendered).
   */
  eyelinerSize?: number;
  /** Sets both eyeliner colours. Default `#000000`. */
  eyelinerColor?: string;
  upperEyelinerSize?: number;
  upperEyelinerColor?: string;
  upperEyelinerStyle?: React.CSSProperties;
  lowerEyelinerSize?: number;
  lowerEyelinerColor?: string;
  lowerEyelinerStyle?: React.CSSProperties;

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
   * positive rotates right (clockwise). Everything turns with it except the
   * catchlight, which stays aligned to the screen. Default 0. Not clamped to
   * ±180, so it can be driven past a full turn to animate a spin.
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
  /**
   * Controlled blinking: while this is set the eye's own blink timer stands down
   * and the lids follow the value, so a parent can blink several eyes in step.
   * `EyePair` uses it to blink its two eyes together. Leave it undefined
   * (the default) for the eye to keep its own clock.
   */
  blinkClosed?: boolean;

  /** Accessible name for the eye (rendered as an SVG `<title>`). */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface EyePairProps extends EyeProps {
  /**
   * Space between the two eyes as a percentage of one eye's nominal size, so the
   * pair keeps its proportions at any size. It is measured between the eyes
   * themselves rather than their drawing areas, so the slack a sclera narrower
   * than its box leaves down each inner side comes off it: `0` sets the two eyes
   * side by side whatever `scleraWidth` is, `100` leaves a whole eye's worth of
   * space between them. Default 20.
   */
  gap?: number;
  /**
   * Mirrored tilt of the two eyes in degrees, positive rotating them outwards:
   * the left eye turns by `-eyeRotation`, the right one by `+eyeRotation`. Added
   * to any shared `rotation`, which turns both the same way. Default 0.
   */
  eyeRotation?: number;
  /**
   * Props for the left eye only; they override the shared ones. Naming a gaze
   * prop (`lensPosition`, `lensMovement`) or a blink prop (`blinking`,
   * `blinkSpeed`, `blinkFrequency`, `blinkClosed`) takes this eye off the pair's
   * shared clock: `{ lensPosition }` alone fixes its gaze there, `{ lensMovement }`
   * gives it a wander of its own, and the two together do both.
   */
  leftEye?: EyeProps;
  /** Props for the right eye only; they override the shared ones, as `leftEye` does. */
  rightEye?: EyeProps;
  /** Accessible name for the pair (rendered on the wrapping element). */
  title?: string;
  /** Passed to the wrapping element, not to the eyes. */
  className?: string;
  /** Passed to the wrapping element, not to the eyes. */
  style?: React.CSSProperties;
}

export declare const Eye: React.FC<EyeProps>;
export declare const EyePair: React.FC<EyePairProps>;
export default Eye;
