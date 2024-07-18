/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Button, Typography, Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import { json, useNavigate, useLocation } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import deviceImei from "../../../resources/images/device.webp";
import tripsData from "../../util/trips";
import { useCatch, usePrevious } from "../../../reactHelper";
import {
  useAttributePreference,
  usePreference,
} from "../../../common/util/preferences";
import {
  altitudeFromMeters,
  distanceFromMeters,
  speedFromKnots,
  volumeFromLiters,
} from "../../../common/util/converter";

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
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #d5d5d5",
    cursor: "pointer",
    transition: "all .2s",
    "&:hover": {
      transform: "scale(1.01)",
    },
  },
  selectedTrip: {
    background: "rgba(0, 153, 255, 0.1)",
    border: "1px solid #a3d5f6 !important",
    borderRadius: "8px",
    padding: "0.8em 1.2em",
    boxShadow: "0px 0px 8px rgb(233, 233, 233)",
    display: "flex",
    marginBottom: "0.5em",
    fontFamily: "Roboto",
    fontSize: "0.9rem",
    flexDirection: "row",
    justifyContent: "space-between",
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
    // fontWeight: "500",
  },
  container: {
    textAlign: "center",
    paddingBottom: theme.spacing(2),
  },
  image: {
    width: 200,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  header: {
    fontFamily: "Roboto",
    fontSize: "1.4rem",
    color: "rgb(76, 76, 76)",
    textAlign: "center",
    padding: "0.3em",
    fontWeight: "700",
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
  listWrapper: {
    justifyContent: "space-between",
    height: "40px",
    display: "flex",
    alignItems: "center",
    padding: "0 4px",
  },
  happeningTripSection: {},
  text121212: {
    display: "flex",
    flexDirection: "column",
    height: "30px",
  },
  text223322: {
    fontSize: "16px",
    color: "#0e5bea",
    fontWeight: "500",
    textTransform: "uppercase",
    lineHeight: "13px",
  },
}));

