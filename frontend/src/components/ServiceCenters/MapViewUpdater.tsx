import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

interface MapViewUpdaterProps {
  center: LatLngExpression;
}

const MapViewUpdater = ({ center }: MapViewUpdaterProps) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() || 10);
  }, [center, map]);
  return null;
};

export default MapViewUpdater;