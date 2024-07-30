import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";
import { Link, useNavigate, useLocation } from "react-router-dom";
import client from "../../services/restClient";
import FacebookOauth from "./FacebookOauth";
import GithubOauth from "./GithubOauth";
import GoogleOauth from "./GoogleOauth";
import AppleOauth from "./AppleOauth";

const LoginPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = /login/.test(location.pathname);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [maskPassword, setMaskPassword] = useState(true);
  const [showForgotDialog, setForgotDialog] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  useEffect(() => {
    if (props.isLoggedIn === true) navigate("/", { replace: true });
  }, [props.isLoggedIn]);

  const onEnter = (e) => {
    if (e.key === "Enter") login();
  };

  const _getEmail = async () => {
    return await client
      .service("userLogin")
      .find({ query: { loginEmail: email } });
  };

  const login = () => {
    setLoading(true);
    if (validate()) {
      props
        .login({ email, password })
        .then(() => {
          navigate("/project");
          setLoading(false);
        })
        .catch((error) => {
          props.alert({
            title: "User Login failed.",
            type: "error",
            message: error.message || "Proceed to login to your account.",
          });
          setLoading(false);
        });
    }
    setLoading(false);
  };

  const validate = () => {
    let isValid = true;
    let re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
      setEmailError("Please Enter a valid Email address");
      isValid = false;
    }
    if (password.length < 6) {
      setPasswordError(
        "Please enter a valid password. Must be at least 6 characters",
      );
      isValid = false;
    }
    return isValid;
  };

  const sendToForgotResetPage = async () => {
    setLoading(true);
    const userLoginData = await _getEmail();
    const userLogin = userLoginData?.data[0];
    try {
      // 1 check if email is in userLogin exists           => user has not logged in
      if (!userLogin) {
        setVerificationError("user has not attempted to logged in");
        setLoading(false);
      }
      // 2 check if email is in userLogin.status !== true  => user has not logged in
      else if (!userLogin?.status) {
        setVerificationError("user has login not successful");
        setLoading(false);
      }
      // 3 check if email is in userLogin.code !== null    => user has not logged in
      else if (isNaN(Number(userLogin?.code))) {
        setVerificationError("user has not been verified");
        setLoading(false);
      } else {
        const userCPData = await client.service("userChangePassword").find({
          query: { userEmail: email, $sort: { createdAt: -1 }, $limit: 1 },
        });
        const userCP = userCPData?.data[0];
        if (!userCP) {
          const _data = {
            userEmail: email,
            server: process.env.REACT_APP_SERVER_URL,
            environment: process.env.REACT_APP_ENV,
            code: Math.floor(Math.random() * 999999),
            status: false,
            sendEmailCounter: 0,
          };
          await client.service("userChangePassword").create(_data);
          props.alert({
            title: `Reset password email sent to ${email}.`,
            type: "warn",
            message: `Account  ${email} verification under process.`,
          });
          setForgotDialog(false);
        } else {
          if (userCP?.sendEmailCounter > 3) {
            setVerificationError("too many tries, please contact admin");
          } else {
            const _data = {
              userEmail: email,
              server: process.env.REACT_APP_SERVER_URL,
              environment: process.env.REACT_APP_ENV,
              code: Math.floor(Math.random() * 999999),
              status: false,
              sendEmailCounter: userCP.sendEmailCounter++,
            };
            await client.service("userChangePassword").create(_data);
            setForgotDialog(false);
          }
        }
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      throw Error(error.message);
    }
  };

  return (
    <div
      className={classNames(
        "grid p-fluid flex flex-column align-items-center mt-8",
        { "h-screen": isLogin },
      )}
    >
      <div className={classNames({ "col-12 lg:col-6 xl:col-4": isLogin })}>
        <div className="card flex flex-column align-items-center">
          <div
            className={classNames("flex flex-column align-items-center", {
              "grid col-12 xl:col-8 ": isLogin,
            })}
          >
            <h4>Login</h4>
            <div className="w-full mb-4">
              <p className="m-0">Email</p>
              <InputText
                type="text"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "p-invalid" : ""}
                onKeyDown={onEnter}
              ></InputText>
              <small className="p-error">{emailError}</small>
            </div>
            <div className="w-full mb-4">
              <p className="m-0">Password</p>
              <span className="p-input-icon-right">
                <i
                  className={`pi ${maskPassword ? "pi-eye" : "pi-eye-slash"} cursor-pointer`}
                  onClick={() => setMaskPassword(!maskPassword)}
                  title={`${maskPassword ? "Show" : "Hide"} password`}
                />
                <InputText
                  type={maskPassword ? "password" : "text"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={passwordError ? "p-invalid" : ""}
                  onKeyDown={onEnter}
                ></InputText>
              </span>
              <small className="p-error">{passwordError}</small>
            </div>
            <div className="w-6 mb-4">
              <Button
                label="Login"
                className="p-button-raised p-button-rounded"
                onClick={login}
                loading={loading}
              ></Button>
              <Button
                text
                className="p-button-secondary"
                onClick={() => setForgotDialog(true)}
              >
                Forgot Password
              </Button>
            </div>
            {/* <div className="w-full mb-4">
                            <div className="flex">
                                <p className="m-0">Or login with</p>
                                <hr
                                    style={{
                                        width: '60%',
                                        marginLeft: '5%',
                                        marginTop: '4%',
                                        borderTop: '1px solid #000'
                                    }}
                                />
                            </div>
                            <div className="w-full flex justify-content-center mt-3">
                                <GoogleOauth props={props} type={'login'} />
                            </div>
                            <div className="w-full flex justify-content-center mt-3">
                                <FacebookOauth props={props} type={'login'} />
                            </div>
                            <div className="w-full flex justify-content-center mt-3">
                                <GithubOauth props={props} type={'login'} />
                            </div>
                            <div className="w-full flex justify-content-center mt-3">
                                <AppleOauth props={props} type={'login'} />
                            </div>
                        </div> */}
            <div className="w-full flex flex-column align-items-center">
              <div className="w-full flex justify-content-between">
                <Link to="/signup">Don't have an account?</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        header="Forgot Password"
        visible={showForgotDialog}
        onHide={() => setForgotDialog(false)}
      >
        <div className="w-full mb-4">
          <p className="m-0">Your Email</p>
          <InputText
            type="text"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></InputText>
          <small className="p-error">{verificationError}</small>
        </div>
        <div className="w-full mb-4 flex justify-content-end">
          <Button
            text
            label="send email link"
            onClick={sendToForgotResetPage}
            loading={loading}
          />
        </div>
      </Dialog>
    </div>
  );
};

const mapState = (state) => {
  const { isLoggedIn } = state.auth;
  return { isLoggedIn };
};
const mapDispatch = (dispatch) => ({
  login: (data) => dispatch.auth.login(data),
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(LoginPage);
