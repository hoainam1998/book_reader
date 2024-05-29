import { Children } from 'react';
import './style.scss';

type SelectProps = {
  options: { label: string | number, value: string }[];
  children: React.ReactElement;
};

function Select({ options, children }: SelectProps): JSX.Element {
  const optionSlot: React.ReactElement = Children.only(children);
  console.log(optionSlot);
  return (
    <>
      <label htmlFor="cars">Choose a car:</label>
      <select name="cars" id="cars">
        {
          options.map(option => optionSlot.props.render(option))
        }
      </select>
    </>
  );
}

export default Select;
