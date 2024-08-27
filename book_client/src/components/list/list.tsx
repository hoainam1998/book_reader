import { Fragment, JSX } from 'react';

type ListPropsType<T> = {
  items: T[];
  render: (item: T) => JSX.Element;
};

function List<T>({ items, render }: ListPropsType<T>): JSX.Element {
  return (
    <>
    {
      items.map((item, index) => (
        <Fragment key={index}>{ render(item) }</Fragment>
      ))
    }
    </>
  );
}

export default List;
