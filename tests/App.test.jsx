import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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
  const openTab = (name) => fireEvent.click(screen.getByRole('tab', { name }));
  const panel = () => screen.getByRole('tabpanel');

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

  it('groups the settings into tabs, with only one panel open at a time', () => {
    render(<App />);
    const tabs = screen.getAllByRole('tab').map((tab) => tab.textContent);
    expect(tabs).toEqual(['Shape', 'Iris', 'Shine', 'Lids', 'Motion', 'Pair']);

    // the shape panel opens first, and the others are not rendered beside it
    expect(within(panel()).getByRole('slider', { name: 'Rotation' })).toBeTruthy();
    expect(screen.queryByRole('slider', { name: 'Blink speed' })).toBeNull();

    openTab('Motion');
    expect(within(panel()).getByRole('slider', { name: 'Blink speed' })).toBeTruthy();
    expect(screen.queryByRole('slider', { name: 'Rotation' })).toBeNull();

    // every control still has a home: the tab it belongs to
    openTab('Iris');
    ['Width', 'Height', 'Thickness'].forEach((name) => {
      expect(within(panel()).getAllByRole('slider', { name }).length).toBeGreaterThan(0);
    });
    openTab('Shine');
    expect(within(panel()).getByRole('group', { name: /^Catchlight position/ })).toBeTruthy();
    openTab('Lids');
    expect(within(panel()).getAllByRole('slider', { name: 'Upper' })).toHaveLength(2);
  });

  it('aims the eye from the gaze pad while it is still', () => {
    render(<App />);
    // the pad reports the live position, and only takes a hand while the eye is still
    openTab('Motion');
    const wandering = within(panel()).getByRole('group', { name: /^Eye position/ });
    expect(wandering.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Still' }));
    const pad = within(panel()).getByRole('group', { name: /^Eye position/ });
    expect(pad.getAttribute('aria-disabled')).toBeNull();
    fireEvent.keyDown(pad, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(pad, { key: 'ArrowUp' });
    expect(within(panel()).getByRole('group', { name: 'Eye position: 10, -1' })).toBeTruthy();
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

  it('demonstrates the per-eye overrides, colour and gaze alike', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Googly$/ }));
    openTab('Pair');
    fireEvent.click(screen.getByRole('switch', { name: /Odd right eye/i }));

    const irises = [...stage().querySelectorAll('.iris')].map((iris) => iris.getAttribute('fill'));
    expect(irises[0]).not.toBe(irises[1]);
    expect(code(container)).toMatch(/rightEye=\{\{ irisColor: '#[0-9A-F]{6}' \}\}/);

    // the gaze override is the one that used to inherit the pair's wander: here
    // the right eye holds its own look while the pair keeps moving
    fireEvent.click(screen.getByRole('switch', { name: /Right eye looks away/i }));
    expect(code(container)).toMatch(/rightEye=\{\{ irisColor: '#[0-9A-F]{6}', lensPosition: \[100, 0\] \}\}/);
    const lenses = [...stage().querySelectorAll('.lens > g')].map((g) => g.style.transform);
    expect(lenses[0]).not.toBe(lenses[1]);
  });

  it('offers the pair from its own tab while there is only one eye', () => {
    render(<App />);
    openTab('Pair');
    fireEvent.click(within(panel()).getByRole('button', { name: 'Show a pair' }));
    expect(stage().querySelectorAll('.cartoon-eye')).toHaveLength(2);
    expect(within(panel()).getByRole('slider', { name: 'Gap' })).toBeTruthy();
  });

  it('writes lensMovement rather than a position the component would ignore', () => {
    const { container } = render(<App />);
    // the demo starts out wandering, which the Eye does for itself
    expect(code(container)).toContain('lensMovement');
    expect(code(container)).not.toContain('lensPosition');

    fireEvent.click(screen.getByRole('button', { name: 'Still' }));
    expect(code(container)).not.toContain('lensMovement');
  });
});
