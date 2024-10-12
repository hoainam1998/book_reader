import { JSX, useSyncExternalStore, useMemo, useEffect, useCallback, ReactElement } from 'react';
import { Blocker, useLoaderData, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Button from 'components/button/button';
import List from 'components/list/list';
import Slot from 'components/slot/slot';
import useModalNavigation from 'hooks/useModalNavigation';
import store, { CurrentStoreType, Image } from 'store/book';
import { showToast, ModalSlotProps } from 'utils';
import paths from 'paths';
import './style.scss';
import { CategoryListType } from '../fetcher';
const { updateConditionNavigate, deleteAllStorage, subscribe, getSnapshot } = store;

type FieldHightLightBoxPropsType = {
  label: string;
  value: string | number;
  children?: ReactElement;
};

const FieldHightLightBox = ({
  label,
  value,
  children
}: FieldHightLightBoxPropsType): JSX.Element => {
  return (
    <div className="field-hight_light-box">
      <div className="label-badge">
        <span className="badge">{label}</span>
      </div>
      <span>{value}</span>
      {children}
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
  const onCloseModal = (onClose: () => void) => {
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
  const { data }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);
  const navigate = useNavigate();
  const loaderData = useLoaderData() as CategoryListType;
  const publishedDay: string = useMemo(
    () => (data && data.publishedDay ? format(+data.publishedDay, 'dd-MM-yyyy') : ''),
    [data]
  );

  const categories: CategoryListType['data']['category']['all'] =
    loaderData.data.category.all || [];

  const category: string = useMemo(() => {
    return data
      ? categories.find((categoryItem) => categoryItem.category_id === data.categoryId)?.name || ''
      : '';
  }, [data, categories]);

  useModalNavigation({ body: bodyModal, footer: footerModal, onLeaveAction: deleteAllStorage });

  const openFile = useCallback((fileName: string): void => {
    window.open(`${process.env.BASE_URL}/${fileName}`, '_blank');
  }, []);

  const complete = useCallback(() => {
    showToast('Add book', 'This book has been added success!');
    deleteAllStorage(true);
    navigate(`${paths.HOME}/${paths.BOOK}`);
  }, []);

  useEffect(() => {
    updateConditionNavigate(!data);
  }, [data]);

  if (data) {
    return (
      <section className="book-conclusion">
        <div className="information-section">
          <div className="avatar-box">
            <span className="field-name">Avatar</span>
            <div className="avatar image-box">
              { data && data.avatar && (<img src={data.avatar} alt="avatar" />)}
            </div>
          </div>
          <div className="image-box-wrapper">
            <span className="field-name">Images</span>
            <div className="image-selected image-box">
              {data && (
                <List<Image>
                  items={data.images}
                  render={({ image, name }) => <img src={image} alt={name} />}
                />
              )}
            </div>
          </div>
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
              <FieldHightLightBox label="Category" value={category} />
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
          </ul>
        </div>
        <Button onClick={complete} variant="submit" className="btn-complete">
          Complete
        </Button>
      </section>
    );
  }
  return <></>;
}

export default BookConclusion;
