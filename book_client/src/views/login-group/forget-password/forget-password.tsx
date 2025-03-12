import { JSX } from 'react';
import './style.scss';

function ForgetPassword(): JSX.Element {
  return (
    <section className="forget-password flex-center">
      <div className="content-remind">
        Please check your email: <b>hoainam@gmail.com</b>
        <br />I have been sent a link to your email. Let click it!
      </div>
    </section>
  );
}

export default ForgetPassword;
