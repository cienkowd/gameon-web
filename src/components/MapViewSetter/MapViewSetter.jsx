import {useEffect} from "react";
import { useMap } from "react-leaflet";

const MapViewSetter = ({ coords }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(coords, 16);
    }, [coords, map]);

    return null;
};

export default MapViewSetter