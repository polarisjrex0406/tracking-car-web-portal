import React, { useState, useEffect } from "react";
import {
 Tab, Tabs, Button, Typography, Box 
} from "@mui/material";
import TabList from "@mui/lab/TabList";
import { makeStyles } from "@mui/styles";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';
import moment from "moment";
import CircularProgress from "@mui/material/CircularProgress";
import {
  useAttributePreference,
  usePreference,
} from "../../../common/util/preferences";
import {
  altitudeFromMeters,
  distanceFromMeters,
  speedFromKnots,
  volumeFromLiters,
  volumeToLiters,
} from "../../../common/util/converter";

const useStyles = makeStyles((theme) => ({
  dot: {
    height: "17px",
    width: "17px",
    borderRadius: "50%",
    marginRight: "20px",
  },
  tripTimeWrapper: {
    background: "#F8F8F8",
    boxShadow: "0 0 3px -2px black",
    padding: "20px 35px",
  },
  table: {
    boxShadow: "rgba(0, 0, 0, 0.15) 0px 0px 4px 0px",
    marginBottom: "25px",
  },
  row: {
    padding: "0 15px",
    borderBottom: "1px solid #f1f1f1",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    height: "45px",
    alignItems: "center",
  },
  blueText: {
    color: "blue",
    fontSize: "20px",
    fontWeight: "500",
    paddingRight: "5px",
  },
  eventWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  eventItem: {
    display: "flex",
    height: "65px",
    alignItems: "center",
    padding: "0 0px 0 20px",
    border: "1px solid #e5e5e5",
    marginTop: "-1px",
    position: "relative",
  },
  time: {
    position: "absolute",
    top: "1px",
    right: "3px",
    fontSize: "11px",
    color: "#adadad",
  },
  noData: {
    fontSize: "23px",
    fontWeight: "500",
    textAlign: "center",
  },
}));

