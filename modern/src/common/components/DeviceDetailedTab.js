// eslint-disable-next-line prefer-destructuring
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { makeStyles } from "@mui/styles";
import { Box, IconButton, Button } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useSelector } from "react-redux";
import moment from "moment";
import Trips from "./device/Trips";
import Stats from "./device/Stats";
import Alerts from "./device/Alerts";
import Details from "./device/Details";
import TabsFilter from "./device/TabsFilter";
import { useTranslation } from "../components/LocalizationProvider";
import { usePrevious } from "../../reactHelper";

const useStyles = makeStyles({
  tabContainer: {
    borderBottom: "1px solid rgb(204, 204, 204)",
    display: "flex",
    marginBottom: "1em",
  },
  tab: {
    // minWidth: 'unset',
    borderBottom: "5px solid rgb(242, 242, 242)",
    color: "rgb(92, 92, 92)",
    fontSize: "0.7rem",
    "&:hover": {
      borderBottom: "5px solid rgb(92, 92, 92)",
    },
  },
  selectedTab: {
    borderBottom: "5px solid rgb(31, 105, 242)",
    color: "rgb(92, 92, 92) !important",
    fontWeight: "bold",
    "&:hover": {
      borderBottom: "5px solid rgb(92, 92, 92)",
    },
  },
  indicator: {
    backgroundColor: "transparent",
  },
  tabContent: {
    padding: "0px 5px 16px 16px",
    overflow: "scroll",
    height: "calc(100vh - 150px);",
  },
  filterContainer: {
    position: "absolute",
    top: "-36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "0 10px",
  },
  filterButton: {
    fontSize: "14px",
    border: "1px solid #d1d1d1",
    height: "30px",
    color: "grey",
    padding: "0 10px",
  },
});

