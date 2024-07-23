import { createRoot, Root } from 'react-dom/client';
import Loading from 'components/loading/loading';

let root: null | Root = null;
const loadingWrapperDOM = document.getElementById('loading-wrapper');

const showLoading = () => {
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
