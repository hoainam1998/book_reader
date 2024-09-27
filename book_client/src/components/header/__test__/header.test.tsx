import renderer from 'react-test-renderer';
import Header from '../header';

describe('Header', () => {
  it('header should render correctly', () => {
    const header = renderer.create(<Header />).toJSON();
    expect(header).toMatchSnapshot();
  });
});
