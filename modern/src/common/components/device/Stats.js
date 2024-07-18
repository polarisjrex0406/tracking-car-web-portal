import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useSelector } from "react-redux";
import { useTranslation } from "../../components/LocalizationProvider";
import {
  altitudeFromMeters,
  distanceFromMeters,
  speedFromKnots,
  volumeFromLiters,
  volumeToLiters,
} from "../../../common/util/converter";
import {
  useAttributePreference,
  usePreference,
} from "../../../common/util/preferences";

const moment = require("moment");

const useStyles = makeStyles(() => ({
  root: {
    // position: 'absolute',
    inset: 0,
    overflow: "auto",
    padding: "0 0em",
    flex: "0.1 1 0%",
  },
  rootBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    padding: "0 10px",
  },
  driverData: {
    background: "rgb(255, 255, 255)",
    borderRadius: "8px",
    padding: "0.8em 1.2em",
    boxShadow: "0px 0px 8px rgb(233, 233, 233)",
    display: "flex",
    marginBottom: "0.15em",
    fontFamily: "Roboto",
    fontSize: "0.9rem",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boldText: {
    // padding: '2em 0px 0px',
    // textTransform: '',
    width: "6em",
    fontSize: "1.1em",
    // color: "rgb(92, 92, 92)",
    fontFamily: "Roboto",
    marginRight: "10px",
    flex: "0 0 auto",
    fontWeight: "bold",
  },
  driverDetailBox: {
    padding: "10px 0px",
    fontFamily: "Roboto",
  },
  innerText: {
    // padding: '2em 0px 0px',
    // textTransform: '',
    width: "8em",
    fontSize: "13px",
    // color: "rgb(92, 92, 92)",
    fontFamily: "Roboto",
    marginRight: "10px",
    flex: "0 0 auto",
    textTransform: "capitalize",
  },
  innerTextHeading: {
    // padding: '2em 0px 0px',
    // textTransform: '',
    width: "8em",
    fontSize: "13px",
    // color: "rgb(92, 92, 92)",
    fontFamily: "Roboto",
    marginRight: "10px",
    flex: "0 0 auto",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  childText: {
    width: "6em",
    // padding: '2em 0px 0px',
    textTransform: "uppercase",
    fontSize: "0.8em",
    color: "rgb(149 149 149)",
    fontFamily: "Roboto",
    marginRight: "10px",
    flex: "0 0 auto",
    fontWeight: "bold",
  },
  insuranceInfo: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "1.1em",
    // color: "rgb(92, 92, 92)",
    fontFamily: "Roboto",
    marginRight: "10px",
    flex: "0 0 auto",
    fontWeight: "bold",
    lineHeight: "40px",
  },
  boxTitleBar: {
    display: "flex",
    justifyContent: "space-between",
  },
  infoColumn: {
    display: "flex",
    width: "50%",
    flexDirection: "column",
    paddingBottom: "10px",
  },
  infoBox: {
    display: "flex",
    flexWrap: "wrap",
  },
  infoColumnTitle: {},
  infoColumnButton: {
    cursor: "pointer",
    color: "#1F69F2",
    fontWeight: "500",
  },
  infoColumnText: {},
  customTextField: {
    width: "49%",
  },
}));

