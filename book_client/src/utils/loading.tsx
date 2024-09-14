import { createRoot, Root } from 'react-dom/client';
import { createElementWrapper } from './element-wrapper';
import Loading from 'components/loading/loading';

const bodyDOM: HTMLElement = document.body;
const loadingContainer: HTMLDivElement = createElementWrapper('loading-wrapper', 'loading-wrapper');
let root: null | Root = null;

/**
 * Show loading panel.
 */
const showLoading = (): void => {
  if (!bodyDOM.contains(loadingContainer)) {
    bodyDOM.append(loadingContainer);
    root = createRoot(loadingContainer);
    root.render(<Loading />);
  }
};

/**
 * Hide loading panel.
 */
const hideLoading = (): void => {
  if (root) {
    root.unmount();
    loadingContainer.remove();
  }
};

export {
  showLoading,
  hideLoading
};
