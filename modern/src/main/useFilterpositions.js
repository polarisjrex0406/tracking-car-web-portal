import { useEffect } from "react";
import { useSelector } from "react-redux";
import moment from "moment";

export default (positions, setFilteredPositions) => {
  const devices = useSelector((state) => state.devices.items);

  useEffect(() => {
    const filtered = Object.values(devices);
    setFilteredPositions(
      filtered.map((device) => positions[device.id]).filter(Boolean)
    );
  }, [devices, positions, setFilteredPositions]);
};
