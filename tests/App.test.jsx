import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// a smoke test for the playground itself: the presets must reach the hero eye and
// the generated snippet, which is where a broken config key would show up first
describe('playground', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
      matches: false, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })));
  });

  it('drives the new features from the presets, hero eye and snippet alike', () => {
    const { container } = render(<App />);
    // the hero eye is the first one on the page; the rest are preset previews
    const hero = () => container.querySelectorAll('.cartoon-eye')[0];
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
    const code = container.querySelector('pre').textContent;
    expect(code).toContain('eyeOutlineThickness={6}');
    expect(code).toContain('eyeOutlineColor=');
    expect(code).toContain('catchlightSize={14}');
    expect(code).toContain('catchlightPosition={[-45, -55]}');
  });
});
