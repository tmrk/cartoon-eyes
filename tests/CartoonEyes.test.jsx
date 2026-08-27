import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Eye } from '../src/components/src/CartoonEyes';

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
