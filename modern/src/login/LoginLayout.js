import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import Footer from "../common/layout/Footer";
import movoLogo from "../resources/images/movo.png";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  form: {
    maxWidth: theme.spacing(52),
    padding: theme.spacing(5),
    width: "100%",
  },
  logoBar: {
    width: "100%",
    padding: "10px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    background: "#DCDCDC",
  },
}));

const LoginLayout = ({ children, showDiv }) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div className={classes.paper}>
      {showDiv ? (
        <div style={{ padding: "10px", width: "100%" }}>
          <div className={classes.logoBar}>
            <img
              style={{
                width: "100px",
              }}
              alt=""
              src={movoLogo}
            />
          </div>
        </div>
      ) : (
        <div></div>
      )}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <form className={classes.form}>{children}</form>
      </div>
      <Footer />
    </div>
  );
};

export default LoginLayout;
