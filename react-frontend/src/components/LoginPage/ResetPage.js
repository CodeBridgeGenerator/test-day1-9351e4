import React, { useEffect, useState } from "react";
import { classNames } from "primereact/utils";
import { connect } from "react-redux";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";

const ResetPage = (props) => {
  const navigate = useNavigate();
  const isSignup = /signup/.test(location.pathname);
  const urlParams = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [maskPassword, setMaskPassword] = useState(true);

  useEffect(() => {}, [urlParams.singleChangeForgotPasswordId]);

  const checkEmail = async () => {
    const newEmailData = await client
      .service("userLogin")
      .find({ query: { loginEmail: email?.trim() } });
    return newEmailData?.data[0]?.loginEmail === email?.trim();
  };

  const onEnter = (e) => {
    if (e.key === "Enter") savePassword();
  };

  const savePassword = () => {
    if (validate()) {
      props.patchUser({ password }).then((res) => {
        navigate("/login");
      });
    }
  };

  const validate = () => {
    let isValid = true;
    let re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
      setEmailError("Please Enter a valid email");
      isValid = false;
    }
    if (!password.length) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(
        "Must be at least 6 characters long and have at least one letter, digit, uppercase, lowercase and symbol",
      );
      isValid = false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Confirm Password is not correct");
      isValid = false;
    }

    return isValid;
  };

  const renderPasswordPolicyErrors = () => {
    const { passwordPolicyErrors } = props;
    if (!(Array.isArray(passwordPolicyErrors) && passwordPolicyErrors.length))
      return null;
    return passwordPolicyErrors.map((message, i) => {
      return (
        <p className="m-0" key={"pass-policy-" + i}>
          <small className="p-error">{message}</small>
        </p>
      );
    });
  };
  return (
    <div className="grid p-fluid flex flex-column align-items-center h-screen">
      <div
        className={classNames("col-12 lg:col-5 px-6", {
          "mt-8 pt-8": isSignup,
        })}
      >
        <div className="card">
          <div>
            <p>
              Already have an account? <a href="/login">Login</a>
            </p>
          </div>
          <div style={{ height: "20px" }} />
          <div className="flex flex-column align-items-center">
            <h4>Change Password</h4>

            <div className="col-12 lg:col-8">
              <p className="m-0">Email</p>
              <InputText
                type="text"
                placeholder="Enter your email"
                value={email}
                disabled={true}
              ></InputText>
            </div>
            <div className="col-12 lg:col-8">
              <p className="m-0">New Password</p>
              <span className="p-input-icon-right">
                <i
                  className={`pi ${maskPassword ? "pi-eye" : "pi-eye-slash"} cursor-pointer`}
                  onClick={() => setMaskPassword(!maskPassword)}
                  title={`${maskPassword ? "Show" : "Hide"} password`}
                />
                <InputText
                  type={maskPassword ? "password" : "text"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  className={passwordError ? "p-invalid" : ""}
                  onKeyDown={onEnter}
                ></InputText>
              </span>
              <small className="p-error">{passwordError}</small>
              {renderPasswordPolicyErrors()}
            </div>
            <div className="col-12 lg:col-8">
              <p className="m-0">Confirm Password</p>
              <span className="p-input-icon-right">
                <i
                  className={`pi ${maskPassword ? "pi-eye" : "pi-eye-slash"} cursor-pointer`}
                  onClick={() => setMaskPassword(!maskPassword)}
                  title={`${maskPassword ? "Show" : "Hide"} password`}
                />
                <InputText
                  type={maskPassword ? "password" : "text"}
                  placeholder="Enter your password"
                  value={confirm_password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  className={passwordError ? "p-invalid" : ""}
                  onKeyDown={onEnter}
                ></InputText>
              </span>
            </div>
          </div>

          <div className="flex justify-content-center mt-3">
            <div className="col-6 lg:col-6">
              <Button
                label="save Password"
                className="p-button-raised p-button-rounded"
                onClick={savePassword}
              ></Button>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: "100px" }} />
    </div>
  );
};

const mapState = (state) => {
  const { isLoggedIn, passwordPolicyErrors, patchUser } = state.auth;
  return { isLoggedIn, passwordPolicyErrors, patchUser };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(ResetPage);
