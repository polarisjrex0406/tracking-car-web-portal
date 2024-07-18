import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { useSelector } from "react-redux";
import { useAttributePreference } from "../common/util/preferences";

const GoogleLiveRouteMapComponent = () => {
  const devices = useSelector((state) => state.devices.items);
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const history = useSelector((state) => state.session.history);

  const [tripSegments, setTripSegments] = useState([]);
  const [markers, setMarkers] = useState({});

  const drawRoute = (route) => {
    const steps = route.map((x) => {
      return { lat: x[1], lng: x[0] };
    });
    setTripSegments(steps);
  };

  const drawMarkers = (route) => {
    const startMarker = {
      lat: route[0][1],
      lng: route[0][0],
      icon: "/start-marker.png",
    };

    setMarkers(startMarker);
  };

  useEffect(() => {
    if (history[selectedDeviceId]?.length > 1) {
      drawRoute(history[selectedDeviceId]);
      drawMarkers(history[selectedDeviceId]);
    }
  }, [history, selectedDeviceId]);

  return (
    <>
      {tripSegments.length > 1 && selectedDeviceId && (
        <Polyline
          path={tripSegments}
          options={{
            strokeColor: "green",
            strokeOpacity: 1.0,
            strokeWeight: 4,
          }}
        />
      )}
      {markers && (
        <Marker
          key={markers.id}
          position={{ lat: markers.lat, lng: markers.lng }}
          icon={{
            url: markers.icon,
            scaledSize: new window.google.maps.Size(30, 30),
          }}
          onClick={() => handleMarkerClick(markers)}
        />
      )}
    </>
  );
};

export default GoogleLiveRouteMapComponent;
