import {
  JSX,
  useSyncExternalStore,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactElement,
  Children
} from 'react';
import { Blocker, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Button from 'components/button/button';
import Grid, { GridItem } from 'components/grid/grid';
import List from 'components/list/list';
import Slot from 'components/slot/slot';
import useModalNavigation from 'hooks/useModalNavigation';
import store, { CurrentStoreType, Image } from 'store/book';
import { showToast, ModalSlotProps, openFile } from 'utils';
import paths from 'paths';
import './style.scss';
import { getCategoryDetail } from 'views/category-group/fetcher';
import type { CategoryDetailType } from 'views/category-group/category';
import useComponentWillMount, { HaveLoadedFnType } from 'hooks/useComponentWillMount';
import { getAuthors } from 'views/book-group/fetcher';
const { updateConditionNavigate, deleteAllStorage, subscribe, getSnapshot } = store;

type FieldHightLightBoxPropsType = {
  label: string;
  value?: string | number;
  children?: ReactElement;
};

type AuthorsType = {
  name: string;
  avatar: string;
};

const FieldHightLightBox = ({
  label,
  value,
  children
}: FieldHightLightBoxPropsType): JSX.Element => {
  let content = <>
    <span className="field-information">{value}</span>
    {children}
  </>;

  if (Children.count(children)) {
    const child = Children.only(children);
    content = child?.props.name === 'content' ? child : content;
  }

  return (
    <div className="field-hight-light-box">
      <div className="label-badge">
        <span className="badge">{label}</span>
      </div>
      {content}
    </div>
  );
};

const bodyModal: JSX.Element = (
  <Slot name="body">
    <p style={{ textAlign: 'center' }}>
      You must complete edit book information before leave this page!
    </p>
  </Slot>
);

const footerModal = (blocker: Blocker): JSX.Element => {
  const onCloseModal = (onClose: () => void): void => {
    onClose();
    blocker!.reset!();
  };

  return (
    <Slot<ModalSlotProps>
      name="footer"
      render={({ onClose }: ModalSlotProps) => (
        <div className="footer-navigation-modal">
          <Button variant="success"
            onClick={() => onCloseModal(onClose)}>
              Stay
          </Button>
        </div>
      )}
    />
  );
};

function BookConclusion(): JSX.Element {
  const [category, setCategory] = useState<CategoryDetailType>({ name: '', avatar: ''});
  const [authors, setAuthors] = useState<AuthorsType[]>([]);
  const { data }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);
  const navigate = useNavigate();
  const publishedDay: string = useMemo(
    () => (data && data.publishedDay ? format(+data.publishedDay, 'dd-MM-yyyy') : ''),
    [data]
  );

  useModalNavigation({ body: bodyModal, footer: footerModal, onLeaveAction: deleteAllStorage });

  const complete = useCallback(() => {
    showToast('Add book', 'This book has been added success!');
    deleteAllStorage(true);
    navigate(`${paths.HOME}/${paths.BOOK}`);
  }, []);

  useEffect(() => {
    updateConditionNavigate(!data);
  }, [data]);

  useComponentWillMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        if (Object.hasOwn(data, 'categoryId') && data.categoryId) {
          getCategoryDetail(data.categoryId)
            .then((res) => setCategory(res.data))
            .catch(() => setCategory({ name: '', avatar: '' }));
        }

        getAuthors(data.authors, {
          name: true,
          avatar: true
        }).then((res) => setAuthors(res.data))
          .catch(() => setAuthors([]));
      }
    };
  }, []);

  if (data) {
    return (
      <section className="book-conclusion">
        <Grid>
          <GridItem sm={12} md={6} lg={3} order={1} className="avatar-box">
            <span className="field-name">Avatar</span>
            <div className="avatar image-box">
              {data && data.avatar && (<img src={data.avatar} alt="avatar" />)}
            </div>
          </GridItem>
          <GridItem sm={12} lg={6} order={3} className="image-box-wrapper">
            <span className="field-name">Images</span>
            <div className="image-selected image-box">
              {data && (
                <List<Image>
                  items={data.images}
                  render={({ image, name }) => <img src={image} alt={name} />}
                />
              )}
            </div>
          </GridItem>
          <GridItem sm={12} md={6} lg={3} order={2}>
            <ul className="information-detail">
              <li>
                <FieldHightLightBox label="Name" value={data.name} />
              </li>
              <li>
                <FieldHightLightBox label="Pdf" value={data.pdf}>
                  <Button onClick={() => openFile(data.pdf)} className="preview" variant="success">
                    Preview
                  </Button>
                </FieldHightLightBox>
              </li>
              <li>
                <FieldHightLightBox label="Publish Time" value={data.publishedTime} />
              </li>
              <li>
                <FieldHightLightBox label="Publish Day" value={publishedDay} />
              </li>
              <li>
                <FieldHightLightBox label="Category">
                  <Slot name="content">
                    <div className="image-field">
                      <img className="avatar" src={category.avatar} alt="avatar" />
                      <span className="field-information">{category.name}</span>
                    </div>
                  </Slot>
                </FieldHightLightBox>
              </li>
              <li>
                <FieldHightLightBox label="Introduce" value={data.introduce!.html}>
                  <Button
                    onClick={() => openFile(data.introduce!.html)}
                    className="preview"
                    variant="success">
                      Preview
                  </Button>
                </FieldHightLightBox>
              </li>
              <li>
                <FieldHightLightBox label="Authors" value={'author'}>
                  <Slot name="content">
                    <ul>
                      <List<AuthorsType> items={authors} render={({ name, avatar }) => (
                        <li className="box-item">
                          <div className="image-field">
                            <img className="avatar" src={avatar} alt="avatar" />
                            <span className="field-information">{name}</span>
                          </div>
                        </li>
                      )} />
                    </ul>
                  </Slot>
                </FieldHightLightBox>
              </li>
            </ul>
          </GridItem>
        </Grid>
        <Button onClick={complete} variant="submit" className="btn-complete">
          Complete
        </Button>
      </section>
    );
  }
  return <></>;
}

export default BookConclusion;
