import { JSX, useCallback, useState, useRef, useMemo } from 'react';
import Button from 'components/button/button';
import Input from 'components/form/form-control/input/input';
import RenderCondition from 'components/render-condition/render-condition';
import './style.scss';

type HeaderDashboardPropsType = {
  disabled?: boolean;
  hiddenNewBtn?: boolean;
  add: () => void;
  // eslint-disable-next-line no-unused-vars
  search: (keyword: string) => void;
};

function HeaderDashboard({ disabled, hiddenNewBtn, add, search }: HeaderDashboardPropsType): JSX.Element {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isClear, setIsClear] = useState<boolean>(false);
  const [disableSearchButton, setDisableSearchButton] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>('');
  const oldKeyword = useRef<string>(keyword);

  const top: number | string = useMemo<number | string>(() => {
    return headerRef.current?.offsetTop || 'unset';
  }, [headerRef.current]);

  const showNewBtn = useMemo<boolean>(() => {
    return hiddenNewBtn === undefined ? true : !hiddenNewBtn;
  }, [hiddenNewBtn]);

  const _search = useCallback((): void => {
    setIsClear(true);
    oldKeyword.current = keyword;
    search(keyword);
  }, [keyword]);

  const clear = useCallback((): void => {
    setIsClear(false);
    setKeyword('');
    search('');
  }, [keyword]);

  const setClearFlag = useCallback((value: string): void => {
    if (oldKeyword.current && value !== oldKeyword.current) {
      setIsClear(false);
    }
    setDisableSearchButton(!value.trim());
  }, []);

  return (
    <div className="header-dashboard position-sticky" ref={headerRef} style={{ top }}>
      <RenderCondition
        condition={showNewBtn}
        then={<Button variant="success" className="add-new" onClick={add}>+New</Button>} />
      <Input
        label=""
        value={keyword}
        name="search"
        className="un-grid"
        labelClass="label-search"
        inputColumnSize={{
          sm: 12
        }}
        disabled={disabled}
        onChange={(e) => setClearFlag((e.target as any).value)}
        onBlur={(value) => setKeyword(value as string)} />
        {
          !isClear
          ?<Button variant="outline" className="btn-search"
            disabled={disableSearchButton} onClick={_search}>&#128270;</Button>
          :<Button variant="outline" className="btn-search" onClick={clear}>&#x2715;</Button>
        }
    </div>
  );
}

export default HeaderDashboard;
