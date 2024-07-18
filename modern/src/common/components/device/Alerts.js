import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector } from "react-redux";
import bellIcon from "../../../resources/images/icon/bell.svg";
import events from "../../util/events";
import SettingsCard from "./SettingsCard";
import { useTranslation } from "../../components/LocalizationProvider";

const useStyles = makeStyles((theme) => ({
  deviceBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 255,
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
    paddingBottom: theme.spacing(2),
  },
  image: {
    // width: 200,
    // paddingTop: theme.spacing(2),
    // paddingBottom: theme.spacing(2),
  },
  button: {
    position: "relative",
    backgroundColor: "rgb(31, 105, 242)",
    border: "1px solid rgb(31, 105, 242)",
    color: "rgb(255, 255, 255)",
    fontFamily: "text-regular, sans-serif",
    boxSizing: "border-box",
    cursor: "pointer",
    borderRadius: 5,
    lineHeight: "3.2em",
    whiteSpace: "nowrap",
    fontSize: "0.9375em",
    padding: "0px 1.33333em",
    width: 280,
    transition: "all 300ms ease-in-out 0s",
    "&:hover": {
      backgroundColor: "rgb(79, 137, 245)",
    },
  },
  driverData: {
    background: "rgb(255, 255, 255)",
    borderRadius: "8px",
    padding: "0.8em 1.2em",
    boxShadow: "0px 0px 8px rgb(233, 233, 233)",
    display: "flex",
    marginBottom: "0.5em",
    fontFamily: "Roboto",
    fontSize: "0.9rem",
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  innerText: {
    // padding: '2em 0px 0px',
    // textTransform: '',
    // width: '8em',
    fontSize: "1rem",
    color: "rgb(92, 92, 92)",
    fontFamily: "Roboto",
    marginRight: "10px",
    flex: "0 0 auto",
    fontWeight: "bold",
  },
  innerDate: {
    fontFamily: "Roboto",
    position: "absolute",
    right: "9px",
    top: "4px",
    fontSize: "12px",
    color: "grey",
    fontWeight: "500",
  },
  header: {
    fontFamily: "Roboto",
    fontSize: "1.4rem",
    color: "rgb(76, 76, 76)",
    textAlign: "center",
    padding: "0.3em",
    fontWeight: "700",
  },
  btn: {
    display: "flex",
    flexDirection: "row-reverse",
  },
  clickable: {
    cursor: "pointer",
    background: "#80808014",
  },
}));

