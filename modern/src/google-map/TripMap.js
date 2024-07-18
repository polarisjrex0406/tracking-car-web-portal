import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
  OverlayView,
} from "@react-google-maps/api";
import { speedFromKnots } from "../common/util/converter";
import { useAttributePreference } from "../common/util/preferences";

const GoogleTripMapComponent = ({ route, summary, map }) => {
  const [tripSegments, setTripSegments] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [isMarkerHovered, setMarkerHovered] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const speedUnit = useAttributePreference("speedUnit");

  useEffect(() => {
    setTripSegments([]);
    setMarkers([]);

    // debugger;
    if (route.length && map) {
      for (const singleRoute of route) {
        drawTrip(singleRoute);
      }

      const firstItem = route[0];
      const lastItem = route[route.length - 1];
      const boundData = [
        firstItem[0],
        firstItem[firstItem.length - 1],
        lastItem[0],
        lastItem[lastItem.length - 1],
      ];

      const coordinates = boundData.map((item) => ({
        lat: item.latitude,
        lng: item.longitude,
      }));

      if (coordinates.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();

        for (const coordinate of coordinates) {
          bounds.extend(coordinate);
        }

        map?.fitBounds(bounds, {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        });
      }
    }
  }, [route, map]);

  useEffect(() => {
    if (route.length && summary && summary.length) {
      getMarkers();
    }
  }, [route, summary]);

  const drawTrip = (tripRoute) => {
    const steps = [];
    let segment = {};
    // Iterate through positions to create route segments
    for (let i = 0; i < tripRoute.length; i++) {
      const speed = speedFromKnots(tripRoute[i].speed, speedUnit).toFixed(0);
      let color;
      if (speed >= 0 && speed <= 55) {
        color = "#FD9026";
      } else if (speed > 55 && speed <= 75) {
        color = "#6AAF2B";
      } else if (speed > 75 && speed <= 90) {
        color = "#0054FF";
      } else if (speed > 90 && speed <= 120) {
        color = "#FF01EE";
      } else if (speed > 120) {
        color = "#FF0104";
      } else {
        color = "black";
      }

      if (i == 0) {
        segment = {
          path: [
            {
              lat: tripRoute[i].latitude,
              lng: tripRoute[i].longitude,
            },
          ],
          color: color,
        };
      } else if (i === tripRoute.length - 1) {
        segment.path.push({
          lat: tripRoute[i].latitude,
          lng: tripRoute[i].longitude,
        });
        steps.push(segment);
      } else if (i > 0 && segment.color === color) {
        segment.path.push({
          lat: tripRoute[i].latitude,
          lng: tripRoute[i].longitude,
        });
      } else {
        segment.path.push({
          lat: tripRoute[i].latitude,
          lng: tripRoute[i].longitude,
        });
        steps.push(segment);
        segment = {
          path: [
            {
              lat: tripRoute[i].latitude,
              lng: tripRoute[i].longitude,
            },
          ],
          color: color,
        };
      }
    }
    setTripSegments((prevValue) => [...prevValue, steps]);
  };

  useEffect(() => {
    console.log("tripSegments => ", tripSegments);
  }, [tripSegments]);

  const getMarkers = () => {
    const marketArray = [];
    let i = 0;

    if (route.length > 1) {
      route.reverse();
    }

    for (const item of route) {
      const maxSpeed = item.filter(
        (x) => x.speed.toFixed(2) === summary[i].maxSpeed.toFixed(2)
      )[0];
      let maxSpeedMarker = {};
      if (maxSpeed) {
        maxSpeedMarker = {
          id: `1-${i}`,
          lat: maxSpeed.latitude,
          lng: maxSpeed.longitude,
          hover: true,
          text: `${speedFromKnots(maxSpeed.speed, speedUnit).toFixed(0)} Kmh`,
          icon: "/max-speed.png",
        };
        marketArray.push(maxSpeedMarker);
      }
      const startMarker = {
        id: `2-${i}`,
        lat: item[i].latitude,
        lng: item[i].longitude,
        hover: route.length == 1 ? false : true,
        text: `Start : ${item[i].address}`,
        icon:
          route.length > 1
            ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                svgWithText(i + 1, "#6AA742")
              )}`
            : "/start-marker.png",
      };
      marketArray.push(startMarker);
      const endMarker = {
        id: `3-${i}`,
        lat: item[route[i].length - 1].latitude,
        lng: item[route[i].length - 1].longitude,
        hover: route.length == 1 ? false : true,
        text: `End : ${item[i].address}`,
        icon:
          route.length > 1
            ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                svgWithText(i + 1, "#C10E1A")
              )}`
            : "/end-marker.png",
      };
      marketArray.push(endMarker);
      i++;
    }

    setMarkers(marketArray);
  };

  const svgWithText = (index, color) => {
    return ` <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="40" stroke="black" stroke-width="0" fill="${color}" />
      <text x="60" y="73" font-size="50" text-anchor="middle" fill="white">${index}</text>
    </svg>
    `;
  };

  return (
    <>
      {tripSegments.map((trips, i) =>
        trips.map((segment, j) => (
          <Polyline
            key={`${i}-${j}`}
            path={segment.path}
            options={{
              strokeColor: segment.color,
              strokeOpacity: 1.0,
              strokeWeight: 4,
            }}
          />
        ))
      )}
      {markers?.length &&
        markers?.map((marker, index) => (
          <>
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              onMouseOver={() => setHoveredMarker(marker.id)}
              onMouseOut={() => setHoveredMarker(null)}
              icon={{
                url: marker.icon,
                scaledSize: new window.google.maps.Size(30, 30),
              }}
            >
              {marker.id === hoveredMarker && marker.hover && (
                <InfoWindow
                  key={marker.id}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  onCloseClick={() => setHoveredMarker(null)}
                >
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: marker.text }} />
                  </div>
                </InfoWindow>
              )}
            </Marker>
          </>
        ))}
    </>
  );
};

export default GoogleTripMapComponent;
