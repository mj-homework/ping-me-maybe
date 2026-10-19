import { normalizeKeywords } from './rules';

describe('normalizeKeywords', () => {
  it('trims and lower-cases', () => {
    expect(normalizeKeywords(['  Earthquake ', 'FLOOD'])).toEqual(['earthquake', 'flood']);
  });

  it('drops empties', () => {
    expect(normalizeKeywords('a, , b,'.split(','))).toEqual(['a', 'b']);
  });

  it('removes duplicates after normalization', () => {
    expect(normalizeKeywords('Florida, florida '.split(','))).toEqual(['florida']);
  });

  it('keeps inner spaces in phrases', () => {
    expect(normalizeKeywords([' Climate Change '])).toEqual(['climate change']);
  });
});
