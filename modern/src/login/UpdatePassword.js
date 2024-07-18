import {
  Button,
  // MenuItem,
  // Select,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../common/components/LocalizationProvider";
import useQuery from "../common/util/useQuery";
import LoginLayout from "./LoginLayout";

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
  formText: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: 500,
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
  dialogSuccessContainer: {
    padding: "80px",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  dialogSuccessText: {
    fontSize: "14px",
    fontWeight: 500,
    textAlign: "center",
  },
}));

const UpdatePasswordPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const query = useQuery();

  const token = query.get("passwordReset");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [openResetSuccessDialog, setOpenResetSuccessDialog] = useState(false);

  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await fetch("/api/verify/token", {
            method: "POST",
            body: JSON.stringify({ token }), // Send token to the backend for verification
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            setTokenValid(true); // Set token validity state based on the response
          } else {
            navigate("/login"); // Redirect to login if token is not valid
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          navigate("/login"); // Redirect to login on error
        }
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handlePasswordUpdate = async () => {
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    try {
      const response = await fetch("/api/password/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setPassword("");
        setConfirmPassword("");
        setPasswordUpdated(true);
        setOpenResetSuccessDialog(true);
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      setApiError(error.message);
    }
  };

  const handleNavigate = () => {
    setOpenResetSuccessDialog(false);
    navigate("/login");
  };

  return (
    <>
      {tokenValid && (
        <LoginLayout showDiv={true}>
          <div className={classes.container}>
            <div className={classes.formText}>Let's set a new passowrd!</div>
            <TextField
              required
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              required
              label="Re-type Password"
              type="password"
              value={confirmPassword}
              error={passwordMismatch}
              helperText={passwordMismatch && "Passwords do not match"}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              onClick={handlePasswordUpdate}
              variant="contained"
              color="primary"
              disabled={!confirmPassword || !password}
            >
              Save Password
            </Button>
          </div>

          {openResetSuccessDialog && (
            <Dialog open={openResetSuccessDialog} fullWidth maxWidth="xs">
              <div className={classes.dialogSuccessContainer}>
                <div className={classes.dialogSuccessText}>
                  Your new password has been set!
                </div>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleNavigate}
                  fullWidth
                >
                  LET'S SIGN IN
                </Button>
              </div>
            </Dialog>
          )}
        </LoginLayout>
      )}
    </>
  );
};

export default UpdatePasswordPage;
