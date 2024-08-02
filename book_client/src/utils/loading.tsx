import { createRoot, Root } from 'react-dom/client';
import Loading from 'components/loading/loading';

let root: null | Root = null;
const loadingWrapperDOM: HTMLElement | null = document.getElementById('loading-wrapper');

const showLoading = (): void => {
  if (loadingWrapperDOM) {
    root = createRoot(loadingWrapperDOM);
    root.render(<Loading />);
  }
};

const hideLoading = () => root && root.unmount();

export {
  showLoading,
  hideLoading
};