const Alerts = ({
  filter,
  getSelectedGeofence,
  eventTrip,
  currentTab,
  refreshZoneData,
}) => {
  const classes = useStyles();
  const navigation = useNavigate();
  const t = useTranslation();
  const { pathname } = useLocation();
  const paths = pathname.split("/");
  const currentVehicleId = useSelector((state) => state.devices.selectedId);
  const refreshState = useSelector((state) => state.devices.refresh);
  const history = useSelector((state) => state.session.history);
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toISOString();
  const [showSetting, setShowSetting] = useState(
    localStorage.getItem("geofencepage") &&
      localStorage.getItem("geofencepage") == true
      ? true
      : false
  );
  const [vehicleReport, setVehicleReport] = useState({});
  const [loading, setLoading] = useState(false);
  const [tripLoading, setTripLoading] = useState(false);
  const [reqCheck, setReqCheck] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(false);
  const clickables = [
    "geofenceEnter",
    "geofenceExit",
    "hardAcceleration",
    "hardBraking",
  ];

  // Get the last URL after navigation
  useEffect(() => {
    const check = localStorage.getItem("geofencepage");
    if (check) {
      setShowSetting(true);
    }
  }, []);

  const formatTime = (isoTime) => {
    try {
      const date = new Date(isoTime);

      if (isNaN(date)) {
        return "Invalid DATE";
      }

      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };

      return date.toLocaleString([], options);
    } catch (error) {
      return "Invalid DATE";
    }
  };

  // useEffect(() => {
  //   debugger
  //   if (currentVehicleId && history[currentVehicleId]?.length) {
  //     if (reqCheck == false) fetchData();
  //   }
  // }, [history]);

  const fetchData = async () => {
    const query = new URLSearchParams({
      deviceId: currentVehicleId,
      from: filter.fromDate,
      to: filter.toDate,
      type: "allEvents",
    });
    try {
      const response = await fetch(`/api/reports/events?${query.toString()}`, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const items = await response.json();
        items.map((x) => {
          return { ...x, loading: false };
        });
        const reverseItems = await [...items]?.reverse();
        setVehicleReport(reverseItems);
        //   }
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      // Handle the error here if needed
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    setInitialized(false);
  }, [currentVehicleId]);

  useEffect(() => {
    if (currentTab == "events" && !initialized) {
      setInitialized(false);
      setLoading(true);
      fetchData();
    }
  }, [currentVehicleId, currentTab]);

  useEffect(() => {
    if (refreshState) {
      if (initialized == true) {
        fetchData();
        setLoading(true);
      }
    }
  }, [refreshState, filter]);

  useEffect(() => {
    if (filter.filterName !== "") {
      setInitialized(false);
      setLoading(true);
      fetchData();
    }
  }, [filter]);

  const getAlertTitle = (trip) => {
    let title = "";
    if (
      Object.keys(trip.attributes).length !== 0 &&
      trip.attributes.hasOwnProperty(trip.type)
    ) {
      title = trip.attributes[trip.type];
    } else {
      title = trip.type;
    }
    return title?.replace(/([A-Z])/g, " $1");
  };

  const getImage = (trip) => {
    let img = "";
    if (trip.type == "ignitionOn" || trip.type == "ignitionOff") {
      img = "/marker.png";
    } else if (
      trip.type == "deviceMoving" ||
      trip.type == "deviceStopped" ||
      trip.type == "deviceOnline" ||
      trip.type == "deviceOffline" ||
      trip.type == "deviceUnknown"
    ) {
      img = "/device.png";
    } else if (trip.type == "alarm" || trip.type == "deviceOverspeed") {
      img = "/alert.png";
    } else {
      img = "/device.png";
    }
    return img;
  };

  const openTrip = async (trip, index) => {
    if (clickables.includes(trip.type)) {
      eventTrip(trip.eventTime);

      //   setSelectedIndex(index);
      //   setTripLoading(true);
      //   vehicleReport[index].loading = true;
      //   const date = new Date(trip.eventTime);
      //   const startOfDay = new Date(date);
      //   startOfDay.setHours(0, 0, 0, 0);
      //   const endOfDay = new Date(date);
      //   endOfDay.setHours(23, 59, 59, 999);
      //   const startOfDayISOString = startOfDay.toISOString();
      //   const endOfDayISOString = endOfDay.toISOString();
      //   try {
      //     const query = new URLSearchParams({
      //       deviceId: trip.deviceId,
      //       from: startOfDayISOString,
      //       to: endOfDayISOString,
      //     });
      //     const response = await fetch(`/api/reports/trips?${query.toString()}`, {
      //       headers: {
      //         Accept: "application/json",
      //       },
      //     });
      //     if (response.ok) {
      //       const data = await response.json();
      //       if (data.length) {
      //         const matchingTrip = data.find((event) => {
      //           const startTime = new Date(event.startTime);
      //           const endTime = new Date(event.endTime);

      //           return date >= startTime && date <= endTime;
      //         });
      //         eventTrip(matchingTrip);
      //       }
      //     } else {
      //       throw Error(await routeResponse.text());
      //     }
      //   } catch (error) {
      //     // Cathc Error
      //   } finally {
      //     // Cathc Error
      //     setSelectedIndex(index);
      //     setTripLoading(false);
      //   }
      // }
    }
  };

  return (
    <>
      <Box className={classes.btn}>
        <Button
          className="customButton"
          onClick={() => setShowSetting(true)}
          sx={{ marginBottom: "10px" }}
          variant="contained"
          color="primary"
        >
          {t("settingsTitle")}
        </Button>
      </Box>
      {loading ? (
        <div className="custom-progress-bar">
          <CircularProgress />
        </div>
      ) : (
        <div className="32323">
          {vehicleReport.length ? (
            <div style={{ height: "calc(100vh - 230px)", overflowY: "scroll" }}>
              {vehicleReport &&
                vehicleReport.map((trip, index) => (
                  <Box
                    key={index}
                    onClick={() => {
                      openTrip(trip, index);
                    }}
                  >
                    <Box
                      className={
                        clickables.includes(trip.type)
                          ? `${classes.clickable} ${classes.driverData}`
                          : classes.driverData
                      }
                    >
                      <img
                        style={{
                          width: "40px",
                          height: "40px",
                          marginRight: "10px",
                        }}
                        src={getImage(trip)}
                        alt=""
                      ></img>
                      <Box className={classes.innerText}>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}
                        >
                          {getAlertTitle(trip)}
                        </Typography>
                      </Box>
                      <Box>
                        {tripLoading == true && selectedIndex == index && (
                          <div
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "20px",
                            }}
                            className="custom-progress-bar"
                          >
                            <CircularProgress />
                          </div>
                        )}
                      </Box>
                      <Box className={classes.innerDate}>
                        {formatTime(trip.eventTime)}
                      </Box>
                    </Box>
                  </Box>
                ))}
            </div>
          ) : (
            <div className={classes.deviceBox}>
              <Box className={classes.container}>
                <img src={bellIcon} alt="alert" className={classes.image} />
                <Typography className={classes.header}>
                  No driving alerts, yet!
                </Typography>
                <Typography variant="body1">
                  Just keep driving and check back later!
                </Typography>
              </Box>
            </div>
          )}
          {showSetting ? (
            <SettingsCard
              vehicleId={currentVehicleId}
              setSetting={setShowSetting}
              getSelectedGeofence={getSelectedGeofence}
              refreshZoneData={refreshZoneData}
            />
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default Alerts;
