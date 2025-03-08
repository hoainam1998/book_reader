import { UIMatch } from 'react-router-dom';
import { ModalSlotPropsType } from 'components/modal/modal';

export type NavigationRouteMatchType = UIMatch & { name: string };

export type {
  ModalSlotPropsType
};

export type HaveLoadedFnType = () => boolean;
