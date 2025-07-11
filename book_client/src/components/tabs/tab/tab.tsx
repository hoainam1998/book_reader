import { Children, JSX, ReactElement, useCallback, useMemo } from 'react';
import { clsx } from 'utils';
import './style.scss';

type TabPropsType = {
  title: string;
  children: ReactElement | ReactElement[];
  order?: number;
  checked?: boolean;
  onSelectedValue?: () => void;
};

type TabHeaderPropsType = {
  title?: string;
  children?: ReactElement;
  render: (title: string) => ReactElement;
};

function TabHeader({ children }: TabHeaderPropsType): ReactElement {
  return children || <></>;
}

function Tab({ title, order, children, checked, onSelectedValue }: TabPropsType): JSX.Element {
  const onSelected = useCallback((): void => {
    if (onSelectedValue) {
      onSelectedValue();
    }
  }, [onSelectedValue]);

  const tabHeader = useMemo<ReactElement>(() => {
    const tabHeaderElement = (slot: ReactElement | null = null) => (
      <label className="tab-title">
        <input type="radio" name="tab" value={order} onChange={onSelected} />
        {slot ? slot : <span className="tab-title">{title}</span>}
      </label>
    );

    const header = Children.toArray(children)
      .find((child) => {
        const c = (child as ReactElement<any, any>);
        if (c.type && c.type.name === 'TabHeader') {
          return c;
        }
      });

    if (header) {
      const headerComponent = (header as ReactElement).props;
      if (headerComponent.children) {
        return tabHeaderElement(headerComponent.children);
      } else if (headerComponent.render) {
        return tabHeaderElement(headerComponent.render(title));
      }
      return tabHeaderElement();
    }
    return tabHeaderElement();
  }, [children]);

  return (
    <li className={clsx('tab', { 'tab-active': checked })}>
      <div className="tab-header">
        {tabHeader}
      </div>
    </li>
  );
}

export default Tab;
export {
  TabHeader
};

