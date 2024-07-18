import CloseIcon from "@mui/icons-material/Close";
import { Snackbar, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../common/components/LocalizationProvider";
import { snackBarDurationShortMs } from "../common/util/duration";
import useQuery from "../common/util/useQuery";
import { useCatch } from "../reactHelper";
import magnifyingGlass from "../resources/images/MagnifyingGlass.png";
import sendIcon from "../resources/images/SendIcon.png";

const useStyles = makeStyles((theme) => ({
  dialogCloseIcon: {
    padding: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  dialogContainer: {
    padding: "70px",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  dialogSuccessContainer: {
    paddingTop: "16px",
    paddingLeft: "70px",
    paddingRight: "70px",
    paddingBottom: "70px",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  dialogContentText: {
    fontSize: "14px",
    fontWeight: 500,
    textAlign: "center",
  },
  dialogSuccessContentText: {
    color: "blue",
    fontSize: "14px",
    fontWeight: 500,
    textAlign: "center",
  },
  dialogSuccessSubContentText: {
    color: "black",
    fontSize: "10px",
    fontWeight: 500,
    textAlign: "center",
  },
  iconStyle: {
    cursor: "pointer",
    fontSize: "18px",
  },
  sendIconStyle: {
    width: "60px",
  },
  magnifyingGlassStyle: {
    width: "20px",
  },
  successMessegeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "40px",
  },
  successMessegeSubContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const ResetPasswordPage = ({ open, onClose }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const query = useQuery();

  const token = query.get("passwordReset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    if (successDialogOpen) {
      const timer = setTimeout(() => {
        setSuccessDialogOpen(false);
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successDialogOpen, onClose]);

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    let response;
    if (!token) {
      response = await fetch("/api/password/reset", {
        method: "POST",
        body: new URLSearchParams(`email=${encodeURIComponent(email)}`),
      });
    } else {
      response = await fetch("/api/password/update", {
        method: "POST",
        body: new URLSearchParams(
          `token=${encodeURIComponent(token)}&password=${encodeURIComponent(
            password
          )}`
        ),
      });
    }
    if (response.ok) {
      setSnackbarOpen(true);
      setSuccessDialogOpen(true);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <div className={classes.dialogCloseIcon}>
          <CloseIcon className={classes.iconStyle} onClick={onClose} />
        </div>
        {successDialogOpen ? (
          <div className={classes.dialogSuccessContainer}>
            <div className={classes.successMessegeContainer}>
              <div className={classes.successMessegeSubContainer}>
                <img src={sendIcon} alt="" className={classes.sendIconStyle} />
                <div className={classes.dialogSuccessContentText}>
                  Your password reset email is on the move!
                </div>
              </div>
              <div className={classes.successMessegeSubContainer}>
                <img
                  src={magnifyingGlass}
                  alt=""
                  className={classes.magnifyingGlassStyle}
                />
                <div className={classes.dialogSuccessSubContentText}>
                  If you don't see the email right away, Check your Junk of
                  Smart Folders.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={classes.dialogContainer}>
            <div className={classes.dialogContentText}>
              We'll send you an email so you can set a new password!
            </div>
            {!token ? (
              <TextField
                required
                type="email"
                label={t("userEmail")}
                name="email"
                value={email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            ) : (
              <TextField
                required
                label={t("userPassword")}
                name="password"
                value={password}
                type="password"
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
              />
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!/(.+)@(.+)\.(.{2,})/.test(email) && !password}
              fullWidth
            >
              {t("loginReset")}
            </Button>
          </div>
        )}
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        onClose={() => navigate("/login")}
        autoHideDuration={snackBarDurationShortMs}
        message={!token ? t("loginResetSuccess") : t("loginUpdateSuccess")}
      />
    </>
  );
};

export default ResetPasswordPage;
