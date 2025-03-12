import {
  JSX,
  ReactElement,
  createContext,
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useState,
  useContext
} from 'react';
import { SCREEN_SIZE } from 'enums';
import { tablet, extra } from '../static/js/break-point';

type ResponsiveScreenNameSizePropsType = {
  children: ReactElement;
};

const ResponsiveScreenNameSizeContext = createContext<string>('');

/**
 * Return context value.
 *
 * @returns {string} - The responsive screen name.
 */
export const useResponsiveScreenNameSizeContext
  = (): string => useContext(ResponsiveScreenNameSizeContext);

/**
 * Return responsive screen name.
 *
 * @param {ReactElement} children - The children inside context provider.
 * @returns {JSX.Element} - The context provider wrapper.
 */
export default ({ children }: ResponsiveScreenNameSizePropsType): JSX.Element => {
  const [screenSize, setScreenSize] = useState<number>(window.innerWidth);
  const deferScreenSize: number = useDeferredValue<number>(screenSize);

  useLayoutEffect(() => {
    // add event on resize, to set screen width.
    window.onresize = () => setScreenSize(window.innerWidth);
  }, []);

  const sizeName = useMemo<string>(() => {
    // based on screen width to find screen size name.
    if (deferScreenSize >= extra) {
      return SCREEN_SIZE.LARGE;
    } else if (deferScreenSize <= tablet) {
      return SCREEN_SIZE.SMALL;
    }
    return SCREEN_SIZE.MEDIUM;
  }, [deferScreenSize]);

  return (
    <ResponsiveScreenNameSizeContext.Provider value={sizeName}>
      {children}
    </ResponsiveScreenNameSizeContext.Provider>
  );
};