const TripDetailStats = ({ deviceId, routeData, tripSummary, tripDetails }) => {
  const classes = useStyles();
  const [value, setValue] = React.useState("1");
  const [tripDetail, setTripDetail] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const speedUnit = useAttributePreference("speedUnit");
  const distanceUnit = useAttributePreference("distanceUnit");
  const volumeUnit = useAttributePreference("volumeUnit");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    console.log('route data', routeData[0][routeData[0].length - 1].address)
    const selectedTrip = JSON.parse(localStorage.getItem("selected_trip"));
    if (selectedTrip && selectedTrip?.length > 0) setTripDetail(selectedTrip);

    const fetchData = async () => {
      if (deviceId) {
        const query = new URLSearchParams({
          deviceId: deviceId,
          from: selectedTrip[0].startTime,
          to: selectedTrip[selectedTrip?.length - 1].endTime,
          type: "allEvents",
        });
        try {
          setLoading(true);
          const response = await fetch(
            `/api/reports/events?${query.toString()}`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            // const data = tempEvents;
            const newData = await Promise.all(
              data.map(async (x, i) => {
                let image = "";
                if (i == 0) {
                  image = "/start-icon.svg";
                } else if (i == data.length - 1) {
                  image = "/end-icon.svg";
                } else if (data.type == "alarm") {
                  image = "/alarm-icon.svg";
                } else {
                  image = "/geo-zones-icon.svg";
                }
                return {
                  ...x,
                  address: "",
                  image: image,
                };
              })
            );
            setEvents(newData);
            // if (newData.length) getAddress(newData);
          } else {
            throw Error(await response.text());
          }
        } catch (error) {
          // Handle error
        } finally {
          setLoading(false);
        }
      } else {
        // setRoute(null);
      }
    };

    if (deviceId && selectedTrip && selectedTrip?.length !== 0) {
      fetchData();
    }
  }, [deviceId, routeData]);

  const getTime = () => {
    if (tripSummary) {
      const startDate = moment.utc(tripSummary.startTime);
      const endDate = moment.utc(tripSummary.endTime);
      const duration = moment.duration(endDate.diff(startDate));
      const minutesDifference = duration.asMinutes();
      return minutesDifference.toFixed(0);
    } else {
      return "--/--";
    }
  };

  const getAddress = async (data) => {
    console.log('getAdress')
    const tempData = [];
    for (const iterations of data) {
      const item = routeData.filter(
        (x) => x.fixTime === iterations.eventTime
      )[0];
      console.log('item', iterations)
      if (!item) {
        iterations.address = "";
      } else {
        if (item.address !== "") {
          iterations.address = item.address;
        } else {
          const apiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${item.latitude}&lon=${item.longitude}&format=json`;

          try {
            const response = await fetch(apiUrl);
            if (response.ok) {
              console.log('getAdressok')
              const data = await response.json();
              iterations.address = data.display_name;
            } else {
              console.log('bad')
              iterations.address = "";
            }
          } catch (error) {
            console.log("Error fetching location address:", error.message);
          }
        }
      }
      tempData.push(iterations);
    }
    setEvents(tempData);
  };

  useEffect(() => {
    console.log("tripSummary", tripSummary);
  }, [tripSummary]);

  return (
    <div>
      <div className={classes.tripTimeWrapper}>
        <div style={{ display: "flex" }}>
          <span
            className={classes.dot}
            style={{ background: "#DF0032" }}
          ></span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minWidth: "180px",
            }}
          >
            <span style={{ color: "#006EEA", fontWeight: "700" }}>
              Ended AT{" "}
              {tripDetail.length ? moment(tripDetail[tripDetail.length - 1].endTime).format(
                "h:mm:ss A"
              ) : '--/--'}
            </span>
            <span style={{ fontSize: "14px" }}>
              {(tripSummary?.endOdometer
                ? tripSummary?.endOdometer
                : 0
              )?.toLocaleString()}{" "}
            </span>
          </div>
          <span style={{ fontSize: "14px" }}>
            {routeData[0][routeData[0].length - 1]?.address?.toLocaleString()}
          </span>
        </div>
        <div style={{ display: "flex" }}>
          <span
            className={classes.dot}
            style={{ background: "#65D349" }}
          ></span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minWidth: "180px",
            }}
          >
            <span style={{ color: "#006EEA", fontWeight: "700" }}>
              Started AT {tripDetail.length ? moment(tripDetail[0]?.startTime).format("h:mm:ss A") : '--/--'}
            </span>
            <span style={{ fontSize: "14px" }}>
              {tripSummary?.startOdometer?.toLocaleString()}
            </span>
          </div>
          <span style={{ fontSize: "14px" }}>
            {routeData[0][0]?.address?.toLocaleString()}
          </span>
        </div>
      </div>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Details" value="1" />
            <Tab label="Events" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1" style={{ height: "151px", overflowY: "scroll" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "49%" }}>
              <div>
                <span style={{ fontWeight: "500", fontSize: "20px" }}>
                  Drive
                </span>
                <div className={classes.table}>
                  <div className={classes.row}>
                    <span>DISTANCE</span>
                    <div>
                      <span className={classes.blueText}>
                        {distanceFromMeters(
                          tripSummary?.distance,
                          distanceUnit
                        ).toFixed(2)}
                      </span>
                      <span>{distanceUnit}</span>
                    </div>
                  </div>
                  <div className={classes.row}>
                    <span>{distanceUnit}</span>
                    <div>
                      <span className={classes.blueText}>{getTime()}</span>
                      <span>Minutes</span>
                    </div>
                  </div>
                  <div className={classes.row}>
                    <span>Start Odometer</span>
                    <div>
                      <span className={classes.blueText}>
                        {tripSummary?.startOdometer
                          ? tripSummary.startOdometer.toFixed(0)
                          : "-"}
                      </span>
                      <span></span>
                    </div>
                  </div>
                  <div className={classes.row}>
                    <span>End Odometer</span>
                    <div>
                      <span className={classes.blueText}>
                        {tripSummary?.endOdometer
                          ? tripSummary.endOdometer.toFixed(0)
                          : "-"}
                      </span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <span style={{ fontWeight: "500", fontSize: "20px" }}>
                  Fuel
                </span>
                <div className={classes.table}>
                  <div className={classes.row}>
                    <span>Fuel Used</span>
                    <div>
                      <span className={classes.blueText}>
                        {volumeToLiters(tripSummary?.spentFuel, volumeUnit)}
                      </span>
                      <span>{volumeUnit ? volumeUnit : "Liters"}</span>
                    </div>
                  </div>
                  <div className={classes.row}>
                    <span>FUEL ECONOMY</span>
                    <div>
                      <span className={classes.blueText}>
                        {tripSummary?.spentFuel > 0 && tripSummary?.distance > 0
                          ? tripSummary?.distance / tripSummary?.spentFuel
                          : " 0 "}
                      </span>
                      <span>Km/l</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ width: "49%" }}>
              <div>
                <span style={{ fontWeight: "500", fontSize: "20px" }}>
                  Speed
                </span>
                <div className={classes.table}>
                  <div className={classes.row}>
                    <span>MAX SPEED</span>
                    <div>
                      <span className={classes.blueText}>
                        {speedFromKnots(
                          tripSummary?.maxSpeed,
                          speedUnit
                        ).toFixed(2)}
                      </span>
                      <span>{speedUnit}</span>
                    </div>
                  </div>
                  <div className={classes.row}>
                    <span>AVG. MOVING SPEED</span>
                    <div>
                      <span className={classes.blueText}>
                        {speedFromKnots(
                          tripSummary?.averageSpeed,
                          speedUnit
                        ).toFixed(0)}
                      </span>
                      <span>{speedUnit}</span>
                    </div>
                  </div>
                  <div className={classes.row}>
                    <span>Engine HOURS</span>
                    <div>
                      <span className={classes.blueText}>
                        {(tripSummary?.engineHours / (1000 * 60 * 60))?.toFixed(
                          0
                        )}
                      </span>
                      <span>Hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel value="2" style={{ height: "151px", overflowY: "scroll" }}>
          {loading ? (
            <div className="custom-progress-bar">
              <CircularProgress />
            </div>
          ) : (
            <div className={classes.eventWrapper}>
              {events.length ? (
                events?.map((item, index) => (
                  <div key={index} className={classes.eventItem}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <img
                        style={{
                          width: "40px",
                          height: "40px",
                          marginRight: "10px",
                        }}
                        src={item?.image}
                        alt=""
                      ></img>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "500" }}>{item?.type}</span>
                        <span style={{ fontSize: "14px" }}>{item.address}</span>
                      </div>
                    </div>
                    <span className={classes.time}>
                      {moment(item.eventTime).format("MM/DD/YYYY h:mm A")}
                    </span>
                  </div>
                ))
              ) : (
                <div className={classes.noData}>No Data Found</div>
              )}
            </div>
          )}
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default TripDetailStats;
