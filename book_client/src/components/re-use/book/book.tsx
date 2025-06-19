import {
  JSX,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  cloneElement,
  Ref,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import path from 'router/paths';
import './style.scss';

type NavigateAuthorDetailPropsType = {
  children: ReactElement;
};

const NavigateAuthorDetail = forwardRef(
  function({ children }: NavigateAuthorDetailPropsType, ref: Ref<HTMLElement | undefined | null>): JSX.Element {
    const authorLInkRef = useRef<HTMLElement>(null);
    const authorDetailPath = useMemo<string>(() => `${path.HOME}/${path.AUTHOR}/123`, []);

    useImperativeHandle(
      ref,
      () => authorLInkRef.current!.parentElement,
      []
    );

    return (
      <Link to={authorDetailPath}>
        { cloneElement(children, { ref: authorLInkRef }) }
      </Link>
    );
  }
);

function Book(): JSX.Element {
  const navigate = useNavigate();
  const authorNameLink = useRef<HTMLElement>(null);
  const authorAvatarLink = useRef<HTMLElement>(null);
  const bookAuthorDetail = useMemo<string>(() => `${path.HOME}/${path.BOOK}/123`, []);

  const navigateToBookDetail = useCallback((event: any): void => {
    event.stopPropagation();
    event.preventDefault();
    const authorLinks = [authorNameLink.current, authorAvatarLink.current];
    if (!authorLinks.includes(event.target) && !authorLinks.includes(event.target.parentElement)) {
      navigate(bookAuthorDetail);
    }
  }, []);

  return (
    <div className="book" onClick={navigateToBookDetail}>
      <img className="item-book-avatar" src={require('images/application.png')} />
      <div className="book-quick-info">
        <NavigateAuthorDetail ref={authorAvatarLink}>
          <img src={require('images/application.png')} className="author-avatar" height="100px" width="100px" />
        </NavigateAuthorDetail>
        <div className="left-info">
          <h4 className="book-name">name</h4>
          <NavigateAuthorDetail ref={authorNameLink}>
            <h5 className="author-name">author name</h5>
          </NavigateAuthorDetail>
        </div>
      </div>
    </div>
  );
}

export default Book;
