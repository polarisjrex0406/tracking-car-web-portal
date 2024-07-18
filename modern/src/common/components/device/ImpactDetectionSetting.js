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
import { useTranslation } from "../LocalizationProvider";
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
    marginTop: '4px'
    // marginTop: theme.spacing(2),
  },
  switchContainer: {
    display: "flex",
    // alignItems: "baseline",
    marginBottom: '20px'
  },
}));

const ImpactDetectionSetting = ({ setSetting, deviceId, notificationsList }) => {
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const currentUser = useSelector((state) => state.session.user);
  const [currentDevice, setCurrentDevice] = useState({});
  const [fuelAlert, setFuelAlert] = useState(false);

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
        const speedAlert = item.filter((x) => x.type.toLowerCase() === "alarm".toLowerCase() && x?.attributes?.alarms == 'accident')[0];
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
      (x) => x.type.toLowerCase() === "alarm".toLowerCase() && x?.attributes?.alarms == 'accident'
    )[0]

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
    } else {
      alert("No Alarmy type accident is detected. Please Enable it.")
    }
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
              sx={{ background: "rgb(255, 255, 255)", marginBottom: "20px" }}
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
                  }}
                >
                  Impact Detection
                </Typography>
                <div className={classes.sliderContainer}>
                  <Switch
                    checked={fuelAlert}
                    onChange={(e) => handleAlertChange(e)}
                    //   color='green'
                    // sx={{ p: 0 }}
                    color="success"
                  />
                </div>
              </Box>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                Crash Detection and Notification may be unavailable in certain instances, such as when the Bouncie Adapter is damaged or dislodged, or when cellular or other signals are unavailable or intermittent. If the Adapter experiences a loss of wireless service, then no data will be transmitted. Please refer to the Terms of Service for more information.
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "40px" }}>
                 By enabling this feature, you agree to Bouncie's Terms of Service and Privacy Policy.
              </Typography>
            </Box>
          </Drawer>
        </div>
      </div>
    </>
  );
};

export default ImpactDetectionSetting;
