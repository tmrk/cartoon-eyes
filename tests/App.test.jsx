import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// a smoke test for the playground itself: the presets must reach the stage and
// the generated snippet, which is where a broken config key would show up first
describe('playground', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
      matches: false, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })));
  });

  // the stage is the card the expand toggle sits in; everything else that draws
  // an eye on the page is a preset preview
  const stage = () => screen.getByRole('button', { name: /the stage$/ }).closest('.MuiPaper-root');
  const code = (container) => container.querySelector('pre').textContent;

  it('drives the eye features from the presets, stage and snippet alike', () => {
    const { container } = render(<App />);
    const hero = () => stage().querySelector('.cartoon-eye');
    // the default eye leaves all three switched off
    expect(hero().querySelector('.catchlight')).toBeNull();
    expect(hero().querySelector('.upper-eyeliner')).toBeNull();
    expect(hero().querySelector('.eye-outline')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^Cat$/ }));
    expect(hero().querySelector('.catchlight')).not.toBeNull();
    expect(hero().querySelector('.upper-eyeliner')).not.toBeNull();
    expect(hero().querySelector('.lower-eyeliner')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^Surprised$/ }));
    expect(hero().querySelector('.eye-outline')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^Frog$/ }));
    expect(code(container)).toContain('eyeOutlineThickness={6}');
    expect(code(container)).toContain('eyeOutlineColor=');
    expect(code(container)).toContain('catchlightSize={14}');
    expect(code(container)).toContain('catchlightPosition={[-45, -55]}');
  });

  it('draws a pair with the real EyePair, and writes EyePair code for it', () => {
    const { container } = render(<App />);
    expect(stage().querySelector('.cartoon-eye-pair')).toBeNull();
    expect(code(container)).toContain('<Eye');

    fireEvent.click(screen.getByRole('button', { name: 'A pair' }));
    const pair = stage().querySelector('.cartoon-eye-pair');
    expect(pair).not.toBeNull();
    expect(pair.querySelectorAll('.cartoon-eye')).toHaveLength(2);
    expect(code(container)).toContain("import { EyePair } from 'cartoon-eyes'");
    expect(code(container)).toContain('<EyePair');
  });

  it('takes the pair presets, mirrored tilt and translucent glint through the stage', () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /^Googly$/ }));
    const eyes = stage().querySelectorAll('.cartoon-eye');
    expect(eyes).toHaveLength(2);
    // the 8-digit catchlight colour arrives as a fill and its own opacity
    const glint = eyes[0].querySelector('.catchlight');
    expect(glint.getAttribute('fill')).toBe('#FFFFFF');
    expect(Number(glint.getAttribute('fill-opacity'))).toBeCloseTo(0.8);
    expect(code(container)).toContain('gap={10}');
    expect(code(container)).toContain("catchlightColor='#FFFFFFCC'");

    fireEvent.click(screen.getByRole('button', { name: /^Owl$/ }));
    // positive eyeRotation splays the two eyes outwards
    const tilts = [...stage().querySelectorAll('.eye-rotation')].map((g) => g.style.transform);
    expect(tilts).toEqual(['rotate(-8deg)', 'rotate(8deg)']);
    expect(code(container)).toContain('eyeRotation={8}');
    expect(code(container)).toContain('gap={6}');
  });

  it('demonstrates a per-eye override as an odd right iris', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Googly$/ }));
    fireEvent.click(screen.getByRole('switch', { name: /Odd right eye/i }));

    const irises = [...stage().querySelectorAll('.iris')].map((iris) => iris.getAttribute('fill'));
    expect(irises[0]).not.toBe(irises[1]);
    expect(code(container)).toMatch(/rightEye=\{\{ irisColor: '#[0-9A-F]{6}' \}\}/);
  });
});