const Stats = ({ filter, currentTab }) => {
  const classes = useStyles();
  const { pathname } = useLocation();
  const t = useTranslation();
  const paths = pathname.split("/");
  const speedUnit = useAttributePreference("speedUnit");
  const distanceUnit = useAttributePreference("distanceUnit");
  const currentVehicleId = useSelector((state) => state.devices.selectedId);
  const refreshState = useSelector((state) => state.devices.refresh);
  const history = useSelector((state) => state.session.history);
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toISOString();
  const [vehicleReport, setVehicleReport] = useState({});
  const [trips, setTrips] = useState([]);
  const [events, setEvents] = useState([]);
  const [totalTime, setTotalTime] = useState(null);
  const [averageTime, setAverageTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [requestComplete, setRequestComplete] = useState(false);

  const fetchData = async (url, options) => {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      // Handle the error here if needed
      return null;
    }
  };

  const fetchDataForAll = async () => {
    setVehicleReport({});
    setTrips([]);
    setEvents([]);
    setAverageTime(0);
    setTotalTime(0);

    const query = new URLSearchParams({
      deviceId: currentVehicleId,
      from: filter.fromDate,
      to: filter.toDate,
      daily: false,
    });

    const tripsUrl = `/api/reports/trips?${query.toString()}`;
    const summaryUrl = `/api/reports/summary?${query.toString()}`;
    const eventsUrl = `/api/reports/events?${query.toString()}`;

    const tripsOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    const summaryOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    const eventsOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    try {
      const [tripsData, summaryData, eventsData] = await Promise.all([
        fetchData(tripsUrl, tripsOptions),
        fetchData(summaryUrl, summaryOptions),
        fetchData(eventsUrl, eventsOptions),
      ]);

      if (tripsData) {
        setTrips(tripsData);
      }

      if (summaryData && summaryData.length > 0) {
        setVehicleReport(summaryData[0]);
      }

      if (eventsData && eventsData.length > 0) {
        groupEvents(eventsData, eventsData.length);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    if (currentTab == "stats") {
      setInitialized(false);
      setLoading(true);
      fetchDataForAll();
    }
  }, [currentVehicleId, currentTab]);

  useEffect(() => {
    if (refreshState && currentTab == "stats") {
      fetchDataForAll();
    }
  }, [refreshState]);

  useEffect(() => {
    if (filter.filterName !== "") {
      setInitialized(false);
      setLoading(true);
      fetchDataForAll();
    }
  }, [filter]);

  // useEffect(() => {
  //   if (currentVehicleId && history[currentVehicleId]?.length) {
  //     fetchData();
  //     fetchTrips();
  //     fetchEvents();
  //   }
  // }, [history]);

  const groupEvents = (data, length) => {
    const groupedData = data.reduce((result, item) => {
      const { type } = item;
      if (!result[type]) {
        result[type] = 1;
      } else {
        result[type]++;
      }
      return result;
    }, {});

    const groupedArray = Object.entries(groupedData).map(([type, count]) => ({
      type,
      count,
      average: count / length,
    }));

    setEvents(groupedArray);
  };

  const getAlertTitle = (title) => {
    return title?.replace(/([A-Z])/g, " $1");
  };

  useEffect(() => {
    const startDate = moment(vehicleReport.startTime);
    const endDate = moment(vehicleReport.endTime);
    const diffMinutes = endDate.diff(startDate, "minutes");
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    const formattedTotalTime =
      (hours > 0 ? `${hours} hours ` : "") +
      (minutes > 0 ? `${minutes} minutes` : "");

    if (trips.length > 0) {
      const averageDurationMinutes = diffMinutes / trips.length;
      const averageHours = Math.floor(averageDurationMinutes / 60);
      const averageMinutes = averageDurationMinutes % 60;
      const formattedAverageTime = `${averageHours.toFixed(
        0
      )} hours ${averageMinutes.toFixed(0)} minutes`;

      setAverageTime(formattedAverageTime);
    }

    setTotalTime(formattedTotalTime);
  }, [vehicleReport, trips]);

  return (
    <>
      {loading ? (
        <div className="custom-progress-bar">
          <CircularProgress />
        </div>
      ) : (
        <Box
          className={classes.root}
          style={{ height: "calc(100vh - 188px)", overflowY: "scroll" }}
        >
          {/* Driving Box */}
          <Box
            className={classes.rootBox}
            sx={{ justifyContent: "space-around" }}
          >
            <Box sx={{ width: "70px !important" }} className={classes.boldText}>
              {t("driving")}
            </Box>
            <Box sx={{ paddingLeft: "10px" }} className={classes.childText}>
              {t("total")}
            </Box>
            <Box
              sx={{ width: "90px !important" }}
              className={classes.childText}
            >
              {t("average")}
            </Box>
          </Box>
          <Box className={classes.driverDetailBox}>
            <Box className={classes.driverData}>
              <Box className={classes.innerTextHeading}>{t("distance")}</Box>
              <Box className={classes.innerText}>
                {vehicleReport?.distance
                  ? `${distanceFromMeters(
                    vehicleReport?.distance,
                    distanceUnit
                  ).toFixed(1)
                    .toLocaleString()} ${distanceUnit}`
                  : `0  ${distanceUnit}`}
              </Box>
              <Box className={classes.innerText}>
                {vehicleReport?.distance && trips.length > 0
                  ? `${(+(distanceFromMeters(vehicleReport.distance / trips.length, distanceUnit)).toFixed(
                    1
                  )).toLocaleString()} ${distanceUnit}`
                  : `0  ${distanceUnit}`}
              </Box>
            </Box>
            <Box className={classes.driverData}>
              <Box className={classes.innerTextHeading}>{t("travelTime")}</Box>
              <Box className={classes.innerText}>{totalTime}</Box>
              <Box className={classes.innerText}>{averageTime}</Box>
            </Box>
            <Box className={classes.driverData}>
              <Box className={classes.innerTextHeading}>
                {t("reportEngineHours")}
              </Box>
              <Box className={classes.innerText}>
                {vehicleReport?.engineHours
                  ? `${vehicleReport.engineHours.toFixed(1)} `
                  : "0"}
              </Box>
              <Box className={classes.innerText}>
                {vehicleReport?.engineHours
                  ? `${vehicleReport.engineHours.toFixed(1)} `
                  : "0"}
              </Box>
            </Box>
          </Box>

          {/* Fuel Box */}
          <Box
            className={classes.rootBox}
            sx={{ justifyContent: "space-between" }}
          >
            <Box className={classes.boldText}>{t("fuel")}</Box>
            <Box className={classes.childText}>{t("total")}</Box>
            <Box className={classes.childText}>{t("average")}</Box>
          </Box>
          <Box className={classes.driverDetailBox}>
            <Box className={classes.driverData}>
              <Box className={classes.innerTextHeading}>{t("fuelUsed")}</Box>
              <Box sx={{ paddingLeft: "18px" }} className={classes.innerText}>
                {vehicleReport?.spentFuel
                  ? `${vehicleReport.spentFuel.toFixed(1)} liters`
                  : "0  liters"}
              </Box>
              <Box
                sx={{ paddingLeft: "13px", width: "98px !important" }}
                className={classes.innerText}
              >
                {vehicleReport?.spentFuel
                  ? `${(vehicleReport.spentFuel / trips.length).toFixed(
                    1
                  )} liters`
                  : "0  liters"}
              </Box>
            </Box>
          </Box>

          <Box
            className={classes.rootBox}
            sx={{ justifyContent: "space-between" }}
          >
            <Box className={classes.boldText}>{t("speed")}</Box>
            <Box className={classes.childText}>{t("average")}</Box>
          </Box>
          <Box className={classes.driverDetailBox}>
            <Box className={classes.driverData}>
              <Box
                sx={{ width: "72% !important" }}
                className={classes.innerTextHeading}
              >
                {t("maximumSpeed")}
              </Box>
              <Box
                sx={{ width: "85px !important" }}
                className={classes.innerText}
              >
                {vehicleReport?.maxSpeed
                  ? `${speedFromKnots(vehicleReport?.maxSpeed, speedUnit).toFixed(1)} ${speedUnit}`
                  : `0  ${speedUnit}`}
              </Box>
            </Box>
            <Box className={classes.driverData}>
              <Box
                sx={{ width: "72% !important" }}
                className={classes.innerTextHeading}
              >
                {t("averageSpeed")}
              </Box>
              <Box
                sx={{ width: "86px !important" }}
                className={classes.innerText}
              >
                {vehicleReport?.averageSpeed
                  ? `${speedFromKnots(vehicleReport?.averageSpeed, speedUnit).toFixed(1)} ${speedUnit}`
                  : `0  ${speedUnit}`}
              </Box>
            </Box>
          </Box>

          <Box
            className={classes.rootBox}
            sx={{ justifyContent: "space-between" }}
          >
            <Box className={classes.boldText}>{t("habits")}</Box>
            <Box className={classes.childText}>{t("total")}</Box>
            <Box className={classes.childText}>{t("average")}</Box>
          </Box>
          <Box className={classes.driverDetailBox}>
            {events.map((item) => (
              <Box className={classes.driverData}>
                <Box className={classes.innerTextHeading}>
                  {getAlertTitle(item.type)}
                </Box>
                <Box sx={{ paddingLeft: "20px" }} className={classes.innerText}>
                  {item?.count}
                </Box>
                <Box
                  sx={{ paddingLeft: "20px", width: "86px !important" }}
                  className={classes.innerText}
                >
                  {item.average.toFixed(1)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Stats;
