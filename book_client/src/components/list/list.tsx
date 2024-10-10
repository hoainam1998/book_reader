/* eslint-disable no-unused-vars */
import { Fragment, JSX } from 'react';

type ListPropsType<T> = {
  items: T[];
  render: (item: T, index: number) => JSX.Element;
};

function List<T>({ items, render }: ListPropsType<T>): JSX.Element {
  const children: JSX.Element[] = items.map((item, index) => (
    <Fragment key={index}>{ render(item, index) }</Fragment>
  ));

  return (<>{children}</>);
}

export default List;
