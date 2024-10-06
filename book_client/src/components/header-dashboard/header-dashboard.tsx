import { JSX, useCallback, useState, useRef } from 'react';
import Button from 'components/button/button';
import Input from 'components/form/form-control/input/input';
import './style.scss';

type HeaderDashboardPropsType = {
  add: () => void;
  // eslint-disable-next-line no-unused-vars
  search: (keyword: string) => void;
};

function HeaderDashboard({ add, search }: HeaderDashboardPropsType): JSX.Element {
  const [isClear, setIsClear] = useState<boolean>(false);
  const [disableSearchButton, setDisableSearchButton] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>('');
  const oldKeyword = useRef<string>(keyword);

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
    <div className="header-dashboard">
      <Button variant="success" className="add-new" onClick={add}>+New</Button>
      <Input
        label=""
        value={keyword}
        name="search"
        labelClass="label-search"
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
