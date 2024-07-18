import React, {
 useEffect, useState, useRef, useCallback 
} from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polygon,
  InfoWindow,
  OverlayView,
  Polyline,
  Circle,
  DrawingManager,
  Rectangle,
} from "@react-google-maps/api";
import { useSelector, useDispatch } from "react-redux";
import { useAttributePreference } from "../common/util/preferences";
import { devicesActions } from "../store";

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
const initialCircle = {
  center: defaultCenter,
  radius: 5000, // In meters
};

const GoogleGeoFenceMapComponent = ({
  zoneData,
  deviceId,
  selectedDevicePosition,
  newItemData,
  selectedGeofence,
}) => {
  const devices = useSelector((state) => state.devices.items);
  const [center, setCenter] = useState(defaultCenter);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const selectedPosition = useSelector(
    (state) => state.session.positions[+selectedDeviceId || +deviceId]
  );

  const [zoom, setZoom] = useState(2.5);
  const [map, setMap] = useState(null);

  const [polygones, setPolygones] = useState([]);

  const geofences = useSelector((state) => state.geofences.items);

  // New
  const [selectedShapeType, setSelectedShapeType] = useState(null);
  const [drawingInProgress, setDrawingInProgress] = useState(false);
  const [drawnShape, setDrawnShape] = useState(null);

  const [circleDrawingMode, setCircleDrawingMode] = useState(false);
  const [polygonDrawingMode, setPolygonDrawingMode] = useState(false);
  const [polylineDrawingMode, setPolylineDrawingMode] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [editState, setEditState] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [deviceImage, setDeviceImage] = useState(null);

  const onLoad = (map) => {
    setMap(map);
  };

  // Handle Edit Case
  useEffect(() => {
    setEditState(false);
    if (map && selectedGeofence && Object.values(selectedGeofence).length > 0) {
      const type = selectedGeofence.area.split("(")[0].trim();
      if (type == "POLYGON") {
        const regexPattern = /POLYGON \(\(([^)]+)\)\)/;
        const match = regexPattern.exec(selectedGeofence.area);
        if (match) {
          const coordinatesString = match[1];
          const coordinatePairs = coordinatesString.split(", ");
          const coordinates = coordinatePairs.map((pair) => {
            const [lng, lat] = pair.split(" ").map(Number);
            return { lng, lat };
          });
          const polygonData = { path: coordinates };
          setEditContent(polygonData);
          panTo(coordinates);
          handleDraw("polygon");
        }
      } else if (type == "CIRCLE") {
        const regexPattern = /CIRCLE \(([^)]+)\)/;
        const match = regexPattern.exec(selectedGeofence.area);
        if (match) {
          const circleDataString = match[1];
          const [latlng, radius] = circleDataString.split(", ");

          const [lat, lng] = latlng.split(" ").map(Number);
          const center = { lat, lng };
          const circleData = { center, radius };
          setEditContent(circleData);
          panTo([center]);
          handleDraw("circle");
        }
      } else if (type == "LINESTRING") {
        const regexPattern = /LINESTRING \(([^)]+)\)/;
        const match = regexPattern.exec(selectedGeofence.area);
        if (match) {
          const coordinatesString = match[1];
          const coordinatePairs = coordinatesString.split(", ");
          const coordinates = coordinatePairs.map((pair) => {
            const [lng, lat] = pair.split(" ").map(Number);
            return { lng, lat };
          });
          const polylineData = { path: coordinates };
          setEditContent(polylineData);
          panTo(coordinates);
          handleDraw("polyline");
        }
      }

      setEditState(true);
      setDrawingInProgress(false);
    }
  }, [selectedGeofence, map]);

  const handleShapeSelection = (shapeType) => {
    setDrawnShape(shapeType);
    setDrawingInProgress(false); // Disable manual drawing when a shape is selected
    handleDraw(shapeType); // Clear any previously drawn shape
  };

  const handleDraw = (shapeType) => {
    setSelectedShapeType(shapeType);
    setDrawingInProgress(true);

    switch (shapeType) {
      case "circle":
        setCircleDrawingMode(true);
        setPolygonDrawingMode(false);
        setPolylineDrawingMode(false);
        break;
      case "polygon":
        setCircleDrawingMode(false);
        setPolygonDrawingMode(true);
        setPolylineDrawingMode(false);
        break;
      case "polyline":
        setCircleDrawingMode(false);
        setPolygonDrawingMode(false);
        setPolylineDrawingMode(true);
        break;
      default:
        setCircleDrawingMode(false);
        setPolygonDrawingMode(false);
        setPolylineDrawingMode(false);
        break;
    }
  };

  const handleShapeComplete = (shape) => {
    shape.setMap(null);
    const newShape = {};

    if (selectedShapeType == "circle") {
      newShape.center = {
        lat: shape.getCenter().lat(),
        lng: shape.getCenter().lng(),
      };
      newShape.radius = shape.getRadius();
    } else if (selectedShapeType == "polygon") {
      newShape.path = shape.getPath();
    } else if (selectedShapeType == "polyline") {
      newShape.path = shape.getPath();
    }
    setEditContent(newShape);
    setDrawnShape(shape);
    setDrawingInProgress(false);

    if (shape.setEditable) {
      shape.setEditable(true);
    }

    mapData(shape);
  };

  const mapData = (shape) => {
    if (!shape) return;
    let item = {};
    const newShape = {};

    // For Circle
    if (selectedShapeType == "circle") {
      newShape.center = {
        lat: shape.getCenter().lat(),
        lng: shape.getCenter().lng(),
      };
      newShape.radius = shape.getRadius();
      item = `CIRCLE (${shape.getCenter().lat()} ${shape
        .getCenter()
        .lng()}, ${shape.getRadius()})`;
    } else if (selectedShapeType == "polygon") {
      newShape.path = shape.getPaths();
      const paths = shape.getPaths();
      const coordinates = [];
      paths.forEach((path) => {
        path.forEach((vertex) => {
          coordinates.push({ lat: vertex.lat(), lng: vertex.lng() });
        });
      });

      const coordinatePairs = coordinates.map(
        (coord) => `${coord.lng} ${coord.lat}`
      );
      item = `POLYGON ((${coordinatePairs.join(", ")}))`;
    } else if (selectedShapeType == "polyline") {
      newShape.path = shape.getPath();
      const path = shape.getPath();
      const coordinates = [];
      path.forEach((vertex) => {
        coordinates.push({ lat: vertex.lat(), lng: vertex.lng() });
      });
      const coordinatePairs = coordinates.map(
        (coord) => `${coord.lng} ${coord.lat}`
      );
      item = `LINESTRING (${coordinatePairs.join(", ")})`;
    }
    setEditContent(newShape);

    if (item) newItemData({ name: "", area: item });
  };

  // Get Active Device Locationa and position
  useEffect(() => {
    if (map) {
      if (
        (selectedDeviceId || deviceId) &&
        (selectedPosition || selectedDevicePosition) &&
        !initialized
      ) {
        map.panTo({
          lat: selectedPosition.latitude,
          lng: selectedPosition.longitude,
        });
        map.setZoom(15);
        setZoom(15);
        setInitialized(true);
        setDeviceImage(getImage());
      }
    }
  }, [
    selectedDeviceId,
    map,
    selectedPosition,
    deviceId,
    selectedDevicePosition,
  ]);

  const panTo = (cords) => {
    const coordinates = cords.map((item) => ({
      lat: +item.lat,
      lng: +item.lng,
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
    } else {
      // Create a LatLngBounds object with the single coordinate
      const bounds = new google.maps.LatLngBounds(coordinates[0]);
      map?.fitBounds(bounds, {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      });
      map.setZoom(14);
    }
  };

  useEffect(() => {
    if (geofences > 0) {
      const item = [];
      for (const zone of zoneData) {
        // Remove the "POLYGON ((" and "))" parts
        const coordinatesString = zone.area
          .replace(/^POLYGON \(\(/, "")
          .replace(/\)\)$/, "");
        const coordinatePairs = coordinatesString
          .split(", ")
          .map((pair) => pair.split(" ").map(Number));
        const coordinates = coordinatePairs.map((pair) => [pair[0], pair[1]]);
        item.push({ cordinates: coordinates });
      }
      setPolygones(item);
    }
  }, [zoneData, map]);

  const polylineRef = useRef(null);
  const polygonRef = useRef(null);
  const circleRef = useRef(null);
  const listenersRef = useRef([]);

  // Call setPath with new edited path
  const onPolylineEdit = useCallback(() => {
    if (polylineRef.current) {
      const nextPath = polylineRef.current
        .getPath()
        .getArray()
        .map((latLng) => latLng.toJSON());
      setEditContent({ path: nextPath });
      const coordinatePairs = nextPath.map(
        (coord) => `${coord.lng} ${coord.lat}`
      );
      const result = `LINESTRING (${coordinatePairs.join(", ")})`;
      if (result) newItemData({ name: "", area: result });
    }
  }, [setEditContent]);

  // Bind refs to current Polyline and listeners
  const onPolylineLoad = useCallback(
    (polyline) => {
      polylineRef.current = polyline;
    },
    [onPolylineEdit]
  );

  // Call setPath with new edited path
  const onPolygonEdit = useCallback(() => {
    if (polygonRef.current) {
      const nextPath = polygonRef.current
        .getPath()
        .getArray()
        .map((latLng) => latLng.toJSON());
      setEditContent({ path: nextPath });
      const coordinatePairs = nextPath.map(
        (coord) => `${coord.lng} ${coord.lat}`
      );
      const result = `POLYGON ((${coordinatePairs.join(", ")}))`;
      if (result) newItemData({ name: "", area: result });
    }
  }, [setEditContent]);

  // Bind refs to current Polygon and listeners
  const onPolygonLoad = useCallback(
    (polygon) => {
      polygonRef.current = polygon;
    },
    [onPolygonEdit]
  );

  // Call setPath with new edited path
  const onCircleEdit = useCallback(() => {
    if (circleRef.current) {
      const latitude = circleRef.current.getCenter().lat();
      const longitude = circleRef.current.getCenter().lng();
      const center = { lat: latitude, lng: longitude };
      const radius = circleRef.current.getRadius();

      setEditContent({ center: center, radius: radius });
      const result = `CIRCLE (${latitude} ${longitude}, ${radius})`;
      if (result) newItemData({ name: "", area: result });
    }
  }, [setEditContent]);

  // Bind refs to current Polygon and listeners
  const onCircleLoad = useCallback(
    (circle) => {
      circleRef.current = circle;
    },
    [onCircleEdit]
  );

  const getImage = () => {
    let img = "/device-alt.png";
    if (
      devices[selectedDeviceId]?.attributes?.deviceImage !== "" &&
      devices[selectedDeviceId]?.uniqueId
    ) {
      img = `/api/media/${devices[selectedDeviceId].uniqueId}/${devices[selectedDeviceId].attributes.deviceImage}`;
    }
    return img;
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyB_JaQFzMLtmp46m6k4ShGEKF1bAqYMUDU&libraries=drawing">
      <div className="draw-manager-tool">
        <div
          className={`draw_circle ${
            selectedShapeType == "circle" && drawingInProgress ? "active" : ""
          }`}
          onClick={() => handleShapeSelection("circle")}
        >
          <div></div>
        </div>
        <div
          className={`draw_polygon ${
            selectedShapeType == "polygon" && drawingInProgress ? "active" : ""
          }`}
          onClick={() => handleShapeSelection("polygon")}
        >
          <div></div>
        </div>
        <div
          className={`draw_polyline ${
            selectedShapeType == "polyline" && drawingInProgress ? "active" : ""
          }`}
          onClick={() => handleShapeSelection("polyline")}
        >
          <div></div>
        </div>
        <div
          className={`draw_handle ${
            drawnShape && !drawingInProgress ? "active" : ""
          }`}
        >
          <div></div>
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
      >
        {map && (selectedDeviceId || deviceId) && selectedPosition && (
          <>
            <Marker
              position={{
                lat: selectedPosition.latitude,
                lng: selectedPosition.longitude,
              }}
              icon={{
                url: "/rRITT.png",
                scaledSize: new window.google.maps.Size(30, 30),
                rotation: selectedPosition.course,
              }}
            ></Marker>
            <Marker
              key={selectedPosition.id + 1}
              position={{
                lat: selectedPosition.latitude,
                lng: selectedPosition.longitude,
              }}
              icon={{
                url: "/outlined.png",
                scaledSize: new window.google.maps.Size(70, 80),
                anchor: new window.google.maps.Point(35, 110),
              }}
            />
            <OverlayView
              position={{
                lat: selectedPosition.latitude,
                lng: selectedPosition.longitude,
              }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <>
                <div
                  style={{
                    position: "absolute",
                    left: selectedPosition.longitude - 50,
                    top: selectedPosition.latitude - 40,
                    backgroundColor: "black",
                    color: "white",
                    minWidth: "100px",
                    padding: "5px",
                    borderRadius: "5px",
                    boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
                    textAlign: "center",
                  }}
                >
                  {devices[+selectedDeviceId || +deviceId]?.name}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: selectedPosition.longitude - 56,
                    top: selectedPosition.latitude - 155,
                    color: "white",
                    minWidth: "100px",
                    padding: "5px",
                    textAlign: "center",
                    borderRadius: "50%",
                  }}
                >
                  <img
                    height="60"
                    width="60"
                    className="device-imageeeeeee"
                    style={{ borderRadius: "50%" }}
                    alt="device-icon"
                    src={deviceImage}
                    onError={(e) => {
                      e.target.onerror = null; // Prevents looping
                      e.target.src = "/device-alt.png";
                    }}
                  />
                </div>
              </>
            </OverlayView>
          </>
        )}

        {drawingInProgress && (
          <DrawingManager
            drawingMode={
              circleDrawingMode
                ? "circle"
                : polygonDrawingMode
                ? "polygon"
                : polylineDrawingMode
                ? "polyline"
                : null
            }
            onPolygonComplete={(polygon) => handleShapeComplete(polygon)}
            onCircleComplete={(circle) => handleShapeComplete(circle)}
            onPolylineComplete={(polyline) => handleShapeComplete(polyline)}
          />
        )}

        {/* Render the drawn shape */}
        {selectedShapeType === "polygon" &&
          editContent?.path &&
          editContent?.path?.length > 0 && (
            // drawnShape instanceof window.google.maps.Polygon && (
            <Polygon
              ref={polygonRef}
              paths={editContent.path}
              editable={true}
              draggable={true}
              options={{
                fillColor: "#58dafd",
                fillOpacity: 0.4,
                strokeColor: "#58dafd",
              }}
              onMouseUp={onPolygonEdit}
              onDragEnd={onPolygonEdit}
              onLoad={onPolygonLoad}
            />
          )}
        {selectedShapeType === "circle" &&
          editContent &&
          editContent.center && (
            <Circle
              ref={circleRef}
              center={editContent.center}
              radius={+editContent.radius}
              editable={true}
              draggable={true}
              options={{
                fillColor: "#58dafd",
                fillOpacity: "0.4",
                strokeColor: "#58dafd",
              }}
              onLoad={onCircleLoad}
              // onCenterChanged={onCircleEdit}
              onRadiusChanged={onCircleEdit}
              onDragEnd={onCircleEdit}
            />
          )}
        {selectedShapeType === "polyline" &&
          editContent?.path &&
          editContent?.path?.length > 0 && (
            // drawnShape instanceof window.google.maps.Polyline && (
            <Polyline
              ref={polylineRef}
              path={editContent.path} // Use 'path' instead of 'paths' for polylines
              editable={true}
              draggable={true}
              options={{
                strokeColor: "#58dafd", // Set the stroke color
                strokeOpacity: 0.8, // Set the stroke opacity
                strokeWeight: 3, // Set the stroke weight
              }}
              onMouseUp={onPolylineEdit}
              onDragEnd={onPolylineEdit}
              onLoad={onPolylineLoad}
            />
          )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleGeoFenceMapComponent;

// AIzaSyB_JaQFzMLtmp46m6k4ShGEKF1bAqYMUDU
