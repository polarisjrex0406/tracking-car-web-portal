import LockOpenIcon from "@mui/icons-material/LockOpen";
import {
  Button,
  // FormControl,
  // Snackbar,
  IconButton,
  // InputLabel,
  LinearProgress,
  // MenuItem,
  // Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useLocalization,
  useTranslation,
} from "../common/components/LocalizationProvider";
import {
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from "../common/components/NativeInterface";
import usePersistedState from "../common/util/usePersistedState";
import { useCatch } from "../reactHelper";
import playstore from "../resources/images/AppleStoreLogo.png";
import applestore from "../resources/images/PlayStoreLogo.png";
import { sessionActions } from "../store";
import LoginLayout from "./LoginLayout";
import LogoImage from "./LogoImage";
import ResetPasswordPage from "./ResetPasswordPage";

const useStyles = makeStyles((theme) => ({
  options: {
    position: "fixed",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  extraContainer: {
    display: "flex",
    gap: theme.spacing(2),
  },
  registerButton: {
    minWidth: "unset",
  },
  resetPassword: {
    cursor: "pointer",
    color: "blue",
    fontWeight: 500,
  },
  tags: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  tagDiv: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
  },
  image: {
    width: "150px",
  },
}));

const LoginPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState("loginEmail", "");
  const [password, setPassword] = useState("");
  const [openResetDialog, setOpenResetDialog] = useState(false);

  const registrationEnabled = useSelector(
    (state) => state.session.server.registration
  );
  const languageEnabled = useSelector(
    (state) => !state.session.server.attributes["ui.disableLoginLanguage"]
  );
  const changeEnabled = useSelector(
    (state) => !state.session.server.attributes.disableChange
  );
  const emailEnabled = useSelector(
    (state) => state.session.server.emailEnabled
  );
  const openIdEnabled = useSelector(
    (state) => state.session.server.openIdEnabled
  );
  const openIdForced = useSelector(
    (state) =>
      state.session.server.openIdEnabled && state.session.server.openIdForce
  );

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector(
    (state) => state.session.server.announcement
  );

  const generateLoginToken = async () => {
    if (nativeEnvironment) {
      let token = "";
      try {
        const expiration = moment().add(6, "months").toISOString();
        const response = await fetch("/api/session/token", {
          method: "POST",
          body: new URLSearchParams(`expiration=${expiration}`),
        });
        if (response.ok) {
          token = await response.text();
          console.log("toekn", token)
        }
      } catch (error) {
        token = "";
      }
      nativePostMessage(`login|${token}`);
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        body: new URLSearchParams(
          `email=${encodeURIComponent(email)}&password=${encodeURIComponent(
            password
          )}`
        ),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        navigate("/");
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setFailed(true);
      setPassword("");
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(
      `/api/session?token=${encodeURIComponent(token)}`
    );
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate("/");
    } else {
      throw Error(await response.text());
    }
  });

  const handleSpecialKey = (e) => {
    if (e.keyCode === 13 && email && password) {
      handlePasswordLogin(e);
    }
  };

  const handleOpenIdLogin = () => {
    document.location = "/api/session/openid/auth";
  };

  useEffect(() => nativePostMessage("authentication"), []);

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    localStorage.removeItem("selected_trip");
    localStorage.removeItem("selected_trip_index");
    localStorage.removeItem("currentDeviceId");
    localStorage.removeItem("geofencepage");
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return <LinearProgress />;
  }

  const handleOpenResetDialog = () => {
    setOpenResetDialog(true);
  };
  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
  };

  return (
    <LoginLayout>
      <div className={classes.options}>
        {nativeEnvironment && changeEnabled && (
          <Tooltip title={t("settingsServer")}>
            <IconButton onClick={() => navigate("/change-server")}>
              <LockOpenIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div className={classes.container}>
        <LogoImage color={theme.palette.primary.main} />
        <TextField
          required
          error={failed}
          label={t("userEmail")}
          name="email"
          value={email}
          autoComplete="email"
          autoFocus={!email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyUp={handleSpecialKey}
          helperText={failed && "Invalid username or password"}
        />
        <TextField
          required
          error={failed}
          label={t("userPassword")}
          name="password"
          value={password}
          type="password"
          autoComplete="current-password"
          autoFocus={!!email}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={handleSpecialKey}
        />
        <Button
          onClick={handlePasswordLogin}
          onKeyUp={handleSpecialKey}
          variant="contained"
          color="inherit"
          disabled={!email || !password}
        >
          {t("loginLogin")}
        </Button>
        <div className={classes.resetPassword} onClick={handleOpenResetDialog}>
          Reset Password
        </div>

        <div className={classes.tags}>
          <div className={classes.tagDiv}>
            <img className={classes.image} src={playstore} alt="" />
          </div>
          <div className={classes.tagDiv}>
            <img className={classes.image} src={applestore} alt="" />
          </div>
        </div>
      </div>

      {openResetDialog && (
        <ResetPasswordPage
          open={openResetDialog}
          onClose={handleCloseResetDialog}
        />
      )}
    </LoginLayout>
  );
};

export default LoginPage;
