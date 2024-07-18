import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Divider,
  Typography,
  IconButton,
  useMediaQuery,
  Toolbar,
  Box,
  Switch,
  Button,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MapView from "../map/core/MapView";
import MapCurrentLocation from "../map/MapCurrentLocation";
import MapGeofenceEdit from "../map/draw/MapGeofenceEdit";
import GeofencesList from "./GeofencesList";
import { useTranslation } from "../common/components/LocalizationProvider";
import MapGeocoder from "../map/geocoder/MapGeocoder";
import { errorsActions, geofencesActions } from "../store";
import ConfirmDeleteGeoFenceModal from "../vehicle/DeleteGeoFenceModal";
import { useCatchCallback } from "../reactHelper";
import GoogleGeoFenceMapComponent from "../google-map/GeoFenceMap";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flexGrow: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column-reverse",
    },
  },
  drawer: {
    zIndex: 1,
  },
  drawerPaper: {
    position: "relative",
    [theme.breakpoints.up("sm")]: {
      width: theme.dimensions.drawerWidthTablet,
    },
    [theme.breakpoints.down("sm")]: {
      height: theme.dimensions.drawerHeightPhone,
    },
  },
  mapContainer: {
    flexGrow: 1,
    position: "relative",
  },
  title: {
    flexGrow: 1,
  },
  fileInput: {
    display: "none",
  },
  driverData: {
    display: "flex",
    justifyContent: "space-between",
  },
  innerText: {},
  redButton: {
    backgroundColor: "red",
    color: "white", // Text color
    "&:hover": {
      backgroundColor: "red", // Background color on hover
    },
  },
  heading: {
    fontSize: "22px",
    fontWeight: "700",
  },
  mapOverLay: {
    position: "absolute",
    top: "50%",
    width: "300px",
    background: "#00000087",
    zIndex: "9999",
    borderRadius: "10px",
    padding: "15px",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  mapOverLayText: {
    color: "white",
    textAlign: "center",
    fontWeight: "500",
  },
}));

