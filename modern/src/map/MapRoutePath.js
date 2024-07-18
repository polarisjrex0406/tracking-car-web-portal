import { useTheme } from "@mui/styles";
import { useId, useEffect } from "react";
import { useSelector } from "react-redux";
import { map } from "./core/MapView";
import { findFonts } from "./core/mapUtil";

const MapRoutePath = ({ name, positions, coordinates }) => {
  const id = useId();
  const theme = useTheme();

  useEffect(() => {
    if (!coordinates) {
      coordinates = positions.map((item) => [item.longitude, item.latitude]);
    }

    const steps = [];

    // Iterate through positions to create route segments
    for (let i = 0; i < positions.length - 1; i++) {
      const startPoint = coordinates[i];
      const endPoint = coordinates[i + 1];

      // Determine color based on a condition (e.g., speed)
      const speed = positions[i].speed;
      let color;
      if (speed >= 0 && speed <= 35) {
        color = "#FD9026";
      } else if (speed > 35 && speed <= 45) {
        color = "#6AAF2B";
      } else if (speed > 45 && speed <= 50) {
        color = "#0054FF";
      } else if (speed > 50 && speed <= 65) {
        color = "#FF01EE";
      } else if (speed > 65) {
        color = "#FF0104";
      } else {
        color = "black";
      }

      // Create a route segment Feature
      const segment = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [startPoint, endPoint],
        },
        properties: {
          name,
          color,
        },
      };

      // Add the segment to the steps array
      steps.push(segment);
    }

    // Create a FeatureCollection from the route segments
    const routeStepsGeoJSONData = {
      type: "FeatureCollection",
      features: steps,
    };

    // Add the source and layer to the map
    map.addSource(id, {
      type: "geojson",
      data: routeStepsGeoJSONData,
    });

    map.addLayer({
      source: id,
      id: `${id}-line`,
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": ["get", "color"],
        "line-width": 4,
      },
    });

    if (name) {
      map.addLayer({
        source: id,
        id: `${id}-title`,
        type: "symbol",
        layout: {
          "text-field": "{name}",
          "text-font": findFonts(map),
          "text-size": 12,
        },
        paint: {
          "text-halo-color": "white",
          "text-halo-width": 1,
        },
      });
    }

    return () => {
      if (map.getLayer(`${id}-title`)) {
        map.removeLayer(`${id}-title`);
      }
      if (map.getLayer(`${id}-line`)) {
        map.removeLayer(`${id}-line`);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, [theme, positions, coordinates]);

  return null;
};

export default MapRoutePath;
