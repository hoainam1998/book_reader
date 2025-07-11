import { JSX, ReactElement, Children, cloneElement, useState, useMemo, useEffect } from 'react';
import Tab, { TabHeader } from './tab/tab';
import './style.scss';

type TabsPropsType = {
  children: ReactElement | ReactElement[];
  value?: number;
};

const renderTab = (element: ReactElement<any, any>): ReactElement => {
  if (element.type.name === 'Tab') {
    return element.props.children[1];
  }
  return (<></>);
};

function Tabs({ children, value }: TabsPropsType): JSX.Element {
  let order: number = 1;
  const tabs: ReactElement[] = useMemo(() => Children.toArray(children) as ReactElement[], [children]);
  const defaultTabBody = useMemo<ReactElement>(() => {
    if (Children.count(children)) {
      if (value) {
        return renderTab(tabs[value - 1]);
      } else {
        return renderTab(tabs[0]);
      }
    }
    return (<></>);
  }, [value, children, tabs]);

  const [tabBody, setTabBody] = useState<ReactElement>(defaultTabBody);
  const [selectedTabValue, setSelectedTabValue] = useState<number>(1);

  const onSelected = (selectedValue: number, child: ReactElement): () => void => {
    return (): void => {
      setSelectedTabValue(selectedValue);
      setTabBody(child);
    };
  };

  useEffect(() => {
    if (Children.count(children)) {
      const tab = tabs[selectedTabValue - 1].props.children[1];
      setTabBody(tab);
    }
  }, [children]);

  return (
    <section>
      <ul className="tabs">
        {
          Children.map(children, (child: ReactElement<any, any>) => {
            if (child.type.name === 'Tab') {
              const tab = cloneElement(child, {
                order,
                checked: order === selectedTabValue,
                onSelectedValue: onSelected(order, child.props.children[1]),
              });
              ++order;
              return tab;
            } else {
              return <></>;
            }
          })
        }
      </ul>
      <div className="tabs-content">
        {tabBody}
      </div>
    </section>
  );
}

export default Tabs;
export {
  Tab,
  TabHeader,
};
