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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useSelector } from "react-redux";
import { useAttributePreference, usePreference } from "../../util/preferences";
import {
  altitudeFromMeters,
  distanceFromMeters,
  speedFromKnots,
  volumeFromLiters,
  volumeToLiters,
} from "../../util/converter";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
  },
  viewButton: {
    width: "20%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "700",
    // cursor: "pointer",
    // color: "#2555a1",
  },
  circleIcon: {
    height: "15px",
    width: "15px",
    borderRadius: "50%",
    border: "3px solid green",
  },
  addressText: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "440px",
    color: "#2555a1",
    fontSize: "16px",
  },
  refreshButton: {
    width: "100%",
    padding: "10px",
    background: "#ECEFF9",
    borderRadius: "4px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "15px",
    fontWeight: "bold",
    color: "#2555a1",
  },
}));

const ActiveTripDetailStats = ({
  deviceId,
  activeTripDetails,
  refreshDeviceLocation,
  loader,
}) => {
  const classes = useStyles();
  const selectedDevice = useSelector((state) => state.devices.items[deviceId]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [detail, setDetail] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [deviceSpeed, setDeviceSpeed] = useState(0);
  const [tripDistance, setTripDistance] = useState(0);
  const [currentTime, setCurrentTime] = useState(null);
  const [totalTripTime, setTotalTripTime] = useState(0);
  const [tripAddress, setTripAddress] = useState('');
  const distanceUnit = useAttributePreference("distanceUnit");
  const speedUnit = useAttributePreference("speedUnit");
  const selectedPosition = useSelector(
    (state) => state.session.positions[deviceId]
  );

  useEffect(() => {
    console.log('effect effect', selectedPosition)
    if (activeTripDetails?.startObj?.id) {
      const tempDistance =
      tripDistance + selectedPosition?.attributes?.distance;
      setTripDistance(tempDistance);
      setCurrentPosition(selectedPosition);
      setDeviceSpeed(selectedPosition?.speed);
      setTripAddress(selectedPosition?.address)
      const timeDifferenceInMs = moment(selectedPosition?.fixTime) - moment(activeTripDetails?.startObj?.fixTime);
      const timeDifferenceInMinutes = Math.floor(timeDifferenceInMs / (1000 * 60));
      setTotalTripTime(timeDifferenceInMinutes)
      // setCurrentTime(moment().format("h:mm:ss:A"));
      setCurrentTime(moment(selectedPosition?.fixTime).format("h:mm:ss:A"));
    }
  }, [selectedPosition]);

  useEffect(() => {
    if (activeTripDetails?.startObj?.id) {
      const item = activeTripDetails?.startObj;
      setStartTime(moment(item?.fixTime).format("h:mm:A"));
      setCurrentTime(moment(activeTripDetails?.endObj?.fixTime).format("h:mm:ss:A"));
      setTripDistance(activeTripDetails.distance);
      setDeviceSpeed(activeTripDetails?.startObj?.speed);
      setTotalTripTime(activeTripDetails?.totalTripTime);
      setTripAddress(activeTripDetails?.startObj?.address)
    }
  }, [activeTripDetails]);

  const refreshDevice = () => {
    refreshDeviceLocation(true);
  };

  console.log("Loader Check=>", loader);

  return loader ? (
    <div
      className="custom-progress-bar"
      style={{
        minHeight: "198px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </div>
  ) : (
    <div className={classes.wrapper}>
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid black",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "78%",
            padding: "15px",
            borderRight: "1px solid black",
            display: "flex",
          }}
        >
          <div style={{ width: "75%" }}>
            <span style={{ fontSize: "20px", fontWeight: "700" }}>Driving</span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  padding: "3px 10px",
                  border: "2px solid green",
                  borderRadius: "50px",
                  marginRight: "5px",
                }}
              >
                {startTime ? startTime : "--/--"}
              </span>
              <ArrowForwardIcon fontSize="small" />
              <span
                style={{
                  padding: "3px 10px",
                  border: "2px solid grey",
                  borderRadius: "50px",
                  marginRight: "5px",
                }}
              >
                {currentTime ? currentTime : "--/--"}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "right",
            }}
          >
            <span style={{ fontSize: "18px" }}>
              <span style={{ fontWeight: "700" }}>
                {speedFromKnots(deviceSpeed, speedUnit).toFixed(2)}
              </span>
              {" " + speedUnit}
              {/* <span style={{ fontWeight: "700" }}>
                  {(activeTripDetails.distance / 10).toFixed(0)}
                </span> */}
            </span>
            <span style={{ fontSize: "20px" }}>
              <span style={{ fontWeight: "700" }}>
                {totalTripTime}
              </span>
              mins
            </span>
          </div>
        </div>
        <div
          className={classes.viewButton}
          style={{ width: "20%", flexDirection: "column" }}
        >
          <span>Distance</span>
          <span>
            {distanceFromMeters(tripDistance, distanceUnit).toFixed(2)} {distanceUnit}
          </span>
        </div>
      </div>
      <div style={{ padding: "10px 15px", display: "flex" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "30px",
            marginTop: "-4px",
            marginRight: "7px",
          }}
        >
          <span className={classes.circleIcon}></span>
          <span
            style={{
              height: "30px",
              border: "1px solid grey",
              width: "2px",
              margin: "5px 0",
            }}
          ></span>
          <img height="20" width="20" src="/start-marker.png" alt="img"></img>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className={classes.addressText}>
            {tripAddress}
          </span>
          <span className="refreshButton" onClick={refreshDevice}>
            <RestartAltIcon fontSize="small" /> Refresh Device/Route
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActiveTripDetailStats;
