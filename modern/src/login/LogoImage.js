import React from "react";
// import { useTheme } from '@mui/material';
// import { useSelector } from 'react-redux';
import { makeStyles } from "@mui/styles";
import logo from "../resources/images/movo.png";

const useStyles = makeStyles(() => ({
  image: {
    alignSelf: "center",
    maxWidth: "240px",
    maxHeight: "120px",
    width: "auto",
    height: "auto",
  },
}));

const LogoImage = ({ parentLogo }) => {
  const classes = useStyles();
  // const expanded = !useMediaQuery(theme.breakpoints.down('lg'));

  // const logo = useSelector((state) => state.session.server.attributes?.logo);
  // const logoInverted = useSelector((state) => state.session.server.attributes?.logoInverted);

  return <img className={classes.image} src={logo} alt="" />;
};

export default LogoImage;
