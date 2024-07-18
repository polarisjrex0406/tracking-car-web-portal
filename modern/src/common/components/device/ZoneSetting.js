import React, { useState, useEffect } from "react";
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
    borderRadius: "1px",
    padding: "0.8em 1.2em",
    boxShadow: `0px 0px 8px ${theme.palette.grey[300]}`,
    display: "flex",
    justifyContent: "space-between",
    height: "70px",
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
    position: 'absolute',
    top: '-39px',
    left: '0',
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
    borderRadius: "8px",
    // width: '317px',
    // height: '266px',
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    outline: "none",
    padding: "0 32px",
  },
  buttonContainer: {
    marginTop: theme.spacing(4),
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

const ZoneSetting = ({
  setSetting,
  deviceId,
  getSelectedGeofence,
  showZoneSetting,
  notificationsList,
  refreshZoneData
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const t = useTranslation();

  const currentUser = useSelector((state) => state.session.user);
  const filteredDevices = useSelector((state) => state.devices.items);
  const filtered = Object.values(filteredDevices);
  const selectedDevice = filtered.find((device) => device.id == deviceId);
  const geoFences = useSelector((state) => state.geofences.items);

  const geoFencesItems = Object.values(geoFences);

  const initialFuelAlert = selectedDevice?.attributes?.fuelLimit !== undefined;
  const initialFuelLimit = initialFuelAlert
    ? selectedDevice.attributes.fuelLimit
    : 30;
  const [fuelAlertStates, setFuelAlertStates] = useState(
    geoFencesItems.map(() => initialFuelAlert)
  );
  const [enterGeoZOneSwitch, setEnterGeoZOneSwitch] = useState(false);
  const [ExitGeoZoneSwitch, setExitGeoZoneSwitch] = useState(false);
  // const [notificationsList, setNotificationsList] = useState([]);
  const [geoFenceList, setGeoFenceList] = useState([]);

  const handleFuelAlertChange = async (item, index) => {
    const deviceConnection = {
      deviceId: deviceId,
      geofenceId: item.id,
    };
    const updatedStates = [...fuelAlertStates];
    updatedStates[index] = !updatedStates[index];
    setFuelAlertStates(updatedStates);
    //  console.log("updatedStates",updatedStates[index]);
    const url = "/api/permissions"; // Adjust the URL as needed

    if (updatedStates[index]) {
      // console.log("running");
      // If the switch is checked, make a POST request
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(deviceConnection),
        });

        if (!response.ok) {
          throw Error(await response.text());
        }
      } catch (error) {
        console.error("Error making POST request:", error);
      } finally {
        refreshZoneData(true)
      }
    } else {
      // console.log("deleted");
      // If the switch is unchecked, make a DELETE request
      const deleteUrl = `/api/permissions`; // Adjust the delete URL
      try {
        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(deviceConnection),
        });

        if (!response.ok) {
          throw Error(await response.text());
        }
      } catch (error) {
        console.error("Error making DELETE request:", error);
      } finally {
        refreshZoneData(true)
      }
    }
  };
  const [fuelLimit, setFuelLimit] = useState(initialFuelLimit);

  const handleFuelLimitChange = (event, newValue) => {
    setFuelLimit(newValue);
  };
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    async function fetchGeoFences() {
      try {
        const geoFencesResponse = await fetch(`/api/geofences`);
        const items = await geoFencesResponse.json();
        setGeoFenceList(items);

        // After fetching geoFences, call fetchUpdatedGeoFences
        fetchUpdatedGeoFences();
      } catch (error) {
        console.error("Error fetching geofences:", error);
      }
    }

    async function fetchUpdatedGeoFences() {
      try {
        const updatedGeoFencesResponse = await fetch(
          `/api/geofences?deviceId=${deviceId}`
        );
        const updatedGeoFencesData = await updatedGeoFencesResponse.json();
        const temp = [];
        const updatedFencesWithChecked = geoFencesItems.map((geofence) =>
          updatedGeoFencesData.some(
            (activeGeofence) => activeGeofence.id === geofence.id
          )
            ? temp.push(true)
            : temp.push(false)
        );
        setFuelAlertStates(temp);
      } catch (error) {
        console.error("Error fetching updated geofences:", error);
      }
    }

    // Call fetchGeoFences when the component mounts or when dependencies change
    fetchGeoFences();
  }, [dispatch, deviceId, geoFences, showZoneSetting]);

  const selectedGeoFence = (item) => {
    getSelectedGeofence(item);
    navigate(`/geofences/${deviceId}/${item.id}`);
  };

  const handleZoneAlertChange = async (event, alertType) => {
    const check = event.target.checked;
    const notification = notificationsList.filter(
      (x) => x.type.toLowerCase() === alertType.toLowerCase()
    )[0];

    if (notification) {
      if (alertType == "geofenceEnter") setEnterGeoZOneSwitch(check);
      if (alertType == "geofenceExit") setExitGeoZoneSwitch(check);

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

  // const getNotifications = async () => {
  //   try {
  //     const response = await fetch("/api/notifications", {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     if (response.ok) {
  //       const item = await response.json();
  //       setNotificationsList(item);
  //       getNotificationsAgainstDevice();
  //     } else {
  //       throw Error(await response.text());
  //     }
  //   } catch (error) {
  //     dispatch(errorsActions.push(error.message));
  //   }
  // };

  useEffect(() => {
    setEnterGeoZOneSwitch(false);
    setExitGeoZoneSwitch(false);
    getNotificationsAgainstDevice(notificationsList);
  }, [deviceId]);

  const getNotificationsAgainstDevice = async () => {
    try {
      const response = await fetch(`/api/notifications?deviceId=${deviceId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const item = await response.json();
        const enterAlert = item.filter((x) => (x.type)?.toLowerCase() === ("geofenceEnter")?.toLowerCase())[0];
        const exitAlert = item.filter((x) => (x.type)?.toLowerCase() == ("geofenceExit")?.toLowerCase())[0];
        if (enterAlert) setEnterGeoZOneSwitch(true);
        if (exitAlert) setExitGeoZoneSwitch(true);
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      dispatch(errorsActions.push(error.message));
    }
  };

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
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "rgb(42, 49, 66)",
                  marginBottom: "15px",
                }}
              >
                Geo-Zones
              </Typography>
              <Typography variant="body1">
                Think of a Geo-Zone as geo-matric zone surrounding a location,
                like a target. You can set up Geo-Zones to send you an alert
                when a vehicle goes inside and/or outside the zone.
              </Typography>

              <div className={classes.buttonContainer}>
                <Button
                  onClick={() => navigate(`/geofences/${deviceId}`)}
                  className={classes.btnContainer}
                  variant="contained"
                >
                  ADD GEO-ZONE
                </Button>
              </div>
            </Box>
            <Divider sx={{ padding: "15px 0 0px", marginBottom: "15px" }} />
            <Box>
              <Box key="1" sx={{ display: "flex", justifyContent: "center" }}>
                <Box
                  style={{ marginLeft: "0px" }}
                  className={classes.innerText}
                >
                  <span
                    style={{ marginLeft: "0px" }}
                    className={classes.innerText}
                  >
                    Alert when <strong>Entering</strong> Geo-Zone
                  </span>
                </Box>
                <Switch
                  checked={enterGeoZOneSwitch}
                  onChange={(e) => handleZoneAlertChange(e, "geofenceEnter")}
                  //   color='green'
                  color="success"
                />
              </Box>
              <Box key="2" sx={{ display: "flex", justifyContent: "center" }}>
                <Box
                  style={{ marginLeft: "0px" }}
                  className={classes.innerText}
                >
                  <span
                    style={{ marginLeft: "0px" }}
                    className={classes.innerText}
                  >
                    Alert when <strong>Exiting</strong> Geo-Zone
                  </span>
                </Box>
                <Switch
                  checked={ExitGeoZoneSwitch}
                  onChange={(e) => handleZoneAlertChange(e, "geofenceExit")}
                  //   color='green'
                  color="success"
                />
              </Box>
            </Box>
            <Divider sx={{ marginBottom: "15px" }} />
            <Box
              sx={{
                padding: theme.spacing(4),
                overflow: "auto",
                height: "calc(100vh - 559px)",
              }}
            >
              {geoFenceList &&
                geoFenceList.map((item, index) => (
                  <Box key={item.id} className={classes.driverData}>
                    <Box
                      className={classes.innerText}
                      style={{ cursor: "pointer" }}
                      onClick={() => selectedGeoFence(item)}
                    >
                      <Typography className={classes.innerText}>
                        {item?.name}
                      </Typography>
                    </Box>
                    <Switch
                      checked={fuelAlertStates[index]}
                      onChange={() => handleFuelAlertChange(item, index)}
                      //   color='green'
                      color="success"
                    />
                  </Box>
                ))}
            </Box>
          </Drawer>
        </div>
      </div>
    </>
  );
};

export default ZoneSetting;
