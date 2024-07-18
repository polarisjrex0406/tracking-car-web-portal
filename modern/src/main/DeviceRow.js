import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import makeStyles from "@mui/styles/makeStyles";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IconButton,
  Tooltip,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Battery60Icon from "@mui/icons-material/Battery60";
import BatteryCharging60Icon from "@mui/icons-material/BatteryCharging60";
import Battery20Icon from "@mui/icons-material/Battery20";
import BatteryCharging20Icon from "@mui/icons-material/BatteryCharging20";
import ErrorIcon from "@mui/icons-material/Error";
import moment from "moment";
import { devicesActions } from "../store";
import {
  formatAlarm,
  formatBoolean,
  formatPercentage,
  formatStatus,
  getStatusColor,
} from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import { mapIconKey, mapIcons } from "../map/core/preloadImages";
import { useAdministrator } from "../common/util/permissions";
import { ReactComponent as EngineIcon } from "../resources/images/data/engine.svg";
import { useAttributePreference } from "../common/util/preferences";

const useStyles = makeStyles((theme) => ({
  icon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  greyIcon: {
    width: "25px",
    height: "25px",
    filter: "brightness(0) invert(1)",
  },
  noEffectsButton: {
    transition: "none",
    "&:hover, &:active, &:focus": {
      backgroundColor: "transparent",
      outline: "none",
      boxShadow: "none",
    },
  },
  batteryText: {
    fontSize: "0.75rem",
    fontWeight: "normal",
    lineHeight: "0.875rem",
  },
  positive: {
    color: theme.palette.colors.positive,
  },
  medium: {
    color: theme.palette.colors.medium,
  },
  negative: {
    color: theme.palette.colors.negative,
  },
  neutral: {
    color: theme.palette.colors.neutral,
  },
  statusDot: {
    top: "14px",
    left: "18px",
    width: "12px",
    height: "12px",
    zIndex: "999999",
    position: "absolute",
    background: "grey",
    borderRadius: "50%",
  },
  subTitle: {
    height: "20px",
    display: "block",
  },
}));
const selectedStyle = {
  display: "flex",
  margin: "0.5em 0px 0.5em 0.5em",
  width: "97%",
  background: "rgb(242, 242, 242)",
  borderRadius: "15px 0px 0px 15px",
  color: "rgb(42, 49, 65)",
};
const DeviceRow = ({ data, index, style }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  const navigate = useNavigate();
  const admin = useAdministrator();

  const { pathname } = useLocation();
  const paths = pathname.split("/");
  const currentVehicleId = localStorage.getItem("currentDeviceId");

  const item = data[index];

  const position = useSelector((state) => state);
  const selectedId = useSelector((state) => state.devices.selectedId);
  const refresh = useSelector((state) => state.devices.refresh);

  const isSelected = +selectedId
    ? item.id === +selectedId
    : item.id === +currentVehicleId;

  const devicePrimary = useAttributePreference("devicePrimary", "name");
  const deviceSecondary = useAttributePreference("deviceSecondary", "");

  const secondaryText = () => {
    // let status;
    // debugger
    // if (item.status === 'online' || !item.lastUpdate) {
    //   status = formatStatus(item.status, t);
    // } else {
    //   status = moment(item.lastUpdate).fromNow();
    // }
    return (
      <span className={classes.subTitle}>
        {item?.attributes?.year ? `${item?.attributes?.year} ` : " "}
        <span>{item?.attributes?.make}</span>
      </span>
    );
  };
  const handleCardClick = (itemId) => {
    dispatch(devicesActions.selectId(itemId));
    localStorage.setItem("currentDeviceId", itemId);
    if (itemId == +selectedId) {
      dispatch(devicesActions.refreshDevice(true));
    }
    if (paths[1] == "geofences") {
      navigate("/");
    }
    // Navigate to the desired route
    // navigate(`/vehicles/${itemId}/trips`);
  };

  useEffect(() => {
    if (currentVehicleId) dispatch(devicesActions.selectId(currentVehicleId));
  }, [currentVehicleId]);

  const changeImgOnError = (e) => {
    e.target.src = "/device-alt.png";
  };

  return (
    <div
      style={
        isSelected
          ? { ...style, ...selectedStyle }
          : { ...style, paddingLeft: "10px" }
      }
    >
      <ListItemButton
        className={classes.noEffectsButton}
        key={item.id}
        onClick={() => handleCardClick(item.id)}
        disabled={!admin && item.disabled}
        disableRipple
      >
        <ListItemAvatar>
          <div
            style={{
              background: item?.status == "online" ? "#7ED321" : "grey",
            }}
            className={classes.statusDot}
          ></div>
          <Avatar>
            <img
              className={
                item.uniqueId &&
                item?.attributes?.deviceImage &&
                item?.attributes?.deviceImage !== ""
                  ? classes.icon
                  : classes.greyIcon
              }
              src={
                item.uniqueId &&
                item?.attributes?.deviceImage &&
                item?.attributes?.deviceImage !== ""
                  ? `/api/media/${item.uniqueId}/${item.attributes.deviceImage}`
                  : mapIcons[mapIconKey(item.category)]
              }
              alt=""
              onError={(e) => {
                changeImgOnError(e);
              }}
            />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={item[devicePrimary]}
          primaryTypographyProps={{
            noWrap: true,
            color: isSelected ? "black" : "white",
          }}
          secondary={secondaryText()}
          secondaryTypographyProps={{
            noWrap: true,
            color: isSelected ? "black" : "white",
          }}
        />
        {/* {position && (
          <>
            {position.attributes.hasOwnProperty('alarm') && (
              <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                <IconButton size="small">
                  <ErrorIcon fontSize="small" className={classes.negative} />
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('ignition') && (
              <Tooltip title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}>
                <IconButton size="small">
                  {position.attributes.ignition ? (
                    <EngineIcon width={20} height={20} className={classes.positive} />
                  ) : (
                    <EngineIcon width={20} height={20} className={classes.neutral} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('batteryLevel') && (
              <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}>
                <IconButton size="small">
                  {position.attributes.batteryLevel > 70 ? (
                    position.attributes.charge
                      ? (<BatteryChargingFullIcon fontSize="small" className={classes.positive} />)
                      : (<BatteryFullIcon fontSize="small" className={classes.positive} />)
                  ) : position.attributes.batteryLevel > 30 ? (
                    position.attributes.charge
                      ? (<BatteryCharging60Icon fontSize="small" className={classes.medium} />)
                      : (<Battery60Icon fontSize="small" className={classes.medium} />)
                  ) : (
                    position.attributes.charge
                      ? (<BatteryCharging20Icon fontSize="small" className={classes.negative} />)
                      : (<Battery20Icon fontSize="small" className={classes.negative} />)
                  )}
                </IconButton>
              </Tooltip>
            )}
          </>
        )} */}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