const GeofencesPage = () => {
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const { deviceId, fenceId } = useParams();
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedGeofenceId, setSelectedGeofenceId] = useState();
  const [zoneName, setZoneName] = useState("");
  const [zoneData, setZoneData] = useState({});
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedGeoFence, setSelectedGeoFence] = useState([]);

  const selectedPosition = useSelector(
    (state) => state.session.positions[+deviceId]
  );

  const handleFile = (event) => {
    const files = Array.from(event.target.files);
    const [file] = files;
    const reader = new FileReader();
    reader.onload = async () => {
      const xml = new DOMParser().parseFromString(reader.result, "text/xml");
      const segment = xml.getElementsByTagName("trkseg")[0];
      const coordinates = Array.from(segment.getElementsByTagName("trkpt"))
        .map(
          (point) => `${point.getAttribute("lat")} ${point.getAttribute("lon")}`
        )
        .join(", ");
      const area = `LINESTRING (${coordinates})`;
      const newItem = { name: "", area };
      try {
        const response = await fetch("/api/geofences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
        if (response.ok) {
          const item = await response.json();
          navigate(`/settings/geofence/${item.id}`);
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        dispatch(errorsActions.push(error.message));
      }
    };
    reader.onerror = (event) => {
      dispatch(errorsActions.push(event.target.error));
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    localStorage.setItem("geofencepage", true);
    setTimeout(() => {
      setShowOverlay(false);
    }, 5000);
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch("/api/geofences", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const item = await response.json();
          const selectedFence = item.filter((x) => x.id == fenceId)[0];
          setSelectedGeoFence(selectedFence);
          setZoneName(selectedFence.name);
          setZoneData({ area: selectedFence.area });
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        dispatch(errorsActions.push(error.message));
      }
    };

    if (fenceId) fetchDetail();
  }, [fenceId]);

  const submitGeoFence = async () => {
    let method = "POST";
    let url = "/api/geofences";
    let body = {};
    if (fenceId) {
      method = "PUT";
      url = `/api/geofences/${fenceId}`;
      body = { ...selectedGeoFence, ...zoneData };
    } else {
      body = { ...zoneData };
    }

    body.name = zoneName;

    if (zoneName !== "" && body) {
      try {
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (response.ok) {
          const item = await response.json();
          // if (!fenceId) {
          // linkDeviceWithGeoZone(item);
          // } else {
          setZoneName("");
          setZoneData(null);
          navigate(-1);
          refreshGeofences();
          // }
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        dispatch(errorsActions.push(error.message));
      }
    }
  };

  const refreshGeofences = useCatchCallback(async () => {
    const response = await fetch("/api/geofences");
    if (response.ok) {
      dispatch(geofencesActions.refresh(await response.json()));
    } else {
      throw Error(await response.text());
    }
  }, [dispatch]);

  const linkDeviceWithGeoZone = async (item) => {
    const method = "POST";
    const body = {
      deviceId: deviceId,
      geofenceId: item.id,
    };
    try {
      const response = await fetch("/api/permissions", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        navigate(-1);
        // alert("Alert changed successfully");
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      dispatch(errorsActions.push(error.message));
    }
  };

  const addNewItem = (item) => {
    setZoneData(item);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setZoneName(value);
  };

  const handleConfirmation = async () => {
    setIsConfirmationModalOpen(false);
    setZoneData(null);
    setZoneName("");
    navigate(-1);
  };

  const handleOpenConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <Drawer
          className={classes.drawer}
          anchor={isPhone ? "bottom" : "left"}
          variant="permanent"
          classes={{ paper: classes.drawerPaper }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {t("sharedGeofences")}
            </Typography>
            {/* <label htmlFor="upload-gpx">
              <input
                accept=".gpx"
                id="upload-gpx"
                type="file"
                className={classes.fileInput}
                onChange={handleFile}
              />
              <IconButton edge="end" component="span" onClick={() => {}}>
                <UploadFileIcon />
              </IconButton>
            </label> */}
          </Toolbar>
          <Divider />
          <div style={{ padding: "15px" }}>
            <Box className={classes.innerContainer}>
              <Typography className={classes.heading}>Geo Zone</Typography>
              <div>
                <TextField
                  className={classes.customTextField}
                  label="Name"
                  name="name"
                  value={zoneName}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            </Box>
            <Divider sx={{ padding: "15px 0 0px" }} />
            <Button
              style={{ marginTop: "15px" }}
              className="customButton"
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => submitGeoFence()}
              disabled={zoneName === "" || !zoneData.hasOwnProperty("area")}
            >
              Save
            </Button>
            {fenceId && (
              <>
                <Divider sx={{ paddingTop: "15px" }} />
                <Box
                  sx={{
                    margin: "30px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    className={classes.redButton}
                    onClick={handleOpenConfirmationModal}
                  >
                    Delete Geo-Zone
                  </Button>
                </Box>
              </>
            )}
          </div>
          {/* <GeofencesList onGeofenceSelected={setSelectedGeofenceId} /> */}
        </Drawer>
        <div className={classes.mapContainer}>
          <GoogleGeoFenceMapComponent
            selectedDevicePosition={selectedPosition}
            zoneData={zoneData}
            deviceId={deviceId}
            newItemData={addNewItem}
            selectedGeofence={selectedGeoFence}
          ></GoogleGeoFenceMapComponent>
          {/* <MapView>
            <MapGeofenceEdit
              selectedGeofenceId={fenceId}
              name={zoneName}
              newItemData={addNewItem}
            />
          </MapView>
          <MapCurrentLocation /> */}
          {/* <MapGeocoder /> */}
          {showOverlay && (
            <div className={classes.mapOverLay}>
              <p className={classes.mapOverLayText}>
                Click and drag anywhere on the map to draw a Geo-Zone
              </p>
            </div>
          )}
        </div>
      </div>
      {isConfirmationModalOpen && (
        <ConfirmDeleteGeoFenceModal
          onConfirmation={handleConfirmation}
          onCancel={handleCloseConfirmationModal}
          fenceId={fenceId}
        />
      )}
    </div>
  );
};

export default GeofencesPage;
