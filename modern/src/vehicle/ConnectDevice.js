import React from "react";
import { makeStyles } from "@mui/styles";
import { Typography, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../common/layout/Navbar";
import deviceImei from "../resources/images/device.webp";
import ImeiInput from "./ImeiInput";
import { useCatch } from "../reactHelper";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  contentWrapper: {
    display: "flex",
    flexGrow: 1,
  },
  leftContent: {
    flex: 1,
    backgroundColor: "rgb(242, 242, 242)",
    height: "100%",
  },
  rightContent: {
    flex: 1,
    backgroundColor: "rgb(255, 255, 255)",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 450,
    width: "100%",
    marginTop: "3em",
    marginLeft: "auto",
    marginRight: "auto",
    alignSelf: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  container: {
    textAlign: "center",
    paddingBottom: "2.5em",
  },
  image: {
    width: "100%",
    padding: "16px",
  },
  text: {
    fontFamily: "sans-serif",
    fontSize: "1.2rem",
    color: "rgb(76, 76, 76)",
    textAlign: "center",
    paddingBottom: "0.5em",
    width: 400,
  },
  textLink: {
    cursor: "pointer",
    marginTop: "80px",
  },
  header: {
    fontFamily: "text-bold, sans-serif",
    fontSize: "30px",
    color: "rgb(76, 76, 76)",
    textAlign: "center",
    padding: "0.5em",
    fontWeight: "bold",
  },
}));

const ConnectDevice = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const paths = pathname.split("/");
  const VehicleId = paths[2];
  const filteredDevices = useSelector((state) => state.devices.items);
  const filtered = Object.values(filteredDevices);
  const selectedItem = filtered.find((device) => device.id === VehicleId);
  const handleSkipClick = () => {
    navigate("/"); // Navigate to the desired route
  };
  const handleSave = useCatch(async (imeiNumber) => {
    let url = `/api/devices`;
    if (VehicleId) {
      url += `/${VehicleId}`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uniqueId: imeiNumber }),
    });

    if (response.ok) {
      // if (onItemSaved) {
      //   onItemSaved(await response.json());
      // }
      navigate(-1);
    } else {
      throw Error(await response.text());
    }
  });
  return (
    <div className={classes.root}>
      <Navbar />

      <div className={classes.contentWrapper}>
        <div className={classes.leftContent}>
          <div className={classes.deviceBox}>
            <Box className={classes.container}>
              <Typography className={classes.header}>Device Info</Typography>
              <Typography className={classes.text}>
                We just need to link your movo device to your account.
              </Typography>
            </Box>
            <img src={deviceImei} alt="device" className={classes.image} />
          </div>
        </div>
        <div className={classes.rightContent}>
          <Box className={classes.container}>
            <Typography className={classes.text}>
              {" "}
              Please enter the full IMEI number on the back of your Bouncie
              device.
            </Typography>
            <ImeiInput onImeiComplete={handleSave} />
            <Typography onClick={handleSkipClick} className={classes.textLink}>
              Skip this step
            </Typography>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ConnectDevice;
