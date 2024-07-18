import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polygon,
  InfoWindow,
  OverlayView,
  Polyline,
  Circle,
  Rectangle,
} from "@react-google-maps/api";
import { useSelector, useDispatch } from "react-redux";
import { useEffectAsync, usePrevious } from "../reactHelper";
import { useAttributePreference } from "../common/util/preferences";
import { devicesActions } from "../store";
import GeoFencesViewComponent from "./GeoFencesView";
import DevicesMapComponent from "./DevicesMap";
import GoogleTripMapComponent from "./TripMap";
import GoogleLiveRouteMapComponent from "./LiveRouteMap";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const initialGeoZones = [
  {
    id: 1,
    paths: [
      { lat: 40.7128, lng: -74.006 },
      { lat: 40.7228, lng: -74.016 },
    ],
    name: "Zone 1",
  },
];

const GoogleMainMapComponent = ({
  deviceFilteredPositions,
  zoneData,
  mainMapView,
  route,
  tripSummary,
  activeTripStatus,
  tripType,
  refreshLocation
}) => {
  const dispatch = useDispatch();
  const devices = useSelector((state) => state.devices.items);
  const [center, setCenter] = useState(defaultCenter);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const devicePositions = useSelector((state) => state.session.positions);

  const previousDeviceId = usePrevious(selectedDeviceId);
  const selectedPosition = useSelector(
    (state) => state.session.positions[selectedDeviceId]
  );
  const type = useAttributePreference("mapLiveRoutes", "none");
  const mapFollow = useAttributePreference("mapFollow", false);
  const selectZoom = useAttributePreference("web.selectZoom", 15);
  const [zoom, setZoom] = useState(2.5);

  const [map, setMap] = useState(null);
  const [tragetZoomLevel, setTragetZoomLevel] = useState(17);
  const [initialized, setInitialized] = useState(false);
  const [showGeoFence, setShowGeoFence] = useState(true);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [previousPosition, setPreviousPosition] = useState({});
  const history = useSelector((state) => state.session.history);

  const onLoad = (map) => {
    setMap(map);
  };

  // Set Map View For All Devices
  useEffect(() => {
    if (!initialized && filteredPositions?.length && map) {
      filteredPositions.map((x) => {
        return { ...x, visible: false };
      });

      const coordinates = filteredPositions.map((item) => ({
        lat: +item.latitude,
        lng: +item.longitude,
      }));
      if (coordinates?.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();

        coordinates.forEach((coordinate) => {
          bounds.extend(coordinate);
        });

        map?.fitBounds(bounds, {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        });

        setZoom(4);
        setInitialized(true);
      } else if (coordinates?.length === 1) {
        setCenter(coordinates[0]);
        map?.setCenter(coordinates[0]);
        map?.setZoom(Math.max(map.getZoom(), 20));
        setZoom(20);
        setInitialized(true);
      }
    }
  }, [filteredPositions, initialized, map]);

  // NOt Confirmed
  useEffect(() => {
    let data = Object.values(devicePositions);
    if ((data && data.length) || deviceFilteredPositions) {
      if (!data.length && deviceFilteredPositions) {
        data = deviceFilteredPositions;
      }
      setFilteredPositions(data);
    }
  }, [devicePositions, deviceFilteredPositions]);

  // Selected Deice View Method
  const zoomOnSelectedDevice = () => {
    if (selectedPosition == undefined) {
      return
    }
    if (map) {
      const newPosition = new google.maps.LatLng(
        selectedPosition.latitude,
        selectedPosition.longitude
      );
      if (newPosition == previousPosition) return;
      setPreviousPosition(newPosition);

      const startZoom = zoom;
      const targetZoom = tragetZoomLevel;
      const animationDuration = 50;
      const numFrames = 50;

      const positionIncrement = new google.maps.LatLng(
        (newPosition.lat() - map.getCenter().lat()) / numFrames,
        (newPosition.lng() - map.getCenter().lng()) / numFrames
      );

      let currentFrame = 0;
      let currentZoom = startZoom;

      const animate = () => {
        if (currentFrame < numFrames) {
          const newPosition = new google.maps.LatLng(
            map.getCenter().lat() + positionIncrement.lat(),
            map.getCenter().lng() + positionIncrement.lng()
          );

          map.panTo(newPosition);

          if (!activeTripStatus && tripType !== 'tripHappening') {
            currentZoom += (targetZoom - startZoom) / numFrames;
            map.setZoom(currentZoom);

            currentFrame++;
            setTimeout(animate, animationDuration / numFrames);
          } else {
            map.panTo(newPosition);
            map?.setCenter({ lat: selectedPosition.latitude, lng: selectedPosition.longitude });
            // map.setZoom(targetZoom);
            // setZoom(targetZoom);
          }
        } else {
          map.setZoom(targetZoom);
          setZoom(targetZoom);
        }
      };

      animate();
      dispatch(devicesActions.refreshDevice(false));
    }
  };

  const handleZoomChanged = (newZoom) => {
    if (map) {
      setZoom(map.zoom);
      setTragetZoomLevel(map.zoom);
    }
  };

  useEffect(() => {
    zoomOnSelectedDevice()
  }, [refreshLocation])

  return (
    <>
      <LoadScript googleMapsApiKey="AIzaSyB_JaQFzMLtmp46m6k4ShGEKF1bAqYMUDU&libraries=geometry">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onZoomChanged={() => handleZoomChanged}
        >
          {map ? (
            <>
              {mainMapView ? (
                <>
                  <DevicesMapComponent
                    map={map}
                    filteredPositions={filteredPositions}
                    refreshDeviceEvent={zoomOnSelectedDevice}
                  />
                  {showGeoFence ? (
                    <GeoFencesViewComponent map={map} zoneData={zoneData} />
                  ) : null}
                </>
              ) : (
                <>
                  <GoogleTripMapComponent
                    map={map}
                    route={route}
                    summary={tripSummary}
                  />
                  {showGeoFence ? (
                    <GeoFencesViewComponent map={map} zoneData={zoneData} />
                  ) : null}
                </>
              )}
              {mainMapView && selectedDeviceId &&
                history[selectedDeviceId]?.length > 1 &&
                activeTripStatus && tripType == 'tripHappening' ? (
                <GoogleLiveRouteMapComponent></GoogleLiveRouteMapComponent>
              ) : null}
            </>
          ) : null}
        </GoogleMap>
      </LoadScript>
      {selectedDeviceId && zoneData?.length ? (
        <div
          id="geozone-button"
          className={showGeoFence ? "active" : ""}
          onClick={() => setShowGeoFence(!showGeoFence)}
        ></div>
      ) : null}
    </>
  );
};

export default GoogleMainMapComponent;

// AIzaSyB_JaQFzMLtmp46m6k4ShGEKF1bAqYMUDU&libraries=geometry
