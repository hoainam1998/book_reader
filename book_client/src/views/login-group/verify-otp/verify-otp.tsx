import { JSX, useCallback, useSyncExternalStore, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginWrapper from 'components/login-wrapper/login-wrapper';
import Input, { InputRefType } from 'components/form/form-control/input/input';
import Button from 'components/button/button';
import store from 'store/auth';
import { UserLogin } from 'storage';
import { sendOtp, verifyOtp } from './fetcher';
import { showToast } from 'utils';
import useComponentDidMount from 'hooks/useComponentDidMount';
import path from 'paths';
import auth from 'store/auth';
import './style.scss';
const { subscribe, getSnapshot } = store;

function VerifyOtp(): JSX.Element {
  const userLogin: UserLogin | null = useSyncExternalStore(subscribe, getSnapshot);
  if (!userLogin) {
    return <></>;
  }
  const { email } = userLogin;
  const inputRef = useRef<InputRefType>(null);
  const navigate = useNavigate();

  const _sendOtp = useCallback(() => {
    sendOtp(email)
      .then(res => showToast('OTP', res.data.message))
      .catch(error => showToast('Send OTP error', error.response.data.message));
  }, []);

  const verify = useCallback((): void => {
    const otp: string | undefined = inputRef.current?.input?.value;
    verifyOtp(email, otp as string)
      .then((res) => {
        if (res.data.verify) {
          auth.saveApiKey(res.data.apiKey);
          navigate(path.HOME);
        } else {
          showToast('OTP', 'Otp code is incorrect!');
        }
      })
      .catch(() => showToast('OTP', 'Verify otp code failed!'));
  }, []);

  const reSend = useCallback((): void => {
    _sendOtp();
  }, []);

  useComponentDidMount((haveFetched) => {
    return () => {
      if (!haveFetched()) {
        _sendOtp();
      }
    };
  });

  return (
    <LoginWrapper>
      <div className="verify-otp">
        <Input name="otp" type="number" inputClass="otp-box" className="otp-un-grid-fieldset-wrapper" ref={inputRef} />
        <div className="btn-group">
          <Button variant="outline" onClick={verify}>Verify</Button>
          <Button variant="success" onClick={reSend}>Re-send</Button>
        </div>
      </div>
    </LoginWrapper>
  );
}

export default VerifyOtp;
