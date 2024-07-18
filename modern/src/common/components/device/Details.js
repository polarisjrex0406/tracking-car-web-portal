/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import engineIcon from "../../../resources/images/engine.png";
import batteryIcon from "../../../resources/images/battery.png";
import ConfirmDeleteVehicleModal from "../../../vehicle/DeleteVehicleModal";
import { devicesActions } from "../../../store";
import { useEffectAsync } from "../../../reactHelper";
import InsuranceBox from "./InsuranceBox";
import VehicleSummaryBox from "./VehicleSummaryBox";
import { useTranslation } from "../../components/LocalizationProvider";
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

const useStyles = makeStyles(() => ({
  root: {
    inset: 0,
    overflow: "auto",
    paddingBottom: "16px",
    // height: "70vh",
  },
  childBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  innerBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  image: {
    width: "50px", // Set the appropriate width
    height: "50px", // Set the appropriate height
    objectFit: "contain",
  },
  text: {
    textTransform: "uppercase",
    fontSize: "14px",
    fontFamily: "Roboto",
    marginBottom: "0",
    fontWeight: "500",
    color: "rgb(48 48 48)",
  },
  innerText: {
    fontSize: "1rem",
    fontFamily: "Roboto",
    marginBottom: "0.5em",
    fontWeight: "500",
    color: "rgb(48 48 48)",
    textTransform: "capitalize",
  },
  innerDetailText: {
    fontSize: "14px",
    fontFamily: "Roboto",
    marginBottom: "0.8em",
    // fontWeight: 'bold',
    color: "rgb(48 48 48)",
  },
  headerText: {
    fontSize: "1.1em",
    fontFamily: "Roboto",
    margin: "0.8em 0.5em",
    // fontWeight: 'bold',
    color: "rgb(48 48 48)",
    fontWeight: "bold",
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
    flexDirection: "column",
  },
  btnBox: {
    display: "flex",
    justifyContent: "center",
    padding: "15px",
  },

  insuranceInfo: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "1.1em",
    // color: "rgb(48 48 48)",
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

const Details = ({ filter, currentTab }) => {
  const classes = useStyles();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [vehicleReport, setVehicleReport] = useState({});
  const [positionDetail, setPositionDetail] = useState(null);
  const [batteryInfo, setBatteryInfo] = useState([]);
  const [engineInfo, setEngineInfo] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState([]);
  const [isBasic, setIsBasic] = useState(true);
  const speedUnit = useAttributePreference("speedUnit");
  const distanceUnit = useAttributePreference("distanceUnit");
  const volumeUnit = useAttributePreference("volumeUnit");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();
  const { pathname } = useLocation();
  const paths = pathname.split("/");
  const currentVehicleId = useSelector((state) => state.devices.selectedId);
  const filteredDevices = useSelector((state) => state.devices.items);
  const refreshState = useSelector((state) => state.devices.refresh);
  const history = useSelector((state) => state.session.history);
  const currentDate = new Date();
  const filtered = Object.values(filteredDevices);
  const todayStartDate = new Date(currentDate);
  todayStartDate.setDate(currentDate.getDate() - 1);
  const formattedCurrentDate = currentDate.toISOString();
  const convertToISO8601 = (date) => date.toISOString().split(".")[0] + "Z";
  const query = new URLSearchParams({
    deviceId: currentVehicleId,
    from: filter.fromDate,
    to: filter.toDate,
    daily: false,
  });
  const [initialized, setInitialized] = useState(false);
  const selectedDevice = filtered.find(
    (device) => device.id === currentVehicleId
  );

  useEffect(() => {
    if (selectedDevice?.attributes?.type && selectedDevice?.attributes?.type == "basic") {
      setIsBasic(true);
    } else {
      setIsBasic(false);
    }
  }, [selectedDevice])

  const handleOpenConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleConfirmation = async () => {
    const response = await fetch("/api/devices");
    if (response.ok) {
      dispatch(devicesActions.refresh(await response.json()));
    } else {
      throw Error(await response.text());
    }
    setIsConfirmationModalOpen(false);
    navigate("/");
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/reports/summary?${query.toString()}`, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const items = await response.json();
        if (items.length > 0) {
          setVehicleReport(items[0]);
        } else {
          setVehicleReport({});
        }
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      // Handle the error here if needed
    } finally {
      // setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    if (currentTab == "details") {
      setInitialized(false);
      // fetchPositionData()
      fetchData();
    }
  }, [currentVehicleId, currentTab]); // Add any dependencies here

  useEffect(() => {
    if (filter.filterName !== "") {
      setInitialized(false);
      // fetchPositionData()
      fetchData();
    }
  }, [filter]);

  useEffect(() => {
    if (refreshState && currentTab == "details") {
      // fetchPositionData()
      fetchData();
    }
  }, [refreshState]);

  // const fetchPositionData = async () => {
  //   if (selectedDevice?.positionId) {
  //     const response = await fetch(
  //       `/api/positions?id=${selectedDevice?.positionId}`
  //     );
  //     if (response.ok) {
  //       const positions = await response.json();
  //       if (positions.length > 0) {
  //         if (selectedDevice.attributes.type || positions[0].attributes.type == "basic") {
  //           setIsBasic(true);
  //         } else {
  //           setIsBasic(false);
  //         }
  //         setPositionDetail(positions[0]);
  //         getBatteryInfo(positions[0].attributes?.battery);
  //         getEngineInfo(positions[0].attributes);
  //         getDeviceInfo(selectedDevice);
  //         // fetchPosition(positions[0])
  //       }
  //     } else {
  //       throw Error(await response.text());
  //     }
  //   }
  // }

  useEffectAsync(async () => {
    if (selectedDevice?.positionId) {
      const response = await fetch(
        `/api/positions?id=${selectedDevice?.positionId}`
      );
      if (response.ok) {
        const positions = await response.json();
        if (positions.length > 0) {
          setPositionDetail(positions[0]);
          getBatteryInfo(positions[0].attributes?.battery);
          getEngineInfo(positions[0].attributes);
          getDeviceInfo(selectedDevice);
          // fetchPosition(positions[0])
        }
      } else {
        throw Error(await response.text());
      }
    }
  }, [filteredDevices]);

  const getBatteryInfo = (batteryLevel) => {
    let color = "";
    let status = "";
    if (batteryLevel) {
      if (batteryLevel >= 3.8) {
        // 100% battery level.
        color = "#ACC63E";
        status = "Normal";
      } else if (batteryLevel <= 3.7 && batteryLevel >= 3.2) {
        // Low battery alert (report BLP status to server)
        color = "#f4a20b";
        status = "Low";
      } else if (batteryLevel <= 3.3) {
        color = "#d93131";
        status = "Critical";
        // the device will shut down, on the server also can think it is 0%)
      } else {
        color = "#adadad";
        status = "N/A";
      }
    } else {
      color = "#adadad";
      status = "N/A";
    }
    setBatteryInfo([color, status]);
  };

  const getEngineInfo = (attributes) => {
    let color = "";
    let status = "";
    if (attributes.ignition === true) {
      color = "#ACC63E";
      status = "All Good";
    } else if (attributes.ignition === false) {
      color = "#f4a20b";
      status = "Offline";
    } else if (!attributes.ignition) {
      color = "#d93131";
      status = "Emergency";
    } else {
      color = "#adadad";
      status = "N/A";
    }

    setEngineInfo([color, status]);
  };

  const getDeviceInfo = (device) => {
    let color = "";
    let status = "";
    if (device?.status === "online") {
      color = "#ACC63E";
      status = "Online";
    } else if (device?.status === "offline") {
      color = "#f4a20b";
      status = "Offline";
    } else if (!device?.status === "unknown") {
      color = "#d93131";
      status = "N/A";
    } else {
      color = "#adadad";
      status = "N/A";
    }

    setDeviceInfo([color, status]);
  };

  return (
    <Box
      className={classes.root}
      sx={{ height: "calc(100vh - 188px)", overflowY: "scroll" }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            padding: "0 10px",
          }}
        >

          {/* {!isBasic && (
            <Box className={classes.childBox}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="a"
                width="51.6"
                height="51.6"
                viewBox="0 0 51.6 51.6"
              >
                <path
                  id="b"
                  d="M30.2,20.29c0,.57-.38,1.05-.84,1.05H13.61c-.46,0-.84-.48-.84-1.05V12.01c0-.57,.38-1.05,.84-1.05h15.75c.46,0,.84,.48,.84,1.05v8.28Zm1.65-8.9l-.04,29.25h2.22v2.06H8.9v-2.06h2.22V11.39c0-1.44,.96-2.49,2.11-2.49H29.86c1.15,0,1.99,1.05,1.99,2.49Zm10.74,22.4c.28,1.46,.04,3.06-.76,4.37-.8,1.26-2,1.94-3.29,1.94-2.32,0-4.17-2.23-4.17-5.05v-.15l.64-7.23c0-.97-.64-1.75-1.44-1.75h-.4v-2.09h.4c1.73,0,3.17,1.84,3.17,3.93v.15l-.68,7.14c.08,1.6,1.12,2.86,2.45,2.86,.76,0,1.44-.44,1.92-1.12,.44-.73,.56-1.6,.4-2.52l-1.56-8.93c-.16-.63-.28-1.41-.28-2.09v-2.19l-.8-1.41c.04-3.64-3.25-7.33-3.25-7.33l.88-1.7c6.74,3.11,6.26,8.69,6.26,8.69l-1.2,1.75h-.12v2.19c0,.53,.12,1.02,.24,1.6l1.6,8.93Z"
                  fill="#ACC63E"
                  fill-rule="evenodd"
                />
              </svg>
              <Typography
                style={{ fontSize: "12px" }}
                variant="h6"
                className={classes.text}
              >
                {t("fuel")}
              </Typography>
              <Typography variant="body2" className={classes.innerText}>
                {positionDetail?.attributes['Fuel Level']
                  ? positionDetail?.attributes['Fuel Level']?.toFixed(0)
                  : 0}
                L
              </Typography>
            </Box>
          )} */}
          <Box className={classes.childBox}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="a"
              width="51.6"
              height="51.6"
            >
              <path
                d="M7.21,37.5V16.72c0-1.03,.84-1.87,1.88-1.87h2.38v-1.83c0-.43,.36-.79,.79-.79h5.82c.43,0,.79,.35,.79,.79v1.83h13.82v-1.83c0-.43,.36-.79,.79-.79h5.82c.43,0,.79,.35,.79,.79v1.83h2.4c1.04,0,1.88,.84,1.88,1.87v20.77c0,1.03-.84,1.87-1.88,1.87H9.09c-1.04,0-1.88-.84-1.88-1.87Zm4.75-14.15h6.43v-2.22h-6.43v2.22Zm25.56,2.09v-2.09h2.1v-2.22h-2.1v-2.09h-2.23v2.09h-2.1v2.22h2.1v2.09h2.23Z"
                fill={batteryInfo[0] ? batteryInfo[0] : "#adadad"}
                fill-rule="evenodd"
              />
            </svg>
            <Typography
              style={{ fontSize: "12px" }}
              variant="h6"
              className={classes.text}
            >
              {t("positionBattery")}
            </Typography>
            <Typography variant="body2" className={classes.innerText}>
              {batteryInfo[1] ? batteryInfo[1] : "N/A"}
            </Typography>
          </Box>
          {!isBasic && (
            <Box className={classes.childBox}>
              {/* <img className={classes.image} src={engineIcon} alt="engineIcon" /> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="a"
                width="51.6"
                height="51.6"
                viewBox="0 0 51.6 51.6"
              >
                <g id="b">
                  <g id="c">
                    <path
                      id="d"
                      d="M23.86,34.24l2.22-5.89h-6.01l4.02-7.38h2.96l-2.65,4.87h5.42l-5.96,8.4Zm19.31-17.69c-.95,0-1.72,.77-1.72,1.72v1.19h-.98l-4.96-4.6-6.95-.03h-.28v-1.49h5.6v-1.98H15.81v1.98h5.6v1.49h-7.15c-.75,0-1.37,.77-1.37,1.72v2.03h-3.24c-.93,0-1.69,1.03-1.69,2.3v2.25h-1.31v-5.6h-1.98v18.06h1.98v-5.59h1.31v3.78c0,1.27,.76,2.3,1.69,2.3h3.58l4.27,4.14,6.66,.03h13.7c.72,0,1.31-.77,1.31-1.72v-2.91h2.27v2.11c0,.95,.77,1.72,1.72,1.72h2.04c.95,0,1.72-.77,1.72-1.72V18.27c0-.95-.77-1.72-1.72-1.72h-2.04Z"
                      fill={engineInfo[0] ? engineInfo[0] : "#adadad"}
                    />
                  </g>
                </g>
              </svg>
              <Typography
                style={{ fontSize: "12px" }}
                variant="h6"
                className={classes.text}
              >
                {t("engine")}
              </Typography>
              <Typography variant="body2" className={classes.innerText}>
                {engineInfo[1] ? engineInfo[1] : "N/A"}
              </Typography>
            </Box>
          )}

          <Box className={classes.childBox}>
            {/* <img className={classes.image} src="/obd.png" alt="engineIcon" /> */}
            <svg
              width="51.6"
              height="51.6"
              viewBox="0 0 50 25"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_4820_913)">
                <path
                  d="M48.9897 19.7C48.4597 17.69 47.9597 15.68 47.4397 13.67C46.6697 10.72 45.9297 7.76 45.1097 4.83C44.6497 3.2 43.6497 2.52 41.9997 2.51C40.2797 2.51 38.5597 2.4 36.8497 2.54C35.0997 2.68 33.6897 2.27 32.6497 0.8C32.2097 0.18 31.5697 0.0300003 30.8297 0.0400003C27.1697 0.0600003 23.4997 0.15 19.8497 0.0100003C18.0097 -0.0599997 16.5497 0.32 15.4597 1.85C15.0697 2.4 14.4897 2.52 13.8297 2.52C11.6497 2.5 9.4797 2.51 7.2997 2.52C5.4997 2.52 4.5597 3.21 4.0297 4.94C3.7097 5.99 3.4597 7.07 3.1797 8.13C2.1597 12.1 1.0897 16.05 0.139702 20.04C-0.510298 22.75 1.0697 24.64 3.8197 24.64C10.7297 24.64 17.6497 24.64 24.5597 24.64C28.6097 24.64 32.6497 24.64 36.6997 24.64C39.7697 24.64 42.8497 24.64 45.9197 24.64C47.0897 24.64 48.0097 24.17 48.5797 23.13C49.1697 22.05 49.2997 20.91 48.9797 19.71L48.9897 19.7ZM7.9297 12.51C8.2997 12.46 8.6697 12.46 8.9897 12.46H18.3297H40.0897C40.4397 12.46 40.7897 12.46 41.1297 12.49C41.7797 12.55 42.1897 12.94 42.2097 13.53C42.2297 14.15 41.8197 14.57 41.1197 14.66C40.8697 14.69 40.6197 14.69 40.3697 14.69H8.8197C8.5297 14.69 8.2197 14.69 7.8997 14.63C7.3197 14.53 6.9497 14.11 6.9697 13.56C6.9797 13.01 7.3597 12.6 7.9397 12.52L7.9297 12.51ZM11.0597 6.95C11.9997 6.95 12.7497 7.69 12.7597 8.63C12.7597 9.09 12.5897 9.53 12.2697 9.85C11.9497 10.17 11.5197 10.35 11.0497 10.35C10.1197 10.35 9.3997 9.65 9.3597 8.72C9.3397 8.25 9.4997 7.81 9.8097 7.48C10.1197 7.15 10.5497 6.96 11.0097 6.95H11.0497H11.0597ZM14.7697 7.45C15.0897 7.13 15.5197 6.95 15.9797 6.95C16.4397 6.95 16.8797 7.13 17.1997 7.45C17.5197 7.77 17.6897 8.21 17.6797 8.68C17.6597 9.62 16.9197 10.35 15.9297 10.35C15.0097 10.32 14.2997 9.6 14.2897 8.68C14.2897 8.21 14.4597 7.78 14.7797 7.46L14.7697 7.45ZM20.8897 6.95H20.8997C21.8297 6.95 22.5697 7.68 22.5997 8.61C22.6097 9.07 22.4397 9.51 22.1297 9.84C21.8197 10.17 21.3797 10.35 20.8997 10.36C19.9797 10.36 19.2597 9.67 19.2097 8.76C19.1797 8.3 19.3397 7.85 19.6497 7.51C19.9597 7.17 20.3797 6.98 20.8397 6.96H20.8997L20.8897 6.95ZM28.2697 6.95H28.2897C28.7597 6.95 29.1897 7.14 29.4997 7.47C29.8097 7.8 29.9797 8.24 29.9697 8.7C29.9397 9.62 29.1997 10.35 28.1997 10.35C27.7397 10.33 27.3197 10.13 27.0097 9.8C26.6997 9.46 26.5497 9.02 26.5797 8.55C26.6397 7.64 27.3697 6.96 28.2797 6.96L28.2697 6.95ZM31.9797 7.45C32.2997 7.13 32.7297 6.95 33.1897 6.95C33.6497 6.95 34.0897 7.13 34.3997 7.45C34.7197 7.77 34.8897 8.21 34.8797 8.68C34.8597 9.62 34.1197 10.35 33.1297 10.35C32.1997 10.32 31.4997 9.6 31.4897 8.67C31.4897 8.21 31.6597 7.77 31.9797 7.45ZM38.1097 6.95H38.1497C38.6097 6.95 39.0397 7.15 39.3497 7.48C39.6597 7.81 39.8197 8.25 39.8097 8.72C39.7697 9.64 39.0297 10.35 38.0197 10.35C37.0997 10.3 36.4097 9.56 36.4097 8.64C36.4097 7.69 37.1597 6.95 38.1097 6.95ZM34.8897 18.42C34.9097 18.89 34.7397 19.32 34.4297 19.66C34.1197 19.99 33.6897 20.18 33.1897 20.19C32.2397 20.19 31.4997 19.45 31.4897 18.5C31.4897 18.04 31.6597 17.61 31.9797 17.29C32.2997 16.97 32.7297 16.8 33.1897 16.8H33.2097C34.1397 16.8 34.8597 17.51 34.8897 18.44V18.42ZM29.9697 18.42C29.9897 18.88 29.8297 19.32 29.5097 19.66C29.1997 19.99 28.7697 20.18 28.2597 20.19C27.3197 20.19 26.5697 19.45 26.5597 18.51C26.5597 17.58 27.2397 16.85 28.1597 16.8H28.2497H28.2597C29.1797 16.8 29.9197 17.51 29.9597 18.43L29.9697 18.42ZM22.5897 18.55C22.5597 19.47 21.8197 20.19 20.8097 20.19C19.8897 20.15 19.1897 19.42 19.1897 18.49C19.1897 17.54 19.9397 16.79 20.8897 16.79H20.9197C21.3797 16.79 21.8097 16.98 22.1297 17.31C22.4397 17.64 22.6097 18.08 22.5897 18.54V18.55ZM17.6697 18.46C17.6697 18.92 17.5097 19.36 17.1897 19.69C16.8697 20.02 16.4397 20.2 15.9697 20.2C15.5097 20.2 15.0797 20.02 14.7597 19.7C14.4397 19.38 14.2697 18.95 14.2697 18.48C14.2697 17.55 14.9797 16.83 15.8997 16.8H15.9597C16.8897 16.8 17.6397 17.53 17.6597 18.46H17.6697ZM12.7497 18.48C12.7497 18.94 12.5797 19.38 12.2597 19.7C11.9397 20.02 11.5097 20.2 11.0397 20.2C10.5697 20.2 10.1397 20.02 9.8297 19.69C9.5097 19.36 9.3497 18.93 9.3597 18.46C9.3797 17.53 10.1297 16.8 11.0597 16.8H11.1197C12.0497 16.84 12.7497 17.56 12.7497 18.49V18.48ZM38.0997 16.79H38.1397C38.5997 16.8 39.0297 16.99 39.3397 17.32C39.6497 17.65 39.8097 18.09 39.7897 18.56C39.7497 19.48 39.0297 20.18 38.0897 20.19C37.6297 20.19 37.1997 20.01 36.8797 19.69C36.5597 19.37 36.3897 18.94 36.3897 18.47C36.3897 17.53 37.1397 16.79 38.0897 16.79H38.0997Z"
                  fill={deviceInfo[0] ? deviceInfo[0] : "#adadad"}
                />
              </g>
              <defs>
                <clipPath id="clip0_4820_913">
                  <rect width="49.15" height="24.63" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <Typography
              style={{ fontSize: "12px" }}
              variant="h6"
              className={classes.text}
            >
              {t("sharedDevice")}
            </Typography>
            <Typography variant="body2" className={classes.innerText}>
              {deviceInfo[1] ? deviceInfo[1] : "N/A"}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography className={classes.headerText}>
            {t("reportDaily")}
          </Typography>
          <Box className={classes.driverData}>
            <Typography variant="h6" className={classes.text}>
              {t("mapCurrentLocation")}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  {t("sharedDistance")}
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {`${distanceFromMeters(
                    vehicleReport?.distance,
                    distanceUnit
                  ).toFixed(0)} ${distanceUnit}`}
                </Typography>
              </Box>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  {t("reportDuration")}
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {vehicleReport?.engineHours
                    ? `${(vehicleReport.engineHours / (1000 * 60))?.toFixed(
                      0
                    )} minutes`
                    : "0  minutes"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  {t("fuelSpent")}
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {volumeToLiters(vehicleReport?.spentFuel, volumeUnit)} Liters
                </Typography>
              </Box>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  {t("maxSpeed")}
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {speedFromKnots(vehicleReport?.maxSpeed, speedUnit).toFixed(
                    0
                  )}{" "}
                  {speedUnit}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography className={classes.headerText}>
              Vehicle Summary
            </Typography>
            <IconButton onClick={() => navigate(`/device/${currentVehicleId}`)}>
              <EditIcon />
            </IconButton>
          </Box>
          <Box className={classes.driverData}>
            <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  NICKNAME
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {selectedDevice?.attributes?.nickName
                    ? selectedDevice?.attributes?.nickName
                    : "-"}
                </Typography>
              </Box>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  VEHICLE
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {selectedDevice?.model}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  ODOMETER
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {selectedDevice?.attributes?.currentMileage
                    ? selectedDevice?.attributes?.currentMileage
                    : "-"}
                </Typography>
              </Box>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  LICENSE PLATE
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {selectedDevice?.attributes?.licenseNo
                    ? selectedDevice?.attributes?.licenseNo
                    : "-"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  VIN
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {selectedDevice?.attributes?.vin}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  DEVICE IMEI
                </Typography>
                <Typography variant="body2" className={classes.innerDetailText}>
                  {selectedDevice?.uniqueId}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  ENGINE
                </Typography>
              </Box>
              <Box className={classes.innerBox} sx={{ flex: "1 1 0%" }}>
                <Typography variant="h6" className={classes.text}>
                  BODY STYLE
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box> */}

        <VehicleSummaryBox vehicleId={currentVehicleId}></VehicleSummaryBox>
        <InsuranceBox vehicleId={currentVehicleId}></InsuranceBox>

        <Box className={classes.btnBox}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpenConfirmationModal}
          >
            {t("deleteVehicle")}
          </Button>
        </Box>
      </Box>
      {isConfirmationModalOpen && (
        <ConfirmDeleteVehicleModal
          onConfirmation={handleConfirmation}
          onCancel={handleCloseConfirmationModal}
        />
      )}
    </Box>
  );
};

export default Details;
