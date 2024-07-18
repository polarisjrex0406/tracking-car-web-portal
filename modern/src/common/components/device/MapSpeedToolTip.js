import React from "react";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  mapSpeedTooltip: {
    background: "white",
    boxShadow: "0 0 10px -3px black",
    borderRadius: "25px",
    fontSize: "16px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
    padding: "3px 10px",
  },
  mapSpeedTooltipWrapper: {
    position: "absolute",
    top: "30%",
    right: "10px",
    display: "flex",
    flexDirection: "column",
  },
  tooltipIcon: {
    height: "16px",
    width: "16px",
    borderRadius: "50%",
    marginRight: "4px",
  },
}));

const MapSpeedTooTip = () => {
  const classes = useStyles();
  return (
    <div>
      <div className={classes.mapSpeedTooltipWrapper}>
        <span className={classes.mapSpeedTooltip}>
          <i
            style={{ background: "#FD9026" }}
            className={classes.tooltipIcon}
          ></i>
          0-55 Km/h
        </span>
        <span className={classes.mapSpeedTooltip}>
          <i
            style={{ background: "#6AAF2B" }}
            className={classes.tooltipIcon}
          ></i>
          55-75 Km/h
        </span>
        <span className={classes.mapSpeedTooltip}>
          <i
            style={{ background: "#0054FF" }}
            className={classes.tooltipIcon}
          ></i>
          75-90 Km/h
        </span>
        <span className={classes.mapSpeedTooltip}>
          <i
            style={{ background: "#FF01EE" }}
            className={classes.tooltipIcon}
          ></i>
          90-120 Km/h
        </span>
        <span className={classes.mapSpeedTooltip}>
          <i
            style={{ background: "#FF0104" }}
            className={classes.tooltipIcon}
          ></i>
          120+ Km/h
        </span>
      </div>
    </div>
  );
};

export default MapSpeedTooTip;
