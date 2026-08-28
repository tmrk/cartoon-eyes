import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Eye, EyePair } from '../src/components/src/CartoonEyes';

describe('Eye geometry', () => {
  it('converts sclera percentages into viewbox ellipse radii', () => {
    const { container } = render(<Eye size={100} scleraWidth={80} scleraHeight={60} />);
    const sclera = container.querySelector('.sclera');
    // radii are percentages of the 50-unit half-viewbox
    expect(sclera.getAttribute('rx')).toBe('40');
    expect(sclera.getAttribute('ry')).toBe('30');
  });

  it('scales an elliptical iris against each sclera axis independently', () => {
    const { container } = render(
      <Eye size={100} scleraWidth={80} scleraHeight={60} irisWidth={50} irisHeight={100} />
    );
    const iris = container.querySelector('.iris');
    expect(iris.getAttribute('rx')).toBe('20'); // 40 * 50%
    expect(iris.getAttribute('ry')).toBe('30'); // 30 * 100%
  });

  it('fits a circular iris against the smaller sclera radius', () => {
    const { container } = render(
      <Eye size={100} scleraWidth={100} scleraHeight={50} irisSize={60} />
    );
    const iris = container.querySelector('.iris');
    // min(50, 25) * 60% on both axes, so the circle stays inside the ellipse
    expect(iris.getAttribute('rx')).toBe('15');
    expect(iris.getAttribute('ry')).toBe('15');
  });

  it('fits a circular pupil against the smaller iris radius', () => {
    const { container } = render(
      <Eye size={100} irisWidth={80} irisHeight={40} pupilSize={50} />
    );
    const pupil = container.querySelector('.pupil');
    // iris radii are 40 and 20, so the pupil circle is min(40, 20) * 50%
    expect(pupil.getAttribute('rx')).toBe('10');
    expect(pupil.getAttribute('ry')).toBe('10');
  });
});

describe('Eye limbus', () => {
  it('renders no limbus by default, leaving the iris at its full size', () => {
    const { container } = render(<Eye size={100} scleraWidth={80} irisSize={60} />);
    expect(container.querySelector('.limbus')).toBeNull();
    const iris = container.querySelector('.iris');
    expect(iris.getAttribute('rx')).toBe('24'); // min(40, 50) * 60%
    expect(iris.getAttribute('ry')).toBe('24');
  });

  it('takes the limbus out of the iris rather than adding it around the outside', () => {
    const { container } = render(
      <Eye size={100} irisSize={60} pupilSize={50} limbusThickness={10} />
    );
    // the coloured iris shrinks to the inner 90% ...
    const iris = container.querySelector('.iris');
    expect(iris.getAttribute('rx')).toBe('27'); // 30 * 90%
    expect(iris.getAttribute('ry')).toBe('27');
    // ... while the pupil still measures against the unchanged outer iris
    const pupil = container.querySelector('.pupil');
    expect(pupil.getAttribute('rx')).toBe('15'); // 30 * 50%
    expect(pupil.getAttribute('ry')).toBe('15');
  });

  it('draws the ring as one evenodd path holding the outer and inner ellipses', () => {
    const { container } = render(
      <Eye size={100} irisSize={60} limbusThickness={10} limbusColor='#123456' />
    );
    const limbus = container.querySelector('.limbus');
    expect(limbus.tagName.toLowerCase()).toBe('path');
    expect(limbus.getAttribute('fill')).toBe('#123456');
    expect(limbus.getAttribute('fill-rule')).toBe('evenodd');
    // no stroke: the ring is the hollow area between the two ellipse subpaths
    expect(limbus.getAttribute('stroke')).toBeNull();
    const d = limbus.getAttribute('d');
    expect(d).toContain('A 30 30'); // outer, at the full iris radii
    expect(d).toContain('A 27 27'); // inner, punching the hole
    expect(d.match(/M /g)).toHaveLength(2);
  });

  it('scales the ring against each iris axis for an elliptical iris', () => {
    const { container } = render(
      <Eye size={100} irisWidth={80} irisHeight={40} limbusThickness={25} />
    );
    const iris = container.querySelector('.iris');
    expect(iris.getAttribute('rx')).toBe('30'); // 40 * 75%
    expect(iris.getAttribute('ry')).toBe('15'); // 20 * 75%
    expect(container.querySelector('.limbus').getAttribute('d'))
      .toBe('M -40 0 A 40 20 0 1 0 40 0 A 40 20 0 1 0 -40 0 Z '
        + 'M -30 0 A 30 15 0 1 0 30 0 A 30 15 0 1 0 -30 0 Z');
  });

  it('leaves the lens travel unchanged when a limbus is enabled', () => {
    const lensTransform = (limbusThickness) => {
      const { container } = render(
        <Eye size={100} irisSize={60} lensPosition={[100, 100]} limbusThickness={limbusThickness} />
      );
      return container.querySelector('.lens > g').style.transform;
    };
    expect(lensTransform(20)).toBe(lensTransform(0));
  });
});

