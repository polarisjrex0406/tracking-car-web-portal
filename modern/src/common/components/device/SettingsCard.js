import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Divider,
  Typography,
  IconButton,
  useMediaQuery,
  Toolbar,
  Box,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import SpeedIcon from "@mui/icons-material/Speed";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import Drawer from "@mui/material/Drawer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import CarCrashIcon from '@mui/icons-material/CarCrash';
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
// import GeofencesList from './GeofencesList';
import { useTranslation } from "../../../common/components/LocalizationProvider";
// import MapGeocoder from '../map/geocoder/MapGeocoder';
import { errorsActions } from "../../../store";
import SpeedSetting from "./SpeedSetting";
import FuelLevelSetting from "./FuelLevelSetting";
import ZoneSetting from "./ZoneSetting";
import ImpactDetectionSetting from "./ImpactDetectionSetting";
import TripStartEndSetting from "./TripStartEndSetting";

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
    // color: 'rgb(76, 217, 100)',
    alignItems: "center",
    marginBottom: "0.2em",
    fontWeight: "bold",
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
    color: "rgb(92, 92, 92)",
    fontFamily: "text-bold, sans-serif",
    marginRight: "10px",
    marginLeft: "10px",
    // flex: "0 0 auto",
    fontWeight: "bold",
  },
  drawerPaper: {
    // position: 'relative',
    background: "rgb(242, 242, 242)",
    position: "absolute",
    top: "-39px",
    left: "0",
    height: "calc(100% + 53px)",
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
  title: {
    flexGrow: 1,
  },
  fileInput: {
    display: "none",
  },
}));

const SettingsCard = ({
  vehicleId,
  setSetting,
  getSelectedGeofence,
  refreshZoneData,
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showSpeedSetting, setShowSpeedSetting] = useState(false);
  const [showFuelSetting, setShowFuelSetting] = useState(false);
  const [showZoneSetting, setShowZoneSetting] = useState(false);
  const [showImpactDetectionSetting, setShowImpactDetectionSetting] = useState(false);
  const [showTripStartEndSetting, setShowTripStartEndSetting] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const t = useTranslation();

  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));

  // Get the last URL after navigation
  useEffect(() => {
    const check = localStorage.getItem("geofencepage");
    if (check) {
      setShowZoneSetting(true);
    }
    localStorage.removeItem("geofencepage");

    const getNotifications = async () => {
      try {
        const response = await fetch("/api/notifications", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const item = await response.json();
          setNotificationsList(item);
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        dispatch(errorsActions.push(error.message));
      }
    };
    getNotifications();
  }, []);

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
                {t("backToAlerts")}
              </Typography>
            </Toolbar>
            <Divider />
            <Box
              className={classes.driverData}
              onClick={() => setShowSpeedSetting(true)}
            >
              <SpeedIcon />
              <Box className={classes.innerText}>
                <Typography className={classes.innerText}>
                  {t("speed")}
                </Typography>
              </Box>
            </Box>
            <Box
              className={classes.driverData}
              onClick={() => setShowFuelSetting(true)}
            >
              <LocalGasStationIcon />
              <Box className={classes.innerText}>
                <Typography className={classes.innerText}>
                  {t("fuelLevel")}
                </Typography>
              </Box>
            </Box>
            <Box
              className={classes.driverData}
              onClick={() => setShowZoneSetting(true)}
            >
              <AddLocationAltIcon />
              <Box className={classes.innerText}>
                <Typography className={classes.innerText}>
                  {t("geoZone")}
                </Typography>
              </Box>
            </Box>
            <Box
              className={classes.driverData}
              onClick={() => setShowImpactDetectionSetting(true)}
            >
              <CarCrashIcon />
              <Box className={classes.innerText}>
                <Typography className={classes.innerText}>
                  Impact Detection
                </Typography>
              </Box>
            </Box>
            <Box
              className={classes.driverData}
              onClick={() => setShowTripStartEndSetting(true)}
            >
              <ModeOfTravelIcon />
              <Box className={classes.innerText}>
                <Typography className={classes.innerText}>
                  Trip Start and End
                </Typography>
              </Box>
            </Box>
          </Drawer>
        </div>
      </div>
      {showSpeedSetting ? (
        <SpeedSetting
          setSetting={setShowSpeedSetting}
          deviceId={vehicleId}
          notificationsList={notificationsList}
        />
      ) : (
        ""
      )}
      {showFuelSetting ? (
        <FuelLevelSetting
          setSetting={setShowFuelSetting}
          deviceId={vehicleId}
          notificationsList={notificationsList}
        />
      ) : (
        ""
      )}
      {showZoneSetting ? (
        <ZoneSetting
          setSetting={setShowZoneSetting}
          deviceId={vehicleId}
          getSelectedGeofence={getSelectedGeofence}
          showZoneSetting={showZoneSetting}
          notificationsList={notificationsList}
          refreshZoneData={refreshZoneData}
        />
      ) : (
        ""
      )}
      {showImpactDetectionSetting ? (
        <ImpactDetectionSetting
          setSetting={setShowImpactDetectionSetting}
          deviceId={vehicleId}
          notificationsList={notificationsList}
        />
      ) : (
        ""
      )}
      {showTripStartEndSetting ? (
        <TripStartEndSetting
          setSetting={setShowTripStartEndSetting}
          deviceId={vehicleId}
          notificationsList={notificationsList}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default SettingsCard;
