import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Divider,
  Typography,
  IconButton,
  useMediaQuery,
  Toolbar,
  Box,
  Button,
  Slider,
  Switch,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";

// import GeofencesList from './GeofencesList';
import { useTranslation } from "../../../common/components/LocalizationProvider";
// import MapGeocoder from '../map/geocoder/MapGeocoder';
import { errorsActions } from "../../../store";
import { useCatch } from "../../../reactHelper";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "rgb(242, 242, 242) !important",
  },
  content: {
    flexGrow: 1,
    overflow: "hidden",
    background: "rgb(242, 242, 242) !important",
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column-reverse",
    },
  },
  drawer: {
    zIndex: 100,
  },
  driverData: {
    background: "rgb(255, 255, 255)",
    // borderRadius: "8px",
    padding: "0.8em 1.2em",
    boxShadow: "0px 0px 8px rgb(233, 233, 233)",
    display: "flex",
    height: "5em",
    cursor: "pointer",
    borderBottom: "1px solid rgb(221, 221, 221)",
    color: "rgb(76, 217, 100)",
    alignItems: "center",
    marginBottom: "0.2em",
    fontFamily: "text-bold, sans-serif",
    fontSize: "0.9rem",
    flexDirection: "row",
    // justifyContent: "space-between",
  },
  innerText: {
    // padding: '2em 0px 0px',
    // textTransform: '',
    // width: '8em',
    fontSize: "1rem",
    color: "rgb(76, 217, 100)",
    fontFamily: "text-bold, sans-serif",
    marginRight: "10px",
    // flex: "0 0 auto",
    fontWeight: "700",
  },
  drawerPaper: {
    position: 'absolute',
    top: '-39px',
    left: '0',
    // position: 'relative',
    background: "rgb(242, 242, 242)",
    [theme.breakpoints.up("sm")]: {
      width: "390px",
    },
    [theme.breakpoints.down("sm")]: {
      height: theme.dimensions.drawerHeightPhone,
    },
  },
  mapContainer: {
    flexGrow: 1,
  },
  modalContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    // background: theme.palette.background.paper,
    // boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    borderRadius: "8px",
    // width: '317px',
    // height: '266px',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
  },
  buttonContainer: {
    marginTop: theme.spacing(8),
    display: "flex",
    gap: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  fileInput: {
    display: "none",
  },
  btnContainer: {
    borderRadius: "2px",
    fontSize: "0.8rem",
    padding: "1.5em 2.5em",
    fontFamily: "text-bold, sans-serif",
    cursor: "pointer",
    background: "rgb(31, 105, 242)",
    border: "1px solid rgb(14, 91, 234)",
    color: "rgb(255, 255, 255)",
    textTransform: "uppercase",
    transition: "all 0.3s ease 0s",

    "&:hover": {
      background: "rgb(14, 91, 234)",
      border: "1px solid rgb(31, 105, 242)",
    },
  },
  sliderContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(2),
  },
  switchContainer: {
    display: "flex",
    alignItems: "baseline",
  },
}));

const FuelLevelSetting = ({ setSetting, deviceId, notificationsList }) => {
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const currentUser = useSelector((state) => state.session.user);
  const [currentDevice, setCurrentDevice] = useState({});
  const [fuelAlert, setFuelAlert] = useState(
    currentDevice?.attributes?.fuelDropThreshold !== undefined
  );
  const [fuelLimit, setFuelLimit] = useState(0);
  const saveSpeedSetting = useCatch(async () => {
    const url = `/api/devices/${currentUser?.id}`;
    const updatedDevice = { ...currentDevice }; // Create a copy of the currentDevice
    if (updatedDevice && updatedDevice.attributes) {
      const updatedAttributes = { ...updatedDevice.attributes }; // Create a copy of attributes
      updatedAttributes.fuelDropThreshold = fuelLimit;
      updatedDevice.attributes = updatedAttributes;

      const response = await fetch(url, {
        method: !currentUser?.id ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDevice),
      });

      if (response.ok) {
        setFuelLimit(fuelLimit);
      } else {
        throw Error(await response.text());
      }
    }
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(`/api/devices`, {
          headers: {
            Accept: "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          const device = data.find((device) => +device.id === +deviceId);
          setCurrentDevice(device);
          if (device?.attributes?.fuelDropThreshold) setFuelLimit(device?.attributes?.fuelDropThreshold);
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        throw Error(await error.text());
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    getNotificationsAgainstDevice(notificationsList);
  }, [notificationsList]);

  const getNotificationsAgainstDevice = async () => {
    try {
      const response = await fetch(`/api/notifications?deviceId=${deviceId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const item = await response.json();
        const speedAlert = item.filter((x) => x.type == "deviceFuelDrop")[0];
        if (speedAlert) setFuelAlert(true);
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      dispatch(errorsActions.push(error.message));
    }
  };

  const handleAlertChange = async (event) => {
    const check = event.target.checked;
    const notification = notificationsList.filter(
      (x) => x.type.toLowerCase() === "deviceFuelDrop".toLowerCase()
    )[0];

    if (notification) {
      setFuelAlert(check);
      const method = check ? "POST" : "DELETE";
      const body = {
        deviceId: deviceId,
        notificationId: notification.id,
      };
      try {
        const response = await fetch("/api/permissions", {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (response.ok) {
          // alert("Alert changed successfully");
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        dispatch(errorsActions.push(error.message));
      }
    }
  };

  const handleFuelLimitChange = (event, newValue) => {
    setFuelLimit(newValue);
  };
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <div className={classes.root}>
        <div className={classes.content}>
          <Drawer
            className={classes.drawer}
            anchor={isPhone ? "bottom" : "left"}
            variant="permanent"
            classes={{ paper: classes.drawerPaper }}
          >
            <Toolbar
              sx={{ background: "rgb(255, 255, 255)", marginBottom: "16px" }}
            >
              <IconButton
                edge="start"
                sx={{ mr: 2 }}
                onClick={() => setSetting(false)}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                Back to Setting
              </Typography>
            </Toolbar>
            <Box className={classes.modalContent}>
              <Box className={classes.switchContainer}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    color: "rgb(42, 49, 66)",
                    marginBottom: "15px",
                  }}
                >
                  Fuel Level
                </Typography>
                <div className={classes.sliderContainer}>
                  <Switch
                    checked={fuelAlert}
                    onChange={(e) => handleAlertChange(e)}
                    //   color='green'
                    color="success"
                  />
                </div>
              </Box>
              <Typography variant="body1" sx={{ marginBottom: "40px" }}>
                Receive an alert when your vehicle’s fuel level drops below the
                set amount.
              </Typography>
              <Slider
                value={fuelLimit}
                aria-label="Speed"
                //    defaultValue={30}
                onChange={handleFuelLimitChange}
                valueLabelDisplay="on"
                valueLabelFormat={(value) => `${fuelLimit} %`}
                //   step={120}
                //    marks
                min={0}
                max={120}
              />

              <div className={classes.buttonContainer}>
                <Button onClick={() => setSetting(false)} variant="outlined">
                  CANCEL
                </Button>
                <Button
                  onClick={saveSpeedSetting}
                  className={classes.btnContainer}
                  variant="contained"
                >
                  SAVE
                </Button>
              </div>
            </Box>
          </Drawer>
        </div>
      </div>
    </>
  );
};

export default FuelLevelSetting;
