/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import moment from "moment";

import RemoveDialog from "../RemoveDialog";
import { devicesActions, sessionActions } from "../../../store";
import { useCatch } from "../../../reactHelper";
import VehicleTabs from "../DeviceDetailedTab";
import tripsData from "../../util/trips";
import TripDetailStats from "./TripDetailStats";
import MapSpeedTooTip from "./MapSpeedToolTip";
import { useAttributePreference } from "../../../common/util/preferences";
import useFilter from "../../../main/useFilter";
import usePersistedState from "../../util/usePersistedState";
import GoogleMainMapComponent from "../../../google-map/MainMap";
import ActiveTripDetailStats from "./ActiveTripDetailStats";

const useStyles = makeStyles((theme) => ({
  rootBox: {
    height: "100%",
    display: "flex",
  },
  card: {
    pointerEvents: "auto",
    width: theme.dimensions.popupMaxWidth,
    height: "calc(100vh - 64px)",
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
    height: "100%",
  },
  actions: {
    justifyContent: "space-between",
  },
  toggleButton: {
    position: "absolute",
    top: "-39px",
    background: "#5C5C5C",
    left: "37px",
    color: "white",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    width: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mapDownTripStatsWrapper: {
    position: "absolute",
    width: "calc(100% - 654px)",
    bottom: 0,
    background: "white",
    right: 0,
    transition: "all .3s",
  },
  root: {
    width: "385px",
  },
  // root: () => ({
  // pointerEvents: "none",
  // position: "fixed",
  // // zIndex: 5,
  // // left: '50%',
  // [theme.breakpoints.up("md")]: {
  //   // left: "460px",
  //   // bottom: theme.spacing(3),
  // },
  // [theme.breakpoints.down("md")]: {
  //   left: "50%",
  //   bottom: `calc(${theme.spacing(3)} + ${
  //     theme.dimensions.bottomBarHeight
  //   }px)`,
  // },
  // transform: "translateX(-50%)",
  // }),
  activeTripDetailBar: {
    position: "absolute",
    bottom: "15px",
    left: "50%",
    background: "white",
    width: "500px",
    borderRadius: "10px",
    transform: "translateX(-50%)",
    minHeight: "198px",
  },
}));

const TripDetail = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const deviceIdFromStorage = localStorage.getItem("currentDeviceId");

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const device = useSelector((state) => state.devices.items[selectedDeviceId]);
  const history = useSelector((state) => state.session.history);
  const status = useSelector((state) => state.session.status);
  const positions = useSelector((state) => state.session.positions);

  const speedUnit = useAttributePreference("speedUnit");
  const [route, setRoute] = useState([]);
  const [removing, setRemoving] = useState(false);
  const [tipsStats, setTipsStats] = useState(false);
  const [activeTipsStatsLoader, setActiveTipsStatsLoader] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState("trips");
  const [selectedGeofenceId, setSelectedGeofenceId] = useState(null);
  const [tripDetails, setTripDetails] = useState([]);
  const [completeTripSummaryData, setCompleteTripSummaryData] = useState(null);
  const [activeTripDetails, setActiveTripDetails] = useState({});
  const [otherMarker, setOtherMarker] = useState([]);
  const [mainMapView, setMainMapView] = useState(true);
  const [singleTripLoader, setSingleTripLoader] = useState(false);
  const [tripSummary, setTripSummary] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [keyword] = useState("");
  const [mainPage, setMainPage] = useState(true);
  const activeTripStatus = useSelector((state) => state.session.status);
  const [tripHappening, setTripHappening] = useState(false);
  const [tripType, setTripType] = useState("");
  const [refreshLiveDeviceLocation, setRefreshLiveDeviceLocation] = useState(false);

  const [filter] = usePersistedState("filter", {
    statuses: [],
    groups: [],
  });
  const [filterSort] = usePersistedState("filterSort", "");
  const [filterMap] = usePersistedState("filterMap", false);
  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions
  );
  const selectedItem = tripsData[0];

  // useEffect(() => {
  //   const stat = activeTripStatus[selectedDeviceId]?.tripStatus;
  //   if (stat) {
  //     setTripHappening(true);
  //   } else {
  //     setTripHappening(false);
  //   }
  // }, [activeTripStatus]);
  function updateActiveTripStatusTreak() {
    // console.log('selectedItem', device)
    const stat = device?.motionStreak;
    if (stat) {
      setTripHappening(true);

    } else {
      setTripHappening(false);
      dispatch(sessionActions.updateHistory([]));
    }
  }

  useEffect(() => {
    updateActiveTripStatusTreak()
  }, [device]);

  useEffect(() => {
    if (deviceIdFromStorage) {
      dispatch(devicesActions.selectId(+deviceIdFromStorage));
    }
  }, [deviceIdFromStorage]);

  // Function to remove all markers from the map and clear the state

  const clearMarkers = async () => {
    if (otherMarker.length) {
      for (const marker of otherMarker) {
        marker.remove();
      }
    }
    if (markers.length) {
      setMarkers([]);
    }
  };

  // Function to add a new marker to the state
  const addMarker = (newMarker) => {
    setOtherMarker((prevMarkers) => [...prevMarkers, newMarker]);
  };

  const getSelectedGeofence = (item) => {
    setSelectedGeofenceId(item.id);
  };

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
    clearMarkers();
    setRoute([]);
    const fetchData = async () => {
      if (selectedDeviceId) {
        setSingleTripLoader(true);
        fetchRouteWithSummary();
        fetchCompleteSummary();
      } else {
        setRoute(null);
        setTripSummary(null);
      }
    };

    if (selectedDeviceId && Object.keys(tripDetails).length !== 0) {
      fetchData();
    }
  }, [selectedItem, filters, tripDetails]);

  const fetchCompleteSummary = async () => {
    const reverseList =
      tripDetails.length > 1 ? tripDetails.reverse() : tripDetails;

    const query = new URLSearchParams({
      deviceId: selectedDeviceId,
      from: reverseList[0].startTime,
      to: reverseList[reverseList.length - 1].endTime,
    });
    try {
      const response = await fetch(`/api/reports/summary?${query.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompleteTripSummaryData(data[0]);
      } else {
        throw Error(await routeResponse.text());
      }
    } catch (error) {
      // Cathc Error
    }
  };

  const fetchRouteWithSummary = async () => {
    const routeList = [];
    const summariesList = [];

    try {
      const promises = tripDetails.map(async (iterator) => {
        const query = new URLSearchParams({
          deviceId: selectedDeviceId,
          from: iterator.startTime,
          to: iterator.endTime,
        });

        const [routeResponse, summaryResponse] = await Promise.all([
          fetch(`/api/reports/route?${query.toString()}`, {
            headers: {
              Accept: "application/json",
            },
          }),
          fetch(`/api/reports/summary?${query.toString()}`, {
            headers: {
              Accept: "application/json",
            },
          }),
        ]);

        let routeData;
        let summaryData;

        if (routeResponse.ok) {
          routeData = await routeResponse.json();
        }
        if (summaryResponse.ok) {
          summaryData = await summaryResponse.json();
          summariesList.push(summaryData[0]);
        }

        return { routeData, summaryData };
      });

      const results = await Promise.all(promises);

      // Process the results further if needed
      for (const iterator of results) {
        routeList.push(iterator.routeData);
        summariesList.push(iterator.summaryData[0]);
      }
    } catch (error) {
      // Handle error
    }
    console.log("Route data", routeList)

    setRoute(routeList);
    setTripSummary(summariesList);
    setSingleTripLoader(false);
    setMainMapView(false);
    // setListSpinner(false);

    if (routeList.length) {
      setTipsStats(true);
    }
  };

  const fetchZoneData = async () => {
    try {
      const response = await fetch(
        `/api/geofences?deviceId=${selectedDeviceId}`
      );
      if (response.ok) {
        const routeData = await response.json();
        setZoneData(routeData);
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      // Cathc Error
    }
  };

  useEffect(() => {
    clearMarkers();
  }, [selectedDeviceId]);

  const toggleTripsView = () => {
    setTipsStats(!tipsStats);
  };

  useEffect(() => {
    if (device && device.hasOwnProperty('motionStreak')) {
      if (device.motionStreak) {
        getActiveTripDetail();
      }
    }
  }, [device?.motionStreak]);

  const getActiveTripDetail = async () => {
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    yesterday.setUTCHours(19, 0, 0, 0);
    currentDate.setUTCHours(18, 59, 59, 999);

    const formattedFromDate = yesterday.toISOString();
    const formattedToDate = currentDate.toISOString();
    setActiveTipsStatsLoader(true);
    setTripHappening(true);
    try {
      const response = await fetch(
        `/api/reports/route/moving/position?deviceId=${selectedDeviceId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        prepareDataForActiveTrip(data);
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      // console.log(error.messaege)
    } finally {
      setRefreshLiveDeviceLocation(true)
    }
  };

  async function prepareDataForActiveTrip(data) {
    console.log('Active Trip', data);
    const orignalData = [...data];
    const reversedArray = data;
    if (reversedArray.length) {
      let check = false;
      const obj = [];
      let tripDistance = 0;
      let index = 0;
      for (const x of reversedArray) {
        if (index == 0 && x.attributes.motion == false) {
          break;
        }
        if (x.attributes.motion == true) {
          check = true;
          obj.push(x);
        }
        if (check && x.attributes.motion == false) {
          break;
        }
        index++;
      }
      for (let i = 0; i < reversedArray.length - 1; i++) {
        tripDistance += reversedArray[i].attributes.totalDistance - reversedArray[i + 1].attributes.totalDistance
      }
      // Define two moment objects representing your times
      const endTime = moment.utc(obj[0]?.fixTime);
      const startTime = moment.utc(obj[obj.length - 1]?.fixTime);

      // Calculate the difference in hours
      const durationInMin = endTime.diff(startTime, "minutes");

      const sortedArray = obj.reverse();
      const tempObj = {
        distance: tripDistance,
        startObj: sortedArray[0],
        endObj: sortedArray[sortedArray.length - 1],
        totalTripTime: durationInMin,
      };
      const result = sortedArray.map((x) => [x.longitude, x.latitude]);
      const flattenedArray = [];

      for (const key in history) {
        if (history.hasOwnProperty(key)) {
          flattenedArray[key] = [...history[key]];
        }
      }
      flattenedArray[selectedDeviceId] = result;
      dispatch(sessionActions.updateHistory(flattenedArray));

      setActiveTripDetails(tempObj);
      setActiveTipsStatsLoader(false);
    }
  }

  const getFilterData = (data) => {
    // setMarkers([]);
    clearMarkers();
    setFilters(data);
    setTripDetails([]);
    setActiveTripDetails(null);
    setRoute([]);
    setTipsStats(false);
    setMainMapView(false);
  };

  const checkForValue = (value) => {
    setTripType(value);
    setActiveTripDetails({});
    setTripDetails([]);
    if (value === "trip") {
      const data = localStorage.getItem("selected_trip");
      setTripDetails(JSON.parse(data));
    } else if (value === "tripHappening") {
      setMainMapView(true);
      setTripDetails([]);
      getActiveTripDetail();
      clearMarkers();
    } else if (value === "weekly-trip") {
      const data = localStorage.getItem("selected_trip");
      setTripDetails(JSON.parse(data));
      // setMainMapView(false);
    }
  };

  const changeActiveTab = async (tab) => {
    localStorage.removeItem("selected_trip");
    localStorage.removeItem("selected_trip_index");
    localStorage.removeItem("geofencepage");
    setMainMapView(true);
    clearMarkers();
    setActiveTab(tab);
    setTripDetails([]);
    setRoute([]);
    setTripType("");
    setTripHappening(false);
    setActiveTripDetails(null);
    setSelectedGeofenceId(null);
    setTipsStats(false);
  };

  useEffect(() => {
    localStorage.removeItem("geofencepage");
    localStorage.removeItem("selected_trip");
    localStorage.removeItem("selected_trip_index");
    setTripHappening(null);

    if (selectedDeviceId) {
      setMainPage(false);
      if (!mainMapView) {
        setMainMapView(true);
      }
      clearMarkers();
      setTripDetails([]);
      setRoute([]);
      setActiveTripDetails(null);
      setSelectedGeofenceId(null);
      setTipsStats(false);
      localStorage.removeItem("selected_trip_index");
      localStorage.removeItem("selected_trip");
      fetchZoneData();
    } else {
      setMainPage(true);
    }
  }, [selectedDeviceId]);

  const onEventsClick = useCallback((itemId) => {
    if (itemId) {
      clearMarkers();
      setTripDetails([]);
      setRoute([]);
      setActiveTripDetails(null);
      setSelectedGeofenceId(null);
      setTipsStats(false);
      // Navigate to the desired route
      navigate(`/vehicles/${itemId}/trips`);
    }
  });

  const refreshDeviceLocation = () => {
    getActiveTripDetail();
  };

  return (
    <div className={classes.rootBox}>
      {(!mainPage || selectedDeviceId) && (
        <div className={classes.root}>
          <Card className={classes.card}>
            <div className={classes.header} style={{ height: "40px" }}></div>
            <div style={{ position: "relative" }}>
              <VehicleTabs
                getFilterData={getFilterData}
                activeTab={changeActiveTab}
                checkForValue={checkForValue}
                getSelectedGeofence={getSelectedGeofence}
                singleTripLoader={singleTripLoader}
                selectedDeviceId={selectedDeviceId}
                refreshZoneData={fetchZoneData}
              />
            </div>
          </Card>
        </div>
      )}
      <div
        className={classes.mapBox}
        style={{
          height: tipsStats && route.length ? "calc(100% - 330px)" : " ",
          width: mainPage ? "100%" : "calc(100% - 385px)",
          position: "relative",
        }}
      >
        <GoogleMainMapComponent
          deviceFilteredPositions={filteredPositions}
          selectedDeviceId={selectedDeviceId}
          zoneData={zoneData}
          route={route}
          tripSummary={tripSummary}
          mainMapView={mainMapView}
          completeTripSummary={completeTripSummaryData}
          activeTripStatus={tripHappening}
          tripType={tripType}
          refreshLocation={refreshLiveDeviceLocation}
        />
        {route.length > 0 && <MapSpeedTooTip />}
        {tripHappening && tripType == "tripHappening" && (
          <div className={classes.activeTripDetailBar}>
            <ActiveTripDetailStats
              deviceId={selectedDeviceId}
              activeTripDetails={activeTripDetails}
              refreshDeviceLocation={refreshDeviceLocation}
              loader={activeTipsStatsLoader}
            ></ActiveTripDetailStats>
          </div>
        )}
      </div>
      {route.length > 0 && (
        <div className={classes.mapDownTripStatsWrapper}>
          <div className={classes.toggleButton}>
            <Button onClick={toggleTripsView} style={{ color: "white" }}>
              Trip Detail
              {tipsStats ? (
                <ArrowDropDownIcon fontSize="small" />
              ) : (
                <ArrowDropUpIcon fontSize="small" />
              )}
            </Button>
          </div>
          <div
            className={classes.mapDownTripStatsWrapperInner}
            style={{
              height: tipsStats ? "330px" : "1px",
              overflowY: tipsStats ? "hidden" : "auto",
            }}
          >
            <TripDetailStats
              deviceId={selectedDeviceId}
              routeData={route}
              tripSummary={completeTripSummaryData}
              tripDetails={tripDetails}
            ></TripDetailStats>
          </div>
        </div>
      )}

      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={selectedDeviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </div>
  );
};

export default TripDetail;
