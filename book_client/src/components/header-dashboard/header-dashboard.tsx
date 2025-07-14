import { JSX, useCallback, useState, useRef, useMemo, useEffect } from 'react';
import Button from 'components/button/button';
import Input from 'components/form/form-control/input/input';
import RenderCondition from 'components/render-condition/render-condition';
import { useClientPaginationContext } from 'contexts/client-pagination';
import { clsx } from 'utils';
import './style.scss';

type HeaderDashboardPropsType = {
  disabled?: boolean;
  hiddenNewBtn?: boolean;
  className?: string;
  add?: () => void;
  search: (keyword: string) => void;
};

function HeaderDashboard({ disabled, hiddenNewBtn, className, add, search }: HeaderDashboardPropsType): JSX.Element {
  const paginationContext = useClientPaginationContext();
  const headerRef = useRef<HTMLDivElement>(null);
  const [isClear, setIsClear] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>((paginationContext || {}).keyword || '');
  const [disableSearchButton, setDisableSearchButton] = useState<boolean>(!keyword.trim());
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
    setDisableSearchButton(!keyword.trim());
  }, [keyword, search]);

  const clear = useCallback((): void => {
    setIsClear(false);
    setKeyword('');
    search('');
    setDisableSearchButton(true);
  }, [keyword, search]);

  const setClearFlag = useCallback((value: string): void => {
    if (value) {
      if (oldKeyword.current && value !== oldKeyword.current) {
        setIsClear(false);
      }
      setDisableSearchButton(!value.trim());
    } else {
      setIsClear(true);
    }
  }, []);

  const reset = useCallback((): void => {
    setIsClear(false);
    setKeyword('');
    setDisableSearchButton(true);
  }, []);

  const enterKeydown = useCallback((event: any): void => {
    const query = event.target.value.trim();
    if (event.code === 'Enter' && query) {
      oldKeyword.current = query;
      setIsClear(true);
      search(query);
      setDisableSearchButton(!query);
    }
  }, [search]);

  useEffect(() => {
    if (globalThis.isClient && paginationContext) {
      paginationContext.setClearOldKeyword(() => reset);
    }
  }, []);

  return (
    <div className={clsx('header-dashboard position-sticky', className)} ref={headerRef} style={{ top }}>
      <RenderCondition
        condition={showNewBtn}
        then={<Button variant="success" className="add-new" onClick={add!}>+New</Button>} />
      <Input
        label=""
        value={keyword}
        name="search"
        className="un-grid"
        labelClass="label-search"
        inputColumnSize={{
          sm: 12,
        }}
        disabled={disabled}
        onChange={(e) => setClearFlag((e.target as any).value)}
        onBlur={(value) => setKeyword(value as string)}
        onKeyDown={enterKeydown} />
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