describe('Eye catchlight', () => {
  it('renders no catchlight by default', () => {
    const { container } = render(<Eye size={100} />);
    expect(container.querySelector('.catchlight')).toBeNull();
  });

  it('measures against the full outer iris, whatever the limbus takes', () => {
    const catchlight = (limbusThickness) => {
      const { container } = render(
        <Eye size={100} irisSize={60} catchlightSize={20} limbusThickness={limbusThickness} />
      );
      return container.querySelector('.catchlight');
    };
    // the iris radius is 30 either way, so 20% of it is 6 with or without a ring
    expect(catchlight(0).getAttribute('rx')).toBe('6');
    expect(catchlight(40).getAttribute('rx')).toBe('6');
    expect(catchlight(40).getAttribute('transform')).toBe(catchlight(0).getAttribute('transform'));
  });

  it('fits a circular catchlight against the smaller iris radius', () => {
    const { container } = render(
      <Eye size={100} irisWidth={80} irisHeight={40} catchlightSize={25} />
    );
    const catchlight = container.querySelector('.catchlight');
    // iris radii are 40 and 20, so the circle is min(40, 20) * 25%
    expect(catchlight.getAttribute('rx')).toBe('5');
    expect(catchlight.getAttribute('ry')).toBe('5');
  });

  it('scales an elliptical catchlight against each iris axis independently', () => {
    const { container } = render(
      <Eye size={100} irisWidth={80} irisHeight={40} catchlightWidth={25} catchlightHeight={50} />
    );
    const catchlight = container.querySelector('.catchlight');
    expect(catchlight.getAttribute('rx')).toBe('10'); // 40 * 25%
    expect(catchlight.getAttribute('ry')).toBe('10'); // 20 * 50%
  });

  it('places it in the slack between itself and the iris edge', () => {
    const { container } = render(
      <Eye size={100} irisSize={60} catchlightSize={20} catchlightPosition={[-50, 100]} />
    );
    // iris radius 30, catchlight radius 6: 24 units of slack on each axis
    expect(container.querySelector('.catchlight').getAttribute('transform'))
      .toBe('translate(38, 74)');
  });

  it('draws it over the pupil, inside the group the lens moves', () => {
    const { container } = render(<Eye size={100} catchlightSize={20} />);
    const lensGroup = container.querySelector('.lens > g');
    const drawn = [...lensGroup.children].map((el) => el.getAttribute('class'));
    expect(drawn).toEqual(['iris', 'pupil', 'catchlight-frame']);
    // the frame is only there to hold the eye's rotation off the glint, so it
    // stays inside the lens and travels with it
    expect(container.querySelector('.catchlight-frame > .catchlight')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// The transforms a renderer would compose for the catchlight: the eye's own
// rotation about the centre of the drawing area, the lens travel inside it, the
// frame that takes the rotation back off the glint, and the glint's own place
// inside the iris. Composing them here lets a test ask where the glint actually
// lands on the screen instead of trusting any one transform on its own
// ---------------------------------------------------------------------------

const affine = {
  // [a, b, c, d, e, f], as in the SVG matrix()
  mul: (m, n) => [
    m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
  ],
  translate: (x, y) => [1, 0, 0, 1, x, y],
  rotate: (degrees, cx, cy) => {
    const radians = degrees * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return [cos, sin, -sin, cos, cx - cos * cx + sin * cy, cy - sin * cx - cos * cy];
  },
  apply: (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]],
};

const degreesOf = (transform) => Number(/rotate\((-?[\d.]+)deg\)/.exec(transform)[1]);
const offsetOf = (transform) => /translate\((-?[\d.]+)(?:px)?,\s*(-?[\d.]+)(?:px)?\)/
  .exec(transform).slice(1, 3).map(Number);

// where the glint ends up, and where the iris it belongs to ended up with it
const glintOnScreen = (eye) => {
  const toLens = affine.mul(
    affine.rotate(degreesOf(eye.querySelector('.eye-rotation').style.transform), 50, 50),
    affine.translate(...offsetOf(eye.querySelector('.lens > g').style.transform)));
  const matrix = affine.mul(affine.mul(
    toLens,
    affine.rotate(degreesOf(eye.querySelector('.catchlight-frame').style.transform), 50, 50)),
    affine.translate(...offsetOf(eye.querySelector('.catchlight').getAttribute('transform'))));
  const centre = affine.apply(matrix, [0, 0]);
  const iris = affine.apply(toLens, [50, 50]);
  return {
    centre,
    // how the glint sits against the iris it lights: this is what has to hold
    // still on the screen's axes however far the eye turns
    offset: [centre[0] - iris[0], centre[1] - iris[1]],
    // the shape's own orientation and scale: [1, 0, 0, 1] is screen-aligned
    shape: matrix.slice(0, 4),
  };
};

describe('Eye catchlight under rotation', () => {
  const glintOf = (props) => {
    const { container } = render(
      <Eye size={100} irisSize={60} catchlightSize={20} catchlightPosition={[-50, -60]} {...props} />
    );
    return glintOnScreen(container.querySelector('svg.cartoon-eye'));
  };

  const expectSameGlint = (turned, upright) => {
    expect(turned.offset[0]).toBeCloseTo(upright.offset[0], 6);
    expect(turned.offset[1]).toBeCloseTo(upright.offset[1], 6);
    [1, 0, 0, 1].forEach((identity, i) => expect(turned.shape[i]).toBeCloseTo(identity, 6));
  };

  it('takes the eye rotation back off the glint, around the centre of the lens', () => {
    const { container } = render(<Eye size={100} catchlightSize={20} rotation={-45} />);
    const frame = container.querySelector('.catchlight-frame');
    expect(frame.style.transform).toBe('rotate(45deg)');
    // around the lens centre, not the glint's own: turning it on the spot would
    // leave its position orbiting the iris as the eye tilts
    expect(frame.style.transformOrigin).toBe('center');
  });

  it('holds the glint on the global axes at any angle, either way', () => {
    const upright = glintOf({});
    [-180, -90, -37, 12, 60, 145, 540].forEach((rotation) => {
      expectSameGlint(glintOf({ rotation }), upright);
    });
  });

  it('still travels with the lens while the eye is turned', () => {
    const still = glintOf({ lensPosition: [0, 0] });
    const looking = glintOf({ lensPosition: [80, -60] });
    // the glint follows the iris ...
    expect(looking.centre).not.toEqual(still.centre);
    // ... keeping the same place on it, upright or turned
    expectSameGlint(looking, still);
    expectSameGlint(glintOf({ lensPosition: [80, -60], rotation: 65 }), still);
    expectSameGlint(glintOf({ lensPosition: [-100, 100], rotation: -65 }), still);
  });

  it('keeps an elliptical glint upright as the eye turns', () => {
    const flat = { irisWidth: 80, irisHeight: 40, catchlightWidth: 25, catchlightHeight: 50 };
    const upright = glintOf({ ...flat, rotation: 0 });
    const turned = glintOf({ ...flat, rotation: 70 });
    expectSameGlint(turned, upright);
    // the drawn ellipse is the same one either way: only the eye under it turned
    const radii = (rotation) => {
      const { container } = render(<Eye size={100} {...flat} rotation={rotation} />);
      const glint = container.querySelector('.catchlight');
      return [glint.getAttribute('rx'), glint.getAttribute('ry')];
    };
    expect(radii(70)).toEqual(radii(0));
  });

  it('measures against the full outer iris however far the eye turns', () => {
    // the limbus is taken out of the iris, so it moves and sizes nothing here
    expectSameGlint(glintOf({ rotation: 33, limbusThickness: 45 }), glintOf({}));
  });

  it('animates the counter-rotation on the eye rotation own timing', () => {
    const { container } = render(
      <Eye size={100} catchlightSize={20} rotation={120} rotationSpeed={400} />
    );
    // same duration and easing, so the two cancel out at every frame of a spin
    expect(container.querySelector('.catchlight-frame').style.transition)
      .toBe(container.querySelector('.eye-rotation').style.transition);
    expect(container.querySelector('.catchlight-frame').style.transition).toContain('400ms');
  });

  it('holds both glints of a pair on the same global axes', () => {
    const { container } = render(
      <EyePair size={100} irisSize={60} catchlightSize={20} catchlightPosition={[-50, -60]}
        rotation={10} eyeRotation={25} />
    );
    const [left, right] = [...container.querySelectorAll('svg.cartoon-eye')].map(glintOnScreen);
    // the eyes are splayed apart (-15 and 35 degrees), and neither glint moved
    // with them: both sit up and to the left, as one light source would leave them
    expect([...container.querySelectorAll('.eye-rotation')].map((g) => g.style.transform))
      .toEqual(['rotate(-15deg)', 'rotate(35deg)']);
    expect(right.offset[0]).toBeCloseTo(left.offset[0], 6);
    expect(right.offset[1]).toBeCloseTo(left.offset[1], 6);
    expect(left.offset[0]).toBeLessThan(0);
    expect(left.offset[1]).toBeLessThan(0);
    [left, right].forEach((glint) => {
      [1, 0, 0, 1].forEach((identity, i) => expect(glint.shape[i]).toBeCloseTo(identity, 6));
    });
  });
});

describe('Eye eyeliner', () => {
  it('renders no eyeliner by default', () => {
    const { container } = render(<Eye size={100} />);
    expect(container.querySelector('.upper-eyeliner')).toBeNull();
    expect(container.querySelector('.lower-eyeliner')).toBeNull();
  });

  it('hangs the upper liner off the lid it belongs to, with no seam between them', () => {
    const { container } = render(
      <Eye size={100} scleraHeight={60} lidSize={20} eyelinerSize={10} />
    );
    const lid = container.querySelector('.upper-lid');
    const liner = container.querySelector('.upper-eyeliner');
    // the liner starts where the lid starts and runs 10% of the sclera half-height
    // (30 * 10% = 3) past its bottom edge, so the lid covers all but the overhang
    expect(liner.getAttribute('y')).toBe(lid.getAttribute('y'));
    expect(liner.getAttribute('height')).toBe('33');
    expect(lid.getAttribute('height')).toBe('30');
  });

  it('sits the lower liner on top of the lower lid', () => {
    const { container } = render(
      <Eye size={100} scleraHeight={60} lidSize={20} eyelinerSize={10} />
    );
    const lid = container.querySelector('.lower-lid');
    const liner = container.querySelector('.lower-eyeliner');
    expect(Number(liner.getAttribute('y'))).toBe(Number(lid.getAttribute('y')) - 3);
    expect(liner.getAttribute('height')).toBe('33');
  });

  it('is filled geometry that moves and clips with the lids', () => {
    const { container } = render(<Eye size={100} eyelinerSize={10} eyelinerColor='#123456' blinkSpeed={120} />);
    const liner = container.querySelector('.upper-eyeliner');
    expect(liner.tagName.toLowerCase()).toBe('rect');
    expect(liner.getAttribute('fill')).toBe('#123456');
    expect(liner.getAttribute('stroke')).toBeNull();
    // same mask and same transition as the lid, so the two never come apart
    expect(liner.closest('.eyelids').getAttribute('mask'))
      .toBe(container.querySelector('.lens').getAttribute('mask'));
    expect(liner.style.transition).toBe(container.querySelector('.upper-lid').style.transition);
  });

  it('takes each side from the shared props, and lets a side override them', () => {
    const { container } = render(
      <Eye size={100} eyelinerSize={10} eyelinerColor='#111111'
        lowerEyelinerSize={20} lowerEyelinerColor='#222222' />
    );
    expect(container.querySelector('.upper-eyeliner').getAttribute('height')).toBe('55'); // 50 + 5
    expect(container.querySelector('.upper-eyeliner').getAttribute('fill')).toBe('#111111');
    expect(container.querySelector('.lower-eyeliner').getAttribute('height')).toBe('60'); // 50 + 10
    expect(container.querySelector('.lower-eyeliner').getAttribute('fill')).toBe('#222222');
  });
});

describe('Eye outline', () => {
  it('renders no outline by default', () => {
    const { container } = render(<Eye size={100} />);
    expect(container.querySelector('.eye-outline')).toBeNull();
  });

  it('draws the ring as one evenodd path holding the outer and inner ellipses', () => {
    const { container } = render(
      <Eye size={100} scleraWidth={80} scleraHeight={60} eyeOutlineThickness={10}
        eyeOutlineColor='#123456' />
    );
    const outline = container.querySelector('.eye-outline');
    expect(outline.tagName.toLowerCase()).toBe('path');
    expect(outline.getAttribute('fill')).toBe('#123456');
    expect(outline.getAttribute('fill-rule')).toBe('evenodd');
    // no stroke: the ring is the hollow area between the two ellipse subpaths
    expect(outline.getAttribute('stroke')).toBeNull();
    // taken out of each sclera radius in turn, so an elliptical eye keeps its shape
    expect(outline.getAttribute('d'))
      .toBe('M -40 0 A 40 30 0 1 0 40 0 A 40 30 0 1 0 -40 0 Z '
        + 'M -36 0 A 36 27 0 1 0 36 0 A 36 27 0 1 0 -36 0 Z');
  });

  it('leaves the sclera and the lids at their own size, framing them last', () => {
    const { container } = render(
      <Eye size={100} scleraWidth={80} scleraHeight={60} eyeOutlineThickness={10} />
    );
    const sclera = container.querySelector('.sclera');
    expect(sclera.getAttribute('rx')).toBe('40'); // unchanged by the outline
    expect(sclera.getAttribute('ry')).toBe('30');
    const drawn = [...container.querySelector('.eye').children].map((el) => el.getAttribute('class'));
    expect(drawn).toEqual(['sclera', 'lens', 'eyelids', 'eye-outline']);
  });
});

describe('Eye rotation', () => {
  it('rotates the whole eye around the centre of the drawing area', () => {
    const { container } = render(<Eye size={100} rotation={-45} />);
    const rotationGroup = container.querySelector('.eye-rotation');
    expect(rotationGroup.style.transform).toBe('rotate(-45deg)');
    expect(rotationGroup.style.transformOrigin).toBe('center');
  });

  it('keeps rotation off the blink squeeze so each animates on its own timing', () => {
    const { container } = render(<Eye size={100} rotation={30} rotationSpeed={400} />);
    const rotationGroup = container.querySelector('.eye-rotation');
    const eye = rotationGroup.querySelector('.eye');
    expect(rotationGroup.style.transition).toContain('400ms');
    // the squeeze lives on the inner group, so it stays along the eye's own axis
    expect(eye.style.transform).toBe('scaleY(1)');
  });

  it('accepts angles beyond a full turn so a spin can be animated', () => {
    const { container } = render(<Eye size={100} rotation={900} />);
    expect(container.querySelector('.eye-rotation').style.transform).toBe('rotate(900deg)');
  });
});

describe('Eye masking', () => {
  it('gives each instance a unique mask ID referenced by its own groups', () => {
    const { container } = render(
      <div>
        <Eye size={100} />
        <Eye size={100} />
      </div>
    );
    const masks = container.querySelectorAll('mask');
    expect(masks).toHaveLength(2);
    expect(masks[0].id).not.toBe(masks[1].id);

    const eyes = container.querySelectorAll('svg.cartoon-eye');
    eyes.forEach((eye, i) => {
      const expected = `url(#${masks[i].id})`;
      expect(eye.querySelector('.lens').getAttribute('mask')).toBe(expected);
      expect(eye.querySelector('.eyelids').getAttribute('mask')).toBe(expected);
    });
  });

  it('keeps the mask ellipse white even for a dark scleraColor', () => {
    const { container } = render(<Eye size={100} scleraColor='#000000' />);
    expect(container.querySelector('.sclera').getAttribute('fill')).toBe('#000000');
    // the mask is luminance-based: a dark fill would hide the iris and lids
    expect(container.querySelector('mask ellipse').getAttribute('fill')).toBe('#ffffff');
  });
});

describe('Eye timers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('clears blink and lens-movement timers on unmount', () => {
    vi.useFakeTimers();
    const { unmount } = render(<Eye size={100} blinking blinkSqueeze lensMovement />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('Eye controlled blinking', () => {
  it('follows blinkClosed instead of its own clock, and runs no timer of its own', () => {
    vi.useFakeTimers();
    const shut = render(<Eye size={100} scleraHeight={60} lidSize={20} blinking blinkClosed blinkSqueeze />);
    // lids fully down and the eye squashed, without a blink timer anywhere
    expect(shut.container.querySelector('.upper-lid').getAttribute('y')).toBe('20');
    expect(shut.container.querySelector('.eye').style.transform).toBe('scaleY(0.6)');
    expect(vi.getTimerCount()).toBe(0);

    const open = render(<Eye size={100} scleraHeight={60} lidSize={20} blinking blinkClosed={false} />);
    expect(open.container.querySelector('.upper-lid').getAttribute('y')).toBe('-4');
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});

describe('EyePair', () => {
  const pairOf = (container) => container.querySelectorAll('svg.cartoon-eye');

  it('renders two eyes and hands them the shared props', () => {
    const { container } = render(
      <EyePair size={100} scleraWidth={80} irisColor='#123456' pupilSize={40} />
    );
    const eyes = pairOf(container);
    expect(eyes).toHaveLength(2);
    eyes.forEach((eye) => {
      expect(eye.querySelector('.sclera').getAttribute('rx')).toBe('40');
      expect(eye.querySelector('.iris').getAttribute('fill')).toBe('#123456');
      expect(eye.getAttribute('width')).toBe('100');
      expect(eye.getAttribute('height')).toBe('100');
    });
  });

  it('lets a per-eye override replace any shared prop, one eye at a time', () => {
    const { container } = render(
      <EyePair size={100} irisColor='#123456' irisSize={60}
        leftEye={{ irisColor: '#abcdef' }} rightEye={{ irisSize: 80, size: 60 }} />
    );
    const [left, right] = pairOf(container);
    expect(left.querySelector('.iris').getAttribute('fill')).toBe('#abcdef');
    expect(left.querySelector('.iris').getAttribute('rx')).toBe('30'); // shared irisSize
    expect(right.querySelector('.iris').getAttribute('fill')).toBe('#123456');
    expect(right.querySelector('.iris').getAttribute('rx')).toBe('40'); // 50 * 80%
    // an override sizes its own eye the way Eye does, `size` filling in both axes
    expect(right.getAttribute('width')).toBe('60');
    expect(right.getAttribute('height')).toBe('60');
  });

  it('keeps its own props off the eyes', () => {
    const { container } = render(
      <EyePair size={100} gap={30} eyeRotation={10}
        leftEye={{ irisColor: '#111111' }} rightEye={{ irisColor: '#222222' }} title='A pair of eyes' />
    );
    ['gap', 'eyeRotation', 'eyerotation', 'leftEye', 'lefteye', 'rightEye', 'righteye']
      .forEach((attribute) => {
        expect(container.querySelector(`svg[${attribute}]`)).toBeNull();
      });
    // the accessible name belongs to the pair, not to either eye
    const pair = container.querySelector('.cartoon-eye-pair');
    expect(pair.getAttribute('role')).toBe('img');
    expect(pair.getAttribute('aria-label')).toBe('A pair of eyes');
    expect(container.querySelector('svg title')).toBeNull();
  });

  it('sets the gap as a share of the nominal eye size', () => {
    // the gap is set on the second eye, so it can go negative where the sclera
    // leaves slack inside its box
    const px = (props) => {
      const { container } = render(<EyePair size={200} {...props} />);
      return [...pairOf(container)][1].style.marginInlineStart;
    };
    expect(px({ gap: 20 })).toBe('40px'); // 20% of 200
    expect(px({ gap: 100 })).toBe('200px'); // a whole eye between the two
    expect(px({ gap: 0 })).toBe('0px');
    // measured between the eyes, not between their boxes: a sclera 80% of its
    // box leaves 10% of an eye down each inner side, and both come off the gap
    expect(px({ gap: 20, scleraWidth: 80 })).toBe('0px');
    expect(px({ gap: 0, scleraWidth: 80 })).toBe('-40px');
    // an override's own sclera (and its own size) counts for its eye alone
    expect(px({ gap: 10, scleraWidth: 80, rightEye: { scleraWidth: 100 } })).toBe('0px');
    // ... so a pair sized in any CSS unit keeps the same proportions
    const { container } = render(<EyePair size='10rem' gap={50} />);
    expect([...pairOf(container)][1].style.marginInlineStart).toMatch(/^calc\(/);
  });

  it('mirrors eyeRotation outwards, on top of any shared rotation', () => {
    const rotations = (props) => {
      const { container } = render(<EyePair size={100} {...props} />);
      return [...pairOf(container)].map((eye) => eye.querySelector('.eye-rotation').style.transform);
    };
    expect(rotations({ eyeRotation: 12 })).toEqual(['rotate(-12deg)', 'rotate(12deg)']);
    expect(rotations({ eyeRotation: -12 })).toEqual(['rotate(12deg)', 'rotate(-12deg)']);
    // a shared rotation turns both the same way; the mirrored tilt adds to it
    expect(rotations({ rotation: 30, eyeRotation: 10 })).toEqual(['rotate(20deg)', 'rotate(40deg)']);
    // and an override still takes full control of one eye
    expect(rotations({ eyeRotation: 10, leftEye: { rotation: 90 } }))
      .toEqual(['rotate(90deg)', 'rotate(10deg)']);
  });

  it('has no pairRotation left, and ignores one from an older version', () => {
    const { container } = render(<EyePair size={100} rotationSpeed={400} pairRotation={-15} />);
    // the wrapper is plain layout again: only the eyes rotate
    const pair = container.querySelector('.cartoon-eye-pair');
    expect(pair.style.transform).toBe('');
    expect(pair.style.transition).toBe('');
    [...pairOf(container)].forEach((eye) => {
      expect(eye.querySelector('.eye-rotation').style.transform).toBe('rotate(0deg)');
      // ... and the obsolete prop reaches neither the eyes nor the markup
      expect(eye.querySelector('.eye-rotation').style.transition).toContain('400ms');
    });
    expect(container.querySelector('[pairRotation], [pairrotation]')).toBeNull();
  });

  it('shares the gaze without mirroring it', () => {
    const { container } = render(
      <EyePair size={100} scleraWidth={100} irisSize={60} lensPosition={[100, -50]} />
    );
    const [left, right] = [...pairOf(container)].map((eye) => eye.querySelector('.lens > g').style.transform);
    // both irises travel the same way: a pair looking right looks right
    expect(left).toBe(right);
    expect(left).toBe('translate(20px,-10px)');
  });

  it('wanders as one pair, on a single timer', () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<EyePair size={100} lensMovement />);
    // one wander for the pair, not one per eye
    expect(vi.getTimerCount()).toBe(1);
    act(() => { vi.advanceTimersByTime(1000); });
    const [left, right] = [...pairOf(container)].map((eye) => eye.querySelector('.lens > g').style.transform);
    expect(left).toBe(right);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it('blinks both eyes on one clock, and lets an override step out of it', () => {
    vi.useFakeTimers();
    const { container, unmount } = render(
      <EyePair size={100} scleraHeight={60} lidSize={20} blinking blinkSpeed={100} blinkSqueeze />
    );
    // one blink interval and its pending timeout for the pair, and nothing per eye
    expect(vi.getTimerCount()).toBe(2);
    const lidY = () => [...pairOf(container)].map((eye) => eye.querySelector('.upper-lid').getAttribute('y'));
    expect(lidY()).toEqual(['20', '20']); // both shut, in step
    [...pairOf(container)].forEach((eye) => {
      expect(eye.querySelector('.eye').style.transform).toBe('scaleY(0.6)');
    });
    act(() => { vi.advanceTimersByTime(100); });
    expect(lidY()).toEqual(['-4', '-4']); // ... and both open again
    unmount();
    expect(vi.getTimerCount()).toBe(0);

    // an eye whose override touches the blink keeps its own clock instead
    const own = render(
      <EyePair size={100} blinking blinkFrequency={5000} rightEye={{ blinking: false }} />
    );
    expect(own.container.querySelectorAll('.upper-lid')[0].getAttribute('y')).toBe('0');
    expect(own.container.querySelectorAll('.upper-lid')[1].getAttribute('y')).toBe('-40');
    own.unmount();
    vi.useRealTimers();
  });

  it('lets one eye keep its own gaze while the other follows the pair', () => {
    const { container } = render(
      <EyePair size={100} irisSize={60} lensPosition={[0, 0]} rightEye={{ lensPosition: [100, 0] }} />
    );
    const [left, right] = [...pairOf(container)].map((eye) => eye.querySelector('.lens > g').style.transform);
    expect(left).toBe('translate(0px,0px)');
    expect(right).toBe('translate(20px,0px)');
  });

  it('carries every eye feature through to both eyes', () => {
    const { container } = render(
      <EyePair size={100} scleraWidth={80} scleraHeight={60}
        irisWidth={70} irisHeight={40} limbusThickness={10} limbusColor='#654321'
        catchlightSize={20} eyelinerSize={8} eyeOutlineThickness={5}
        pupilWidth={20} pupilHeight={80} />
    );
    const eyes = pairOf(container);
    expect(eyes).toHaveLength(2);
    eyes.forEach((eye) => {
      expect(eye.querySelector('.limbus').getAttribute('fill')).toBe('#654321');
      expect(eye.querySelector('.catchlight')).not.toBeNull();
      expect(eye.querySelector('.upper-eyeliner')).not.toBeNull();
      expect(eye.querySelector('.lower-eyeliner')).not.toBeNull();
      expect(eye.querySelector('.eye-outline')).not.toBeNull();
      // elliptical shapes scale against each axis of their own parent
      expect(eye.querySelector('.iris').getAttribute('rx')).toBe('25.2'); // 40 * 70% * 90%
      expect(Number(eye.querySelector('.pupil').getAttribute('rx'))).toBeCloseTo(5.6); // 28 * 20%
    });
  });

  it('gives each eye of the pair its own mask ID', () => {
    const { container } = render(<EyePair size={100} />);
    const masks = container.querySelectorAll('mask');
    expect(masks).toHaveLength(2);
    expect(masks[0].id).not.toBe(masks[1].id);
    pairOf(container).forEach((eye, i) => {
      expect(eye.querySelector('.lens').getAttribute('mask')).toBe(`url(#${masks[i].id})`);
    });
  });

  it('puts className and style on the pair, not on the eyes', () => {
    const { container } = render(
      <EyePair size={100} className='mascot' style={{ display: 'flex', opacity: 0.5 }} />
    );
    const pair = container.querySelector('.cartoon-eye-pair');
    expect(pair.classList.contains('mascot')).toBe(true);
    // a style of its own can replace the pair's own layout defaults
    expect(pair.style.display).toBe('flex');
    expect(pair.style.opacity).toBe('0.5');
    pairOf(container).forEach((eye) => {
      expect(eye.classList.contains('mascot')).toBe(false);
    });
  });
});

describe('EyePair gaze overrides', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const lensOf = (container) => [...container.querySelectorAll('svg.cartoon-eye')]
    .map((eye) => eye.querySelector('.lens > g').style.transform);

  // every wander picks the same corner, so where an eye ends up says whose clock
  // it is on: the slack is 20 units either way, and 72% of it is 14.4
  const oneCorner = () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // randomNumber(-90, 90) -> 72
  };

  it('shares the wander with both eyes when neither overrides its gaze', () => {
    oneCorner();
    const { container } = render(<EyePair size={100} irisSize={60} lensMovement />);
    expect(vi.getTimerCount()).toBe(1); // one wander for the pair
    act(() => { vi.advanceTimersByTime(1000); });
    expect(lensOf(container)).toEqual(['translate(14.4px,14.4px)', 'translate(14.4px,14.4px)']);
  });

  it('fixes an eye that overrides only its position, without setting it wandering', () => {
    oneCorner();
    const { container } = render(
      <EyePair size={100} irisSize={60} lensMovement rightEye={{ lensPosition: [100, 0] }} />
    );
    // the shared lensMovement is not inherited by the eye that opted out: the
    // pair's own wander is the only timer running
    expect(vi.getTimerCount()).toBe(1);
    expect(lensOf(container)).toEqual(['translate(0px,0px)', 'translate(20px,0px)']);
    act(() => { vi.advanceTimersByTime(5000); });
    // the left eye follows the pair; the right one has not moved at all
    expect(lensOf(container)).toEqual(['translate(14.4px,14.4px)', 'translate(20px,0px)']);
  });

  it('gives an eye a wander of its own when the override asks for one', () => {
    oneCorner();
    const { container } = render(
      <EyePair size={100} irisSize={60} lensMovement={2000} rightEye={{ lensMovement: 500 }} />
    );
    expect(vi.getTimerCount()).toBe(2); // the pair's, and the right eye's own
    act(() => { vi.advanceTimersByTime(500); });
    // the right eye is on its own faster clock, so it moves first
    expect(lensOf(container)).toEqual(['translate(0px,0px)', 'translate(14.4px,14.4px)']);
    act(() => { vi.advanceTimersByTime(1500); });
    expect(lensOf(container)).toEqual(['translate(14.4px,14.4px)', 'translate(14.4px,14.4px)']);
  });

  it('honours a position and a movement given together as one gaze', () => {
    oneCorner();
    const { container } = render(
      <EyePair size={100} irisSize={60} lensMovement
        leftEye={{ lensPosition: [-100, -100], lensMovement: 600 }} />
    );
    expect(vi.getTimerCount()).toBe(2);
    // the left eye starts where its override put it, then wanders on its own
    expect(lensOf(container)).toEqual(['translate(-20px,-20px)', 'translate(0px,0px)']);
    act(() => { vi.advanceTimersByTime(600); });
    expect(lensOf(container)[0]).toBe('translate(14.4px,14.4px)');
  });

  it('lets an eye sit out the wander entirely', () => {
    oneCorner();
    const { container } = render(
      <EyePair size={100} irisSize={60} lensMovement lensPosition={[50, 50]}
        leftEye={{ lensMovement: false }} />
    );
    expect(vi.getTimerCount()).toBe(1);
    act(() => { vi.advanceTimersByTime(1000); });
    // the still eye keeps the pair's resting position while the other wanders
    expect(lensOf(container)).toEqual(['translate(10px,10px)', 'translate(14.4px,14.4px)']);
  });

  it('reads leftEye and rightEye the same way', () => {
    oneCorner();
    const left = render(
      <EyePair size={100} irisSize={60} lensMovement leftEye={{ lensPosition: [-100, 0] }} />
    );
    act(() => { vi.advanceTimersByTime(1000); });
    expect(lensOf(left.container)).toEqual(['translate(-20px,0px)', 'translate(14.4px,14.4px)']);
    left.unmount();

    const right = render(
      <EyePair size={100} irisSize={60} lensMovement rightEye={{ lensPosition: [-100, 0] }} />
    );
    act(() => { vi.advanceTimersByTime(1000); });
    expect(lensOf(right.container)).toEqual(['translate(14.4px,14.4px)', 'translate(-20px,0px)']);
  });
});
