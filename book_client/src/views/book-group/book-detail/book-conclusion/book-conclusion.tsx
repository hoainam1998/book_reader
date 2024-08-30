import { JSX, useSyncExternalStore, useMemo, useEffect, useCallback } from 'react';
import { Blocker, useLoaderData } from 'react-router-dom';
import { format } from 'date-fns';
import Button from 'components/button/button';
import List from 'components/list/list';
import Slot from 'components/slot/slot';
import useModalNavigation from '../useModalNavigation';
import store, { CurrentStoreType, Image } from '../storage';
import './style.scss';
import { CategoryListType } from '../fetcher';
const { updateConditionNavigate, subscribe, getSnapshot } = store;

type FieldHightLightBoxPropsType = {
  label: string;
  value: string | number;
  children?: React.ReactElement;
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
    <Slot
      name="footer"
      render={({ onClose }) => (
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
  const loaderData = useLoaderData() as CategoryListType;
  const publishedDay: string = useMemo(
    () => (Boolean(data && data.publishedDay) ? format(+data.publishedDay, 'dd-MM-yyyy') : ''),
    [data]
  );

  const categories: CategoryListType['data']['category']['all'] =
    loaderData.data.category.all || [];

  const category: string = useMemo(() => {
    return data
      ? categories.find((categoryItem) => categoryItem.category_id === data.categoryId)?.name || ''
      : '';
  }, [data, categories]);

  useModalNavigation({ body: bodyModal, footer: footerModal })

  const openFile = useCallback((fileName: string): void => {
    window.open(`${process.env.BASE_URL}/${fileName}`, '_blank');
  }, []);

  const complete = useCallback(() => {
    // TODO
  }, []);

  useEffect(() => {
    updateConditionNavigate(true);
  }, []);

  if (data) {
    return (
      <section className="book-conclusion">
        <div className="information-section">
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
