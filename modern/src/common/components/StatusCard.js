/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
// import {
//   useTheme,
// } from '@mui/material';
import {
  Card,
  // Typography,
  // CardActions,
  IconButton,
  useTheme,
  // CardMedia,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
// import ReplayIcon from '@mui/icons-material/Replay';
// import PublishIcon from '@mui/icons-material/Publish';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import PendingIcon from '@mui/icons-material/Pending';
import RemoveDialog from "./RemoveDialog";
// import { useDeviceReadonly } from '../util/permissions';
import { devicesActions } from "../../store";
import { useCatch } from "../../reactHelper";
import VehicleTabs from "./DeviceDetailedTab";
import MainMap from "../../main/MainMap";
import TabsFilter from "./device/TabsFilter";
import VehicleCard from "./VehicleCard";
import useFilterpositions from "../../main/useFilterpositions";
import TripDetail from "./device/TripDetail";

const useStyles = makeStyles((theme) => ({
  rootBox: {
    height: "100%",
  },
  card: {
    pointerEvents: "auto",
    width: theme.dimensions.popupMaxWidth,
    height: "100vh",
    background: "rgb(242, 242, 242)",
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  mediaButton: {
    color: theme.palette.colors.white,
    mixBlendMode: "difference",
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: theme.spacing(1, 1, 0, 2),
    background: "rgb(250,250,250)",
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: "scroll",
  },
  negative: {
    color: theme.palette.colors.negative,
  },
  icon: {
    width: "25px",
    height: "25px",
    filter: "brightness(0) invert(1)",
  },
  table: {
    "& .MuiTableCell-sizeSmall": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  cell: {
    borderBottom: "none",
  },
  mapBox: {
    marginLeft: "384px",
    height: "100%",
  },
  actions: {
    justifyContent: "space-between",
  },
  root: () => ({
    pointerEvents: "none",
    position: "fixed",
    // zIndex: 5,
    // left: '50%',
    [theme.breakpoints.up("md")]: {
      left: "460px",
      // bottom: theme.spacing(3),
    },
    [theme.breakpoints.down("md")]: {
      left: "50%",
      bottom: `calc(${theme.spacing(3)} + ${
        theme.dimensions.bottomBarHeight
      }px)`,
    },
    transform: "translateX(-50%)",
  }),
}));

const StatusCard = () => {
  const classes = useStyles();
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  // const deviceReadonly = useDeviceReadonly();
  const deviceId = useSelector((state) => state.devices.selectedId);
  const { pathname } = useLocation();
  const paths = pathname.split("/");
  const selectedDeviceId = paths[2];
  const positions = useSelector((state) => state.session.positions);
  const device = useSelector((state) => state.devices.items[deviceId]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectPosition = Object.values(positions);

  const [eventsOpen, setEventsOpen] = useState(false);
  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);
  // const deviceImage = device?.attributes?.deviceImage;
  const [removing, setRemoving] = useState(false);
  const [changeDevice, setChangeDevice] = useState(false);
  const onClose = () => dispatch(devicesActions.selectId(null));

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch("/api/devices");
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  useEffect(() => {
    setSelectedPosition(
      selectPosition.find((position) => position.deviceId === selectedDeviceId)
    );
    setChangeDevice(!changeDevice);
  }, [selectedDeviceId, positions]);

  useFilterpositions(positions, setFilteredPositions);

  return (
    <>
      {/* <div className={classes.rootBox}>
        <div className={classes.root}> */}
      {/* <Card className={classes.card}> */}
      {/* {deviceImage ? (
              <CardMedia
                className={classes.media}
                image={`/api/media/${device.uniqueId}/${deviceImage}`}
              >
                <IconButton
                  size="small"
                  onClick={onClose}
                  onTouchStart={onClose}
                >
                  <CloseIcon fontSize="small" className={classes.mediaButton} />
                </IconButton>
              </CardMedia>
            ) : ( */}
      {/* <div className={classes.header}>
              <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div> */}
      {/* <div> */}
      <TripDetail
        filteredPositions={filteredPositions}
        selectedPosition={selectedPosition}
        // onEventsClick={onEventsClick}
        selectedDeviceId={selectedDeviceId}
      />
      {/* <VehicleTabs /> */}
      {/* </div> */}
      {/* )} */}
      {/* <CardActions classes={{ root: classes.actions }} disableSpacing>
              <IconButton
                color="secondary"
                // onClick={(e) => setAnchorEl(e.currentTarget)}
                // disabled={!position}
              >
                <PendingIcon />
              </IconButton>
              <IconButton
                onClick={() => navigate('/replay')}
                // disabled={disableActions || !position}
              >
                <ReplayIcon />
              </IconButton>
              <IconButton
                onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                // disabled={disableActions}
              >
                <PublishIcon />
              </IconButton>
              <IconButton
                onClick={() => navigate(`/settings/device/${deviceId}`)}
                // disabled={disableActions || deviceReadonly}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => setRemoving(true)}
                // disabled={disableActions || deviceReadonly}
                className={classes.negative}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions> */}
      {/* </Card> */}
      {/* </div> */}
      {/* <div className={classes.mapBox}>
          <MainMap
            filteredPositions={filteredPositions}
            selectedPosition={selectedPosition}
            onEventsClick={onEventsClick}
          />
        </div> */}
      {/* <RemoveDialog
          open={removing}
          endpoint="devices"
          itemId={deviceId}
          onResult={(removed) => handleRemove(removed)}
        />
      </div> */}
      {/* <VehicleCard
        deviceId={selectedDeviceId}
        position={selectedPosition}
        onClose={() => dispatch(devicesActions.selectId(null))}
        desktopPadding={theme.dimensions.drawerWidthDesktop}
      /> */}
    </>
  );
};

export default StatusCard;
