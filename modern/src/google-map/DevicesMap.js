import React, { useEffect, useState } from "react";
import { Marker, OverlayView } from "@react-google-maps/api";
import { useSelector, useDispatch } from "react-redux";
import { usePrevious } from "../reactHelper";
import { useAttributePreference } from "../common/util/preferences";
import { devicesActions } from "../store";

const DevicesMapComponent = ({
  filteredPositions,
  refreshDeviceEvent,
  map,
}) => {
  const dispatch = useDispatch();
  const devices = useSelector((state) => state.devices.items);
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const refreshDevice = useSelector((state) => state.devices.refresh);
  const previousDeviceId = usePrevious(selectedDeviceId);
  const selectedPosition = useSelector(
    (state) => state.session.positions[selectedDeviceId]
  );
  const mapFollow = useAttributePreference("mapFollow", false);
  const history = useSelector((state) => state.session.history);
  const [previousPosition, setPreviousPosition] = useState(null);
  const [selectedDeviceImage, setSelectedDeviceImage] = useState(null);

  useEffect(() => {
    if (refreshDevice) {
      if (previousPosition) {
        refreshDeviceEvent(true);
      }
    }
  }, [refreshDevice]);

  useEffect(() => {
    if (+selectedDeviceId !== +previousDeviceId || mapFollow) {
      if (selectedPosition && Object.values(selectedPosition).length) {
        setPreviousPosition({
          lat: selectedPosition.latitude,
          lng: selectedPosition.longitude,
        });
        refreshDeviceEvent(true);
        setSelectedDeviceImage(getImage());
      }
    }
  }, [selectedDeviceId, map, selectedPosition]);

  const handleMarkerClick = (marker) => {
    dispatch(devicesActions.selectId(marker.deviceId));
  };

  const getImage = () => {
    let img = "/device-alt.png";
    if (
      devices[selectedDeviceId]?.attributes?.deviceImage !== "" &&
      devices[selectedDeviceId].uniqueId
    ) {
      img = `/api/media/${devices[selectedDeviceId].uniqueId}/${devices[selectedDeviceId].attributes.deviceImage}`;
    }
    return img;
  };

  return (
    <>
      {/* {filteredPositions?.length &&
        filteredPositions?.map((marker, index) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            visible={marker.visible}
            icon={{
              url: "/rRITT.png",
              scaledSize: new window.google.maps.Size(30, 30),
              rotation: 215,
            }}
            onClick={() => handleMarkerClick(marker)}
          ></Marker>
        ))} */}
      {filteredPositions?.length &&
        filteredPositions?.map((marker, index) => (
          <OverlayView
            key={index + 82793}
            position={{
              lat: marker.latitude,
              lng: marker.longitude,
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <>
              <div
                onClick={() => handleMarkerClick(marker)}
                style={{
                  position: "absolute",
                  left: marker.longitude * 0.08 - 23,
                  top: marker.latitude * 0.024 - 35,
                  color: "white",
                  padding: "5px",
                  textAlign: "center",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                <img
                  height="30"
                  width="30"
                  style={{
                    borderRadius: "50%",
                    transform: `rotate(${marker.course}deg)`,
                  }}
                  alt="device-icon"
                  src="/rRITT.png"
                ></img>
              </div>
            </>
          </OverlayView>
        ))}
      {selectedDeviceId && selectedPosition && (
        <>
          <OverlayView
            position={{
              lat: selectedPosition.latitude,
              lng: selectedPosition.longitude,
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <>
              {/* Outlined Icon */}
              <div
                style={{
                  position: "absolute",
                  left: selectedPosition.longitude * 0.08 - 53,
                  top: selectedPosition.latitude * 0.024 - 118,
                  color: "white",
                  minWidth: "100px",
                  padding: "5px",
                  textAlign: "center",
                  borderRadius: "50%",
                }}
              >
                <img
                  height="80"
                  width="70"
                  style={{ borderRadius: "50%" }}
                  alt="device-icon"
                  src="/outlined.png"
                ></img>
              </div>
              {/* Device Image */}
              <div
                style={{
                  position: "absolute",
                  left: selectedPosition.longitude * 0.08 - 53,
                  top: selectedPosition.latitude * 0.024 - 113,
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
                  style={{ borderRadius: "50%" }}
                  alt="device-icon"
                  src={selectedDeviceImage}
                  onError={(e) => {
                    e.target.onerror = null; // Prevents looping
                    e.target.src = "/device-alt.png";
                  }}
                ></img>
              </div>
              {/* Device Name */}
              <div
                style={{
                  position: "absolute",
                  left: selectedPosition.longitude * 0.08 - 53,
                  top: selectedPosition.latitude * 0.024 + 5,
                  backgroundColor: "black",
                  color: "white",
                  minWidth: "100px",
                  padding: "5px",
                  borderRadius: "5px",
                  boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
                  textAlign: "center",
                }}
              >
                {devices[selectedDeviceId]?.name}
              </div>
            </>
          </OverlayView>
        </>
      )}
    </>
  );
};

export default DevicesMapComponent;
