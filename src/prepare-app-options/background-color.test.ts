import {backgroundColors} from './background-color';

describe('backgroundColor', () => {
  it('returns background colors', () => {
    expect(backgroundColors('image/jpeg', '#FF00FF')).toEqual(['#FF00FF']);
  });

  it('returns background in rgba form', () => {
    expect(backgroundColors('image/jpeg', 'rgb(255, 255, 255)')).toEqual([
      'rgb(255, 255, 255)',
    ]);
  });

  it('returns default background color for jpg', () => {
    expect(backgroundColors('image/jpeg')).toEqual(['rgba(255, 255, 255, 1)']);
  });

  it('returns default background color for png', () => {
    expect(backgroundColors('image/png')).toEqual(['rgba(255, 255, 255, 0)']);
  });

  it('returns a list of colours for jpg', () => {
    expect(backgroundColors('image/jpeg', '#FF00FF,#CAFE00')).toEqual([
      '#FF00FF',
      '#CAFE00',
    ]);
  });

  it('returns a list of colours for png', () => {
    expect(backgroundColors('image/png', '#FF00FF,#CAFE00')).toEqual([
      '#FF00FF',
      '#CAFE00',
    ]);
  });

  it('returns a list of colours for jpg with whitespace after', () => {
    expect(backgroundColors('image/jpeg', '#FF00FF,  \t #CAFE00')).toEqual([
      '#FF00FF',
      '#CAFE00',
    ]);
  });

  it('returns a list of colours for jpg with whitespace before and after', () => {
    expect(backgroundColors('image/jpeg', '#FF00FF  \t ,  \t #CAFE00')).toEqual(
      ['#FF00FF', '#CAFE00'],
    );
  });
});
