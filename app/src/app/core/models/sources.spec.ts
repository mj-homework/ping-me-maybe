import { sourceName } from './sources';

describe('sourceName', () => {
  it('returns the display name of a known source', () => {
    expect(sourceName('reddit-nottheonion')).toBe('Reddit r/nottheonion');
  });

  it('returns an unknown ID as it is', () => {
    expect(sourceName('cnn')).toBe('cnn');
  });
});
