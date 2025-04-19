import { JSX, useCallback, useSyncExternalStore, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLoginWrapper from 'views/login-group/login-wrapper/admin-login-wrapper/admin-login-wrapper';
import Input, { InputRefType } from 'components/form/form-control/input/input';
import Button from 'components/button/button';
import { UserLogin } from 'storage';
import { sendOtp, verifyOtp } from './fetcher';
import { showToast } from 'utils';
import useComponentDidMount from 'hooks/useComponentDidMount';
import path from 'router/paths';
import auth from 'store/auth';
import './style.scss';
const { subscribe, getSnapshot } = auth;

function VerifyOtp(): JSX.Element {
  const [errors, setErrors] = useState<string[]>([]);
  const userLogin: UserLogin | null = useSyncExternalStore(subscribe, getSnapshot);
  if (!userLogin) {
    return <></>;
  }
  const { email } = userLogin;
  const inputRef = useRef<InputRefType>(null);
  const navigate = useNavigate();

  const validateOtp = useCallback((event: any): void => {
    const otp: string = event.target.value;
    if (!/(\d{6})/.test(otp)) {
      setErrors(['Otp must be number and contain 6 digit!']);
    } else {
      setErrors([]);
    }
  }, [errors]);

  const _sendOtp = useCallback((): void => {
    sendOtp(email)
      .then(res => showToast('OTP', res.data.message))
      .catch(error => showToast('Send OTP error', error.response.data.message));
  }, []);

  const verify = useCallback((): void => {
    const otp: string | undefined = inputRef.current?.input?.value;
    verifyOtp(email, otp as string)
      .then((res) => {
        auth.saveApiKey(res.data.apiKey);
        auth.MfaValidated = true;
        navigate(path.HOME);
      })
      .catch((error) => showToast('OTP', error.response.data.message));
  }, []);

  const reSend = useCallback((): void => {
    inputRef.current!.input!.value = '';
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
    <AdminLoginWrapper>
      <div className="verify-otp">
        <Input
          name="otp"
          type="number"
          errors={errors}
          inputClass="otp-box"
          className="otp-un-grid-fieldset-wrapper"
          inputColumnSize={{
            lg: 12,
            sm: 12,
            md: 12,
          }}
          onInput={validateOtp}
          ref={inputRef} />
          <div className="btn-group">
            <Button variant="outline" onClick={verify}>Verify</Button>
            <Button variant="success" onClick={reSend}>Re-send</Button>
          </div>
      </div>
    </AdminLoginWrapper>
  );
}

export default VerifyOtp;
