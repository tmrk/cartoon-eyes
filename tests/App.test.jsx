import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../src/App';

// a smoke test for the playground itself: the presets must reach the stage and
// the generated snippet, which is where a broken config key would show up first.
// jsdom answers every media query with `false`, so `useMediaQuery(up('md'))`
// would drop the studio into its phone layout; the stub below opts the tests
// into the desktop one, which is the layout that carries every control
describe('playground', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
      matches: /min-width/.test(query), media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })));
  });

  // the stage is the only part of the studio that draws a full-size eye; the
  // preset rail's previews sit inside their own buttons
  const stage = () => document.querySelector('.eye-stage');
  const code = () => screen.getByRole('tabpanel').textContent;
  const inspector = () => screen.getByRole('group', { name: 'Jump to settings' });
  const openTab = (name) => fireEvent.click(within(inspector()).getByRole('button', { name: new RegExp(`^${name}`) }));
  const openCodeTab = (name) => fireEvent.click(screen.getByRole('tab', { name }));

  it('drives the eye features from the presets, stage and snippet alike', () => {
    render(<App />);
    const hero = () => stage().querySelector('.cartoon-eye');
    // the default eye now shows off every optional part at once
    expect(hero().querySelector('.catchlight')).not.toBeNull();
    expect(hero().querySelector('.upper-eyeliner')).not.toBeNull();
    expect(hero().querySelector('.eye-outline')).not.toBeNull();
    expect(hero().querySelector('.limbus')).not.toBeNull();

    // the presets are built on the plain eye, so they switch parts back off
    fireEvent.click(screen.getByRole('button', { name: /^Snake$/ }));
    expect(hero().querySelector('.eye-outline')).toBeNull();
    expect(hero().querySelector('.upper-eyeliner')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^Cat$/ }));
    expect(hero().querySelector('.catchlight')).not.toBeNull();
    expect(hero().querySelector('.upper-eyeliner')).not.toBeNull();
    expect(hero().querySelector('.lower-eyeliner')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^Frog$/ }));
    expect(code()).toContain('eyeOutlineThickness={6}');
    expect(code()).toContain('eyeOutlineColor=');
    expect(code()).toContain('catchlightSize={14}');
    expect(code()).toContain('catchlightPosition={[-45, -55]}');
  });

  it('keeps every setting in one scroller, with the tabs jumping into it', () => {
    render(<App />);
    const tabs = within(inspector()).getAllByRole('button').map((tab) => tab.textContent);
    expect(tabs).toEqual(['Shape', 'Iris', 'Shine', 'Lids', 'Motion', 'Pair']);

    // nothing is hidden behind a tab any more: every group is on the page at
    // once, and the repeated labels ("Upper", "Colour") get names of their own
    expect(screen.getByRole('slider', { name: 'Tilt' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Blink speed' })).toBeTruthy();
    expect(screen.getByRole('group', { name: /^Catchlight position/ })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Upper lid size' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Upper eyeliner size' })).toBeTruthy();

    // a tab marks itself as the section in view
    openTab('Motion');
    expect(within(inspector()).getByRole('button', { name: /^Motion/ }).getAttribute('aria-current')).toBe('true');
  });

  it('links width and height until the lock is opened', () => {
    render(<App />);
    const lock = screen.getByRole('button', { name: 'Lock Iris width and height together' });
    // the default iris is a circle, so the two axes start out linked
    expect(lock.getAttribute('aria-pressed')).toBe('true');
    expect(code()).toContain('irisSize={76}');

    fireEvent.click(lock);
    expect(lock.getAttribute('aria-pressed')).toBe('false');
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Iris width' }), { key: 'ArrowRight' });
    expect(code()).toContain('irisWidth={77}');
    expect(code()).toContain('irisHeight={76}');
  });

  it('puts a value back with its reset dot', () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Reset Tilt' })).toBeNull();

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Tilt' }), { key: 'ArrowRight' });
    expect(code()).toContain('rotation={1}');

    fireEvent.click(screen.getByRole('button', { name: 'Reset Tilt' }));
    expect(code()).not.toContain('rotation=');
  });

  it('names the parts on the canvas and jumps to their settings', () => {
    render(<App />);
    const limbus = screen.getByRole('button', { name: 'Limbus' });
    fireEvent.click(limbus);
    expect(within(inspector()).getByRole('button', { name: /^Iris/ }).getAttribute('aria-current')).toBe('true');

    // the labels only make sense over a single eye
    fireEvent.click(screen.getByRole('button', { name: 'Part labels' }));
    expect(screen.queryByRole('button', { name: 'Limbus' })).toBeNull();
  });

  it('aims the eye from the gaze pad while it is still', () => {
    render(<App />);
    // the demo starts still, so the pad takes a hand straight away
    const pad = screen.getByRole('group', { name: /^Eye position/ });
    expect(pad.getAttribute('aria-disabled')).toBeNull();
    fireEvent.keyDown(pad, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(pad, { key: 'ArrowUp' });
    expect(screen.getByRole('group', { name: 'Eye position: 10, -1' })).toBeTruthy();

    // ... and reports, read-only, once the eye moves itself
    fireEvent.click(screen.getByRole('button', { name: 'Wander' }));
    expect(screen.getByRole('group', { name: /^Eye position/ }).getAttribute('aria-disabled')).toBe('true');
  });

  it('draws a pair with the real EyePair, and writes EyePair code for it', () => {
    render(<App />);
    expect(stage().querySelector('.cartoon-eye-pair')).toBeNull();
    expect(code()).toContain('<Eye');

    fireEvent.click(screen.getByRole('button', { name: '2 eyes' }));
    const pair = stage().querySelector('.cartoon-eye-pair');
    expect(pair).not.toBeNull();
    expect(pair.querySelectorAll('.cartoon-eye')).toHaveLength(2);
    expect(code()).toContain("import { EyePair } from 'cartoon-eyes'");
    expect(code()).toContain('<EyePair');
  });

  it('takes the pair presets, mirrored tilt and translucent glint through the stage', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /^Googly$/ }));
    const eyes = stage().querySelectorAll('.cartoon-eye');
    expect(eyes).toHaveLength(2);
    // the 8-digit catchlight colour arrives as a fill and its own opacity
    const glint = eyes[0].querySelector('.catchlight');
    expect(glint.getAttribute('fill')).toBe('#FFFFFF');
    expect(Number(glint.getAttribute('fill-opacity'))).toBeCloseTo(0.8);
    expect(code()).toContain('gap={10}');
    expect(code()).toContain("catchlightColor='#FFFFFFCC'");

    fireEvent.click(screen.getByRole('button', { name: /^Owl$/ }));
    // positive eyeRotation splays the two eyes outwards
    const tilts = [...stage().querySelectorAll('.eye-rotation')].map((g) => g.style.transform);
    expect(tilts).toEqual(['rotate(-8deg)', 'rotate(8deg)']);
    expect(code()).toContain('eyeRotation={8}');
    expect(code()).toContain('gap={6}');
  });

  it('demonstrates the per-eye overrides, colour and gaze alike', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Googly$/ }));
    fireEvent.click(screen.getByRole('switch', { name: /Odd right eye/i }));

    const irises = [...stage().querySelectorAll('.iris')].map((iris) => iris.getAttribute('fill'));
    expect(irises[0]).not.toBe(irises[1]);
    expect(code()).toMatch(/rightEye=\{\{ irisColor: '#[0-9A-F]{6}' \}\}/);

    // the gaze override is the one that used to inherit the pair's wander: here
    // the right eye holds its own look while the pair keeps moving
    fireEvent.click(screen.getByRole('switch', { name: /Right eye looks away/i }));
    expect(code()).toMatch(/rightEye=\{\{ irisColor: '#[0-9A-F]{6}', lensPosition: \[100, 0\] \}\}/);
    const lenses = [...stage().querySelectorAll('.lens > g')].map((g) => g.style.transform);
    expect(lenses[0]).not.toBe(lenses[1]);
  });

  it('offers the pair from its own section while there is only one eye', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Show a pair' }));
    expect(stage().querySelectorAll('.cartoon-eye')).toHaveLength(2);
    expect(screen.getByRole('slider', { name: 'Gap' })).toBeTruthy();
  });

  it('writes lensMovement rather than a position the component would ignore', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Wander' }));
    // the wander is the Eye's own, so the snippet asks for it by name
    expect(code()).toContain('lensMovement');
    expect(code()).not.toContain('lensPosition');

    fireEvent.click(screen.getByRole('button', { name: 'Still' }));
    expect(code()).not.toContain('lensMovement');
  });

  it('reads the live drawing back out on the SVG tab', async () => {
    render(<App />);
    openCodeTab('SVG');
    await waitFor(() => expect(screen.getByRole('tabpanel').textContent).toContain('<svg'));
    const svg = screen.getByRole('tabpanel').textContent;
    expect(svg).toContain('class="sclera"');
    expect(svg).toContain('class="catchlight"');
  });

  it('counts the props the snippet writes', () => {
    render(<App />);
    const count = () => Number(screen.getByText(/props set$/).textContent.match(/\d+/)[0]);
    const before = count();
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Tilt' }), { key: 'ArrowRight' });
    expect(count()).toBe(before + 1);
  });
});
