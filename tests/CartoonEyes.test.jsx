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
    expect(drawn).toEqual(['iris', 'pupil', 'catchlight']);
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
      <EyePair size={100} gap={30} eyeRotation={10} pairRotation={5}
        leftEye={{ irisColor: '#111111' }} rightEye={{ irisColor: '#222222' }} title='A pair of eyes' />
    );
    ['gap', 'eyeRotation', 'eyerotation', 'pairRotation', 'pairrotation', 'leftEye', 'lefteye', 'rightEye', 'righteye']
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
    const px = (gap) => {
      const { container } = render(<EyePair size={200} gap={gap} />);
      return container.querySelector('.cartoon-eye-pair').style.columnGap;
    };
    expect(px(20)).toBe('40px'); // 20% of 200
    expect(px(100)).toBe('200px'); // a whole eye between the two
    expect(px(0)).toBe('0px');
    // ... so a pair sized in any CSS unit keeps the same proportions
    const { container } = render(<EyePair size='10rem' gap={50} />);
    expect(container.querySelector('.cartoon-eye-pair').style.columnGap).toMatch(/^calc\(/);
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

  it('turns the whole pair with pairRotation, leaving the eyes upright', () => {
    const { container } = render(<EyePair size={100} pairRotation={-15} rotationSpeed={400} />);
    const pair = container.querySelector('.cartoon-eye-pair');
    expect(pair.style.transform).toBe('rotate(-15deg)');
    expect(pair.style.transformOrigin).toBe('center');
    expect(pair.style.transition).toContain('400ms');
    [...pairOf(container)].forEach((eye) => {
      expect(eye.querySelector('.eye-rotation').style.transform).toBe('rotate(0deg)');
      // the eyes still get the shared rotation speed for their own tilts
      expect(eye.querySelector('.eye-rotation').style.transition).toContain('400ms');
    });
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
