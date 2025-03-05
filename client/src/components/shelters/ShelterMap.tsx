// @ts-nocheck

// 43.218338 -75.44852759999999 

import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { memo, useCallback, useState } from "react";

const containerStyle = {
    width: "100%",
    height: "250px",
};

interface ShelterMapProps {
    lat: number;
    lng: number;
}

const ShelterMap: React.FC<ShelterMapProps> = ({ lat, lng }) => {
    console.log(lat, lng, " lat lng")
    const center = { lat, lng };

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY || ""
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);
        setMap(map);
    }, [center]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    return isLoaded ? (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={onLoad} onUnmount={onUnmount}>
            <Marker position={center} />
        </GoogleMap>
    ) : (
        <p>Loading map...</p>
    );
};

export default memo(ShelterMap);
