import React, { useEffect, useState, useRef } from "react";
import {
 Polygon, Polyline, Circle, OverlayView 
} from "@react-google-maps/api";

const GeoFencesViewComponent = ({ zoneData, map }) => {
  const [polygones, setPolygones] = useState([]);
  const [circles, setCircles] = useState([]);
  const [polyline, setPolyline] = useState([]);
  const [overLayTexts, setOverLayTexts] = useState([]);

  // Function to calculate the center of a polygon
  function calculatePolygonCenter(coords) {
    const latSum = coords.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = coords.reduce((sum, coord) => sum + coord.lng, 0);
    const latCenter = latSum / coords.length;
    const lngCenter = lngSum / coords.length;
    return { lat: latCenter, lng: lngCenter };
  }

  async function generatePolygon(area, name) {
    const regexPattern = /POLYGON \(\(([^)]+)\)\)/;
    const match = regexPattern.exec(area);
    if (match) {
      const coordinatesString = match[1];
      const coordinatePairs = coordinatesString.split(", ");
      const coordinates = coordinatePairs.map((pair) => {
        const [lng, lat] = pair.split(" ").map(Number);
        return { lng, lat };
      });
      const center = calculatePolygonCenter(coordinates);
      const text = { cords: center, title: name };
      const data = { path: coordinates, center: center };
      // setPolygones(polygones => [...polygones, polygonData]);
      return [data, text];
    } else {
      console.log("No match found.");
    }
  }

  async function generateCircle(area, name) {
    const regexPattern = /CIRCLE \(([^)]+)\)/;
    const match = regexPattern.exec(area);
    if (match) {
      const circleDataString = match[1];
      const [latlng, radius] = circleDataString.split(", ");
      const [lat, lng] = latlng.split(" ").map(Number);
      const center = { lat, lng };
      const data = { center, radius };
      const text = { cords: center, title: name };
      return [data, text];
    } else {
      console.log("No match found.");
    }
  }

  async function generatePolyline(area, name) {
    const regexPattern = /LINESTRING \(([^)]+)\)/;
    const match = regexPattern.exec(area);
    if (match) {
      const coordinatesString = match[1];
      const coordinatePairs = coordinatesString.split(", ");
      const coordinates = coordinatePairs.map((pair) => {
        const [lng, lat] = pair.split(" ").map(Number);
        return { lng, lat };
      });
      const center = calculatePolygonCenter(coordinates);
      const data = { path: coordinates };
      const text = { cords: center, title: name };
      return [data, text];
    } else {
      console.log("No match found.");
    }
  }

  const generateZOneData = async () => {
    console.log('generateZOneData')
    const circleArray = [];
    const polylineArray = [];
    const polygonArray = [];
    const overLayTextsArray = [];
    for (const zone of zoneData) {
      const type = zone.area.split("(")[0].trim();
      console.log(type)
      if (type == "POLYGON") {
        const [data, text] = await generatePolygon(zone.area, zone.name);
        console.log(zone.name, zone.area)
        polygonArray.push(data);
        overLayTextsArray.push(text);
      } else if (type == "CIRCLE") {
        const [data, text] = await generateCircle(zone.area, zone.name);
        circleArray.push(data);
        overLayTextsArray.push(text);
      } else if (type == "LINESTRING") {
        const [data, text] = await generatePolyline(zone.area, zone.name);
        polylineArray.push(data);
        overLayTextsArray.push(text);
      }
    }
    setPolyline(polylineArray);
    setCircles(circleArray);
    setPolygones(polygonArray);
    setOverLayTexts(overLayTextsArray);
  };

  useEffect(() => {
    setPolygones([]);
    setPolyline([]);
    setCircles([]);
    if (zoneData && zoneData?.length > 0) {
      generateZOneData();
    }
  }, [zoneData]);

  // useEffect(() => {
  //   console.log("Polygones =>", polygones);
  //   console.log("Circle =>", circles);
  //   console.log("polyline =>", polyline);
  // }, [circles, polygones, polyline]);

  return (
    <>
      {polygones.length &&
        polygones.map((item, index) => (
          <>
            <Polygon
              key={index}
              paths={item.path}
              options={{
                fillColor: "#58dafd",
                fillOpacity: "0.4",
                strokeColor: "#58dafd",
              }}
            />
          </>
        ))}
      {circles.length &&
        circles.map((item, index) => (
          <Circle
            key={index}
            center={item.center}
            radius={+item.radius}
            options={{
              fillColor: "#58dafd",
              fillOpacity: "0.4",
              strokeColor: "#58dafd",
            }}
          />
        ))}
      {polyline.length &&
        polyline.map((item, index) => (
          <Polyline
            key={index}
            path={item.path}
            options={{
              strokeColor: "#58dafd",
              strokeOpacity: 0.8,
              strokeWeight: 3,
            }}
          />
        ))}
      {overLayTexts.length &&
        overLayTexts.map((item, index) => (
          <OverlayView
            key={index}
            position={{
              lat: item?.cords?.lat,
              lng: item?.cords?.lng,
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                position: "absolute",
                left: item?.cords?.lat - 100,
                top: item?.cords?.lng - 40,
                color: "black",
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              {item.title}
            </div>
          </OverlayView>
        ))}
    </>
  );
};

export default GeoFencesViewComponent;

// AIzaSyB_JaQFzMLtmp46m6k4ShGEKF1bAqYMUDU&libraries=geometry
