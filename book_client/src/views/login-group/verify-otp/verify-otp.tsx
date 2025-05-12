import { JSX, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLoginWrapper from 'views/login-group/login-wrapper/admin-login-wrapper/admin-login-wrapper';
import Input, { InputRefType } from 'components/form/form-control/input/input';
import Button from 'components/button/button';
import { sendOtp, verifyOtp } from './fetcher';
import { showToast } from 'utils';
import useComponentDidMount from 'hooks/useComponentDidMount';
import path from 'router/paths';
import auth from 'store/auth';
import './style.scss';

function VerifyOtp(): JSX.Element {
  const [errors, setErrors] = useState<string[]>([]);

  const inputRef = useRef<InputRefType>(null);
  const navigate = useNavigate();

  const validateOtp = useCallback((event: any): void => {
    const otp: string = event.target.value;
    if (!/^(\d{6})$/.test(otp)) {
      setErrors(['Otp must be number and contain 6 digit!']);
    } else {
      setErrors([]);
    }
  }, [errors]);

  const _sendOtp = useCallback((): void => {
    sendOtp()
      .then(res => showToast('OTP', res.data.message))
      .catch(error => showToast('Send OTP error', error.response.data.message));
  }, []);

  const verify = useCallback((): void => {
    if (!errors.length) {
      const otp: string | undefined = inputRef.current?.input?.value;
      verifyOtp(otp as string)
        .then((res) => {
          auth.saveApiKey(res.data.apiKey);
          auth.MfaValidated = true;
          navigate(path.HOME);
        })
        .catch((error) => showToast('OTP', error.response.data.message));
    }
  }, [errors]);

  const reSend = useCallback((): void => {
    inputRef.current!.input!.value = '';
    _sendOtp();
  }, []);

  const enterKeyEvent = useCallback((event: any): void => {
    if (event.code === 'Enter') {
      verify();
    }
  }, [verify]);

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
          onKeyDown={enterKeyEvent}
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
