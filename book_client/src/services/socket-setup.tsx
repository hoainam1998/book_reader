import { JSX, Fragment } from 'react';
import Socket from 'services/socket';
import WebSocketInit from './web-socket';
import { showModal } from 'utils';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import paths from 'router/paths';
import store from 'store/auth';
import router from 'router';
import { UserStorage } from 'storage';
import { SCREEN_SIZE, SOCKET_NAME } from 'enums';

const onCloseModalEvent = () => {
  store.logout();
  router.navigate(paths.LOGIN);
};

const body: JSX.Element = (<Slot name="body">
  <p style={{ textAlign: 'center' }}>
    You are blocking. Please contact my manager!
  </p>
</Slot>);

const footer: JSX.Element = (
  <Slot<any>
    name="footer"
    render={({ onClose }) => (
      <Button variant="success" style={{ width: '100%' }} onClick={onClose}>
        Close
      </Button>
  )} />
);

const userSocket = Socket.getInstance(SOCKET_NAME.USER);
const clientSocket = Socket.getInstance(SOCKET_NAME.CLIENT);

const messageControllerFn = (data: any) => {
  if (data.delete && window.location.pathname.includes(paths.HOME)) {
    showModal({
      children:
      <Fragment>
        {body}
        {footer}
      </Fragment>,
      bodyStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      title: 'User blocked!',
      size: SCREEN_SIZE.MEDIUM,
      onClose: onCloseModalEvent,
    });
  }
};

userSocket?.messageController(messageControllerFn);
clientSocket?.messageController(messageControllerFn);

export default () => {
  WebSocketInit.onOpen = function() {
    const user = UserStorage.getItem();
    if (globalThis.isAdmin) {
      (this as any).send(JSON.stringify({ name: SOCKET_NAME.USER, id: user.userId }));
    } else {
      (this as any).send(JSON.stringify({ name: SOCKET_NAME.CLIENT, id: user.clientId }));
    }
  };

  WebSocketInit.onMessage = function(event) {
    const data = JSON.parse((event as any).data);
    if (data.name === SOCKET_NAME.USER) {
      userSocket?.onMessage(data);
    } else {
      clientSocket?.onMessage(data);
    }
  };

  WebSocketInit.init();
};