const Trips = ({
  vehicleId,
  filter,
  checkForValue,
  singleTripLoader,
  eventTrip,
  currentTab,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const deviceId = useSelector((state) => state.devices.selectedId);
  const filteredDevices = useSelector((state) => state.devices.items);
  const filtered = Object.values(filteredDevices);
  const selectedItem = filtered.find((device) => device.id === deviceId);

  const speedUnit = useAttributePreference("speedUnit");
  const distanceUnit = useAttributePreference("distanceUnit");

  const history = useSelector((state) => state.session.history);
  const tripStatus = useSelector((state) => state.session.status);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleString("en-US", { month: "long" });
  const currentDay = currentDate.toLocaleString("en-US", { weekday: "long" });
  const currentDayOfMonth = currentDate.toLocaleString("en-US", {
    day: "2-digit",
  });

  const happeningTripMonth = `${currentMonth} ${currentYear}`;
  const happeningTripDay = `${currentDay}, ${currentMonth} ${currentDayOfMonth}`;
  // const happeningTripDay = `SUNDAY, AUGUST 27`;

  const index = localStorage.getItem("selected_trip_index");
  const [selectedTripId, setSelectedTripId] = useState(index);
  const [route, setRoute] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reqCheck, setReqCheck] = useState(true);
  const [tripLoading, setTripLoading] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(0);
  const [tripHappening, setTripHappening] = useState(false);
  const [tripHappeningData, setTripHappeningData] = useState({});
  const refreshDevice = useSelector((state) => state.devices.refresh);
  const [initialized, setInitialized] = useState(false);
  const [requestComplete, setRequestComplete] = useState(false);
  const [universalLoader, setUniversalLoader] = useState(false);
  const previousDeviceId = usePrevious(deviceId);

  const formatTime = (isoTime) => {
    const date = new Date(isoTime);
    const formattedTime = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const [time, amPm] = formattedTime?.split(" ");
    return `${time} ${amPm.toUpperCase()}`;
  };

  useEffect(() => {
    // if (Object.values(eventTrip).length && items.length) {
    if (eventTrip !== "" && items?.length) {
      const eventDateTime = new Date(eventTrip);
      let index = "";
      let selectedEventTrip = {};
      items.some((month, i) => {
        return month.list.some((day, j) => {
          return day.list.some((trip, k) => {
            const startTime = new Date(trip.startTime);
            const endTime = new Date(trip.endTime);
            if (eventDateTime >= startTime && eventDateTime <= endTime) {
              index = `${i}-${j}-${k}`;
              trip.loading = true;
              selectedEventTrip = trip;
              return true; // This will break out of the innermost loop
            }
            return false;
          });
        });
      });
      if (index !== "") {
        localStorage.setItem(
          "selected_trip",
          JSON.stringify([selectedEventTrip])
        );
        localStorage.setItem("selected_trip_index", index);
        setUniversalLoader(true);
        setSelectedTripId(index);
        checkForValue("trip");
      }
    }
  }, [eventTrip]);

  useEffect(() => {
    localStorage.removeItem("selected_trip");
    localStorage.removeItem("selected_trip_index");
    setLoading(true);
    setReqCheck(true);
    setItems([]);
    setTripHappening(false);
    handleRequest({ deviceId: vehicleId });
  }, [vehicleId, filter]);

  useEffect(() => {
    if (refreshDevice) {
      localStorage.removeItem("selected_trip");
      localStorage.removeItem("selected_trip_index");
      setLoading(true);
      setItems([]);
      setTripHappening(false);
      handleRequest({ deviceId: vehicleId });
    }
  }, [refreshDevice]);

  useEffect(() => {
    if (vehicleId && history[vehicleId]?.length) {
      if (reqCheck == false) handleRequest({ deviceId: vehicleId });
    }
  }, [history]);

  const handleRequest = useCatch(async ({ deviceId }) => {
    const query = new URLSearchParams({
      deviceId: vehicleId,
      from: filter.fromDate,
      to: filter.toDate,
      daily: true,
    });
    setReqCheck(true);
    try {
      const response = await fetch(`/api/reports/trips?${query.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length) {
          mapData(data);
        } else {
          setItems([]);
        }
        updateActiveTripStatusTreak();
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
      setInitialized(false);
    }
  });

  function updateActiveTripStatus() {
    const stat = tripStatus[vehicleId]?.tripStatus;
    if (stat) {
      setTripHappening(true);
    } else {
      setTripHappening(false);
    }
  }

  // useEffect(() => {
  //   updateActiveTripStatus();
  // }, [tripStatus]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });
    const day = date.toLocaleString("en-US", { weekday: "long" });
    const dayOfMonth = date.toLocaleString("en-US", { day: "2-digit" });
    return [`${month} ${year}`, `${day}, ${month} ${dayOfMonth}`];
  }

  const mapData = (inputArray) => {
    const resultArray = [];

    for (const item of inputArray) {
      const { startTime, distance } = item;
      const formattedDate = formatDate(startTime);

      const month = formattedDate[0];
      const dayAndDate = formattedDate[1];

      const monthEntry = resultArray.find((entry) => entry.month === month);
      if (!monthEntry) {
        resultArray.unshift({ month, distance: 0, list: [] });
      }

      const updatedMonthEntry = resultArray.find(
        (entry) => entry.month === month
      );
      updatedMonthEntry.distance += distance;

      const dayEntry = updatedMonthEntry.list.find(
        (entry) => entry.dayAndDate === dayAndDate
      );
      if (!dayEntry) {
        updatedMonthEntry.list.unshift({
          dayAndDate,
          distance: 0,
          list: [],
          loading: false,
        });
      }

      const updatedDayEntry = updatedMonthEntry.list.find(
        (entry) => entry.dayAndDate === dayAndDate
      );

      updatedDayEntry.distance += distance;

      updatedDayEntry.list.unshift({ ...item, loading: false });
    }
    inputArray.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // console.log(resultArray);

    setItems(resultArray);
    setReqCheck(false);
  };

  const tripDetail = (trip, index) => {
    setUniversalLoader(true);
    if (index == "0-0-0-0") {
      localStorage.setItem("selected_trip", JSON.stringify("undergoing_trip"));
      localStorage.setItem("selected_trip_index", "0-0-0-0");
      setSelectedTripId("0-0-0-0");
      checkForValue("tripHappening");
    } else {
      trip.loading = true;
      localStorage.setItem("selected_trip", JSON.stringify([trip]));
      localStorage.setItem("selected_trip_index", index);
      setSelectedTripId(index);
      checkForValue("trip");
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (currentTab !== "trips") {
      setTripLoading(false);
      setSelectedTripId(null);
      localStorage.removeItem("selected_trip");
      localStorage.removeItem("selected_trip_index");
      setSelectedTripId(null);
      setUniversalLoader(false);
    }
  }, [currentTab]);

  useEffect(() => {
    if (vehicleId !== previousDeviceId) {
      setTripLoading(false);
      setSelectedTripId(null);
      localStorage.removeItem("selected_trip");
      localStorage.removeItem("selected_trip_index");
      setSelectedTripId(null);
      setUniversalLoader(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    setTripLoading(singleTripLoader);
  }, [selectedItem]);

  function updateActiveTripStatusTreak() {
    if (selectedItem && selectedItem.hasOwnProperty('motionStreak')) {
      const stat = selectedItem?.motionStreak;
      if (stat) {
        setTripHappening(true);
      } else {
        setTripHappening(false);
      }
    }
  }
  useEffect(() => {
    updateActiveTripStatusTreak();
    // console.log('selectedItem', selectedItem)
  }, [selectedItem?.motionStreak]);

  useEffect(() => {
    if (!singleTripLoader && selectedTripId && items && items.length) {
      setUniversalLoader(false);
      const [firstIndex, secondIndex, thirdIndex] = selectedTripId.split("-");
      if (items[firstIndex]) {
        if (items[firstIndex].list[secondIndex]) {
          items[firstIndex].list[secondIndex].loading = false;
        } else if (items[firstIndex].list[secondIndex].list[thirdIndex]) {
          items[firstIndex].list[secondIndex].list[thirdIndex].loading = false;
        }
      }
    }
    // setUniversalLoader(null)
  }, [singleTripLoader]);

  const tripWeeklyDetail = (trips, index) => {
    setUniversalLoader(true);
    trips.loading = true;
    localStorage.setItem("selected_trip_index", index);
    localStorage.setItem("selected_trip", JSON.stringify(trips.list));
    setSelectedTripId(index);
    checkForValue("weekly-trip");
  };

  return (
    <>
      {loading ? (
        <div className="custom-progress-bar">
          <CircularProgress />
        </div>
      ) : items.length > 0 ? (
        <div style={{ height: "calc(100vh - 188px)", overflowY: "scroll" }}>
          {items.length &&
            items?.map((month, i) => (
              <Accordion
                key={i + 2323}
                expanded={i === expandedAccordion}
                onChange={handleAccordionChange(i)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id={`panel${i + 1}-header`}
                  sx={{ borderBottom: "1px solid #dadada", fontSize: "20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <strong>{month.month}</strong>
                  </div>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: "0px 6px 5px 0px" }}>
                  {month?.list?.map((trips, index) => (
                    <div key={index + 8923}>
                      {i == 0 &&
                        index == 0 &&
                        trips.dayAndDate.toLowerCase() !==
                        happeningTripDay.toLowerCase() && (
                          <div
                            className={
                              tripHappening ? "activeTrip" : "hiddenTrip"
                            }
                          >
                            <div className={classes.listWrapper}>
                              <span>
                                <strong style={{ textTransform: "uppercase" }}>
                                  {happeningTripDay}
                                </strong>
                              </span>
                              <span
                                style={{
                                  fontSize: "14px",
                                  cursor: "pointer",
                                  display: "flex",
                                }}
                                className="first-trippppppppppppppppppppp"
                                onClick={() =>
                                  tripWeeklyDetail(trips, `0-0-0-0-0-0`)
                                }
                              >
                                {selectedTripId === `0-0-0-0-0-0` &&
                                  universalLoader == true && (
                                    <div>
                                      <CircularProgress
                                        style={{
                                          width: "12px",
                                          height: "12px",
                                        }}
                                      />
                                    </div>
                                  )}
                                {distanceFromMeters(trips.distance, distanceUnit).toFixed(1)}
                                Total {distanceUnit}
                              </span>
                            </div>
                            <Box
                              key="0-0-0-0"
                              className={classes.happeningTripSection}
                              onClick={() =>
                                tripDetail(tripHappeningData, `0-0-0-0`)
                              }
                            >
                              <Box
                                style={{ justifyContent: "start" }}
                                className={`${classes.driverData} ${selectedTripId === `0-0-0-0`
                                  ? classes.selectedTrip
                                  : classes.driverData
                                  }`}
                              >
                                <img
                                  src="/device.png"
                                  style={{
                                    height: "32px",
                                    paddingRight: "11px",
                                  }}
                                  alt=""
                                ></img>
                                <Box className={classes.text121212}>
                                  <span className={classes.text223322}>
                                    Driving in progress
                                  </span>
                                  {/* <span>Started At 9:30 AM</span> */}
                                </Box>
                              </Box>
                            </Box>
                          </div>
                        )}
                      <div className={classes.listWrapper}>
                        <span>
                          <strong style={{ textTransform: "uppercase" }}>
                            {trips.dayAndDate}
                          </strong>
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            cursor: "pointer",
                            display: "flex",
                          }}
                          className="clickable"
                          onClick={() =>
                            tripWeeklyDetail(trips, `${i}-${index}`)
                          }
                        >
                          {selectedTripId === `${i}-${index}` &&
                            universalLoader === true && (
                              <div>
                                <CircularProgress
                                  style={{ width: "12px", height: "12px" }}
                                />
                              </div>
                            )}
                          {distanceFromMeters(trips?.distance, distanceUnit).toFixed(1)} Total 
                          {distanceUnit}
                        </span>
                      </div>
                      {i == 0 &&
                        index == 0 &&
                        trips.dayAndDate.toLowerCase() ===
                        happeningTripDay.toLowerCase() && (
                          <div
                            className={
                              tripHappening ? "activeTrip" : "hiddenTrip"
                            }
                          >
                            {i == 0 && index == 0 && tripHappening && (
                              <Box
                                key="0-0-0-0"
                                className={classes.happeningTripSection}
                                onClick={() =>
                                  tripDetail(tripHappeningData, `0-0-0-0`)
                                }
                              >
                                <Box
                                  style={{ justifyContent: "start" }}
                                  className={`${classes.driverData} ${selectedTripId === `0-0-0-0`
                                    ? classes.selectedTrip
                                    : classes.driverData
                                    }`}
                                >
                                  <img
                                    src="/device.png"
                                    style={{
                                      height: "32px",
                                      paddingRight: "11px",
                                    }}
                                    alt=""
                                  ></img>
                                  <Box className={classes.text121212}>
                                    <span className={classes.text223322}>
                                      Driving in progress
                                    </span>
                                    {/* <span>Started At 9:30 AM</span> */}
                                  </Box>
                                </Box>
                              </Box>
                            )}
                          </div>
                        )}

                      {trips.list?.map((trip, tripIndex) => (
                        <>
                          <Box
                            key={tripIndex + 2736}
                            onClick={() =>
                              tripDetail(trip, `${i}-${index}-${tripIndex}`)
                            }
                          >
                            <Box
                              className={`${classes.driverData} ${selectedTripId === `${i}-${index}-${tripIndex}`
                                ? classes.selectedTrip
                                : classes.driverData
                                }`}
                            >
                              <Box className={classes.innerText}>
                                {`${formatTime(trip.startTime)} to ${formatTime(
                                  trip.endTime
                                )}`}
                              </Box>
                              {selectedTripId ===
                                `${i}-${index}-${tripIndex}` &&
                                universalLoader == true && (
                                  <div>
                                    <CircularProgress
                                      style={{ width: "24px", height: "24px" }}
                                    />
                                  </div>
                                )}
                              <Box className={classes.innerText}>
                                <Typography
                                  sx={{
                                    fontFamily: "Roboto",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                  }}
                                >
                                  {distanceFromMeters(trip?.distance, distanceUnit).toFixed(
                                    1
                                  )}
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      textAlign: "center",
                                      fontFamily: "Roboto",
                                      paddingLeft: "3px",
                                    }}
                                  >
                                    {distanceUnit}
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </>
                      ))}
                    </div>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
        </div>
      ) : tripHappening ? (
        <>
          <Accordion
            key="0"
            expanded={expandedAccordion === 0}
            onChange={handleAccordionChange(0)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id={`panel${0 + 1}-header`}
              sx={{ borderBottom: "1px solid #dadada", fontSize: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <strong>{formatDate(new Date())[0]}</strong>
              </div>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: "0px 6px 5px 0px" }}>
              <Box
                sx={{ marginTop: "10px" }}
                key="0-0-0-0"
                className={classes.happeningTripSection}
                onClick={() => tripDetail(tripHappeningData, `0-0-0-0`)}
              >
                <Box
                  style={{ justifyContent: "start" }}
                  className={`${classes.driverData} ${selectedTripId === `0-0-0-0`
                    ? classes.selectedTrip
                    : classes.driverData
                    }`}
                >
                  <img
                    src="/device.png"
                    style={{
                      height: "32px",
                      paddingRight: "11px",
                    }}
                    alt=""
                  ></img>
                  <Box className={classes.text121212}>
                    <span className={classes.text223322}>
                      Driving in progress
                    </span>
                    {/* <span>Started At 9:30 AM</span> */}
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </>
      ) : (
        <div className={classes.deviceBox}>
          <Box className={classes.container}>
            {/* <img src={deviceImei} alt="alert" className={classes.image} /> */}
            <Typography className={classes.header}>No Trips, yet!</Typography>
            <Typography variant="body1">
              Just keep driving and check back later!
            </Typography>
          </Box>
        </div>
      )}
    </>
  );
};

export default Trips;