const VehicleTabs = ({
  getFilterData,
  activeTab,
  checkForValue,
  getSelectedGeofence,
  singleTripLoader,
  refreshZoneData,
}) => {
  const { pathname } = useLocation();
  const paths = pathname.split("/");
  const deviceId = useSelector((state) => state.devices.selectedId);
  const refreshState = useSelector((state) => state.devices.refresh);

  const previousDeviceId = usePrevious(deviceId);
  // const currentTab = paths[3];
  const classes = useStyles();
  const t = useTranslation();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  // Trips Tab Variables
  const [tripsList, setTripsList] = useState([]);
  const [tripsListLoader, setTripsListLoader] = useState(false);

  // Trips Tab Variables
  const [eventsList, setEventsList] = useState([]);
  const [eventsListLoader, setEventsListLoader] = useState(false);

  const [summaryData, setSummaryData] = useState({});
  // const [summaryDataLoader, setEventListLoader] = useState(false);

  // Trip From Event Selection
  const [eventTrip, setEventTrip] = useState({});

  const [currentTab, setCurrentTab] = useState(
    localStorage.getItem("activeTab") || "trips"
  );
  const [filterValue, setFilterValue] = useState({
    filterName: "This Week",
    toDate: moment().endOf("week").toISOString(),
    fromDate: moment().startOf("week").toISOString(),
  });

  const fetchCommonData = async () => {
    const query = new URLSearchParams({
      deviceId: selectedDeviceId,
      from: iterator.startTime,
      to: iterator.endTime,
    });

    const [eventResponse, summaryResponse, tripsResponse, allDevices] = await Promise.all([
      fetch(`/api/reports/enents?${query.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      }),
      fetch(`/api/reports/summary?${query.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      }),
      fetch(`/api/reports/trips?${query.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      }),
    ]);

    if (eventResponse.ok) setEventsList(await eventResponse.json())
    if (summaryResponse.ok) setSummaryData(await summaryResponse.json())
    if (tripsResponse.ok) setTrips(await tripsResponse.json())
  }

  useEffect(() => {
    if (
      localStorage.getItem("geofencepage") &&
      localStorage.getItem("geofencepage") == true
    ) {
      setCurrentTab("Alerts");
    }
  }, []);

  useEffect(() => {
    if (deviceId && previousDeviceId && deviceId !== previousDeviceId) {
      activeTab("trips");
      localStorage.setItem("activeTab", "trips");
      setCurrentTab("trips");
    }
  }, [deviceId]);

  useEffect(() => {
    if (refreshState) {
      activeTab("trips");
      localStorage.setItem("activeTab", "trips");
      setCurrentTab("trips");
    }
  }, [refreshState]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterSubmit = (selectedValue) => {
    setFilterValue(selectedValue);
    getFilterData(selectedValue);
    setShowFilters(false);
  };

  const handleChange = (event, newValue) => {
    // Update the URL when the tab is changed
    // navigate(`/${newValue}`);
    activeTab(newValue);
    localStorage.setItem("activeTab", newValue);
    setCurrentTab(newValue);
  };

  const eventTripBind = (data) => {
    if (Object.values(data).length) {
      setEventTrip(data);
      activeTab("trips");
      localStorage.setItem("activeTab", "trips");
      setCurrentTab("trips");
    }
  };

  return (
    <>
      <div className={classes.filterContainer}>
        <span>
          {!showFilters ? (
            <Button className={classes.filterButton} onClick={toggleFilters}>
              {t("filters")}
            </Button>
          ) : (
            <Button className={classes.filterButton} onClick={toggleFilters}>
              {t("sharedCancel")}
            </Button>
          )}
        </span>
        <span
          style={{
            textTransform: "capitalize",
            fontWeight: "500",
            fontSize: "13px",
          }}
        >
          {filterValue.filterName}
        </span>
        <span></span>
      </div>
      <div style={{ display: showFilters ? "block" : "none" }}>
        <TabsFilter onSubmitFilter={handleFilterSubmit} hideFilter={(e) => setShowFilters(false)} />
      </div>
      <div style={{ display: showFilters ? "none" : "block" }}>
        <div className={classes.tabContainer}>
          {/* <TabContext value={currentTab}> */}
          <Tabs
            value={currentTab}
            onChange={handleChange}
            classes={{ indicator: classes.indicator }}
          >
            <Tab
              label={t("reportTrips")}
              value="trips"
              className={
                currentTab === "trips" ? classes.selectedTab : classes.tab
              }
              disableRipple
            />
            <Tab
              label={t("stats")}
              value="stats"
              className={
                currentTab === "stats" ? classes.selectedTab : classes.tab
              }
              disableRipple
            />
            <Tab
              label={t("alerts")}
              value="events"
              className={
                currentTab === "events" ? classes.selectedTab : classes.tab
              }
              disableRipple
            />
            <Tab
              label={t("details")}
              value="details"
              className={
                currentTab === "details" ? classes.selectedTab : classes.tab
              }
              disableRipple
            />
          </Tabs>
          {/* </TabContext> */}
        </div>
        <Box>
          <div style={{ padding: "0 10px" }}>
            <div
              className={`tabContent ${currentTab === "trips" ? "active" : ""}`}
            >
              <Trips
                checkForValue={checkForValue}
                vehicleId={deviceId}
                filter={filterValue}
                singleTripLoader={singleTripLoader}
                eventTrip={eventTrip}
                currentTab={currentTab}
              />
            </div>
            <div
              className={`tabContent ${currentTab === "stats" ? "active" : ""}`}
            >
              <Stats filter={filterValue} currentTab={currentTab} />
            </div>
            <div
              className={`tabContent ${currentTab === "events" ? "active" : ""
                }`}
            >
              <Alerts
                filter={filterValue}
                getSelectedGeofence={getSelectedGeofence}
                eventTrip={eventTripBind}
                currentTab={currentTab}
                refreshZoneData={refreshZoneData}
              />
            </div>
            <div
              className={`tabContent ${currentTab === "details" ? "active" : ""
                }`}
            >
              <Details
                vehicleId={deviceId}
                filter={filterValue}
                currentTab={currentTab}
              />
            </div>
          </div>
        </Box>
        {/* <Box className={classes.tabContent}>{tabContent[currentTab]}</Box> */}
      </div>
    </>
  );
};

export default VehicleTabs;
