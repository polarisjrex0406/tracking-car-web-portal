// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DeviceList from "../../main/DeviceList";
import BottomMenu from "../components/BottomMenu";
import HeaderMenu from "../components/HeaderMenue";
import { useLocalization, useTranslation } from '../components/LocalizationProvider';
// import useFilter from '../../main/useFilter';
// import usePersistedState from '../util/usePersistedState';

const useStyles = makeStyles((theme) => ({
  sidebar: {
    pointerEvents: "none",
    display: "flex",
    paddingTop: "63px",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      position: "fixed",
      left: 0,
      top: 0,
      height: "100%",
      width: theme.dimensions.drawerWidthDesktop,
      margin: 0,
      zIndex: 3,
    },
    [theme.breakpoints.down("md")]: {
      height: "100%",
      width: "100%",
    },
  },
  toolbar: {
    display: "flex",
    gap: theme.spacing(1),
  },
  filterPanel: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    width: theme.dimensions.drawerWidthTablet,
  },
  middle: {
    flex: 1,
    display: "grid",
  },
  contentList: {
    pointerEvents: "auto",
    gridArea: "1 / 1",
    zIndex: 4,
    background: "rgb(94, 107, 140)",
    // paddingTop: '65px',
  },
  header: {
    // paddingTop: '64px',
    pointerEvents: "auto",
    // zIndex: 5,
  },
  footer: {
    pointerEvents: "auto",
    zIndex: 5,
  },
}));

const Sidebar = () => {
  const classes = useStyles();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const [deviceList, setDeviceList] = useState(null);
  const [keyword, setKeyword] = useState("");
  const filteredDevices = useSelector((state) => state.devices.items);
  const devicesList = Object.values(filteredDevices);
  const t = useTranslation();
  const filtered = Object.values(filteredDevices).filter((device) => {
    const lowerCaseKeyword = keyword.toLowerCase();
    return [
      device.name,
      device.uniqueId,
      device.phone,
      device.model,
      device.contact,
    ].some((s) => s && s.toLowerCase().includes(lowerCaseKeyword));
  });

  useEffect(() => {
    // const filtered = Object.values(devices)
    setDeviceList(filteredDevices);
  }, [filteredDevices, deviceList]);
  return (
    <div className={classes.sidebar}>
      {devicesList.length > 5 && (
        <div className={classes.header}>
          <HeaderMenu keyword={keyword} setKeyword={setKeyword} />
        </div>
      )}
      <div className={classes.middle}>
        <Paper square className={classes.contentList}>
          <DeviceList devices={filtered} />
        </Paper>
      </div>
      {desktop && (
        <div className={classes.footer}>
          <BottomMenu />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
