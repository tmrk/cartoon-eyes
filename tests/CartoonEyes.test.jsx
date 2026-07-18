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
