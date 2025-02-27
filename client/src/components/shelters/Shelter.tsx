/*import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { memo, useCallback, useState } from "react";

const containerStyle = {
  width: '500px',
  height: '500px',
}

interface ShelterProps {
  lat: number;
  lng: number;
}

const Shelter: React.FC<ShelterProps> = ({ lat, lng }) => {

    const center = {
        lat: lat,
        lng: lng,
      }
      

     const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
      })
    
      const [map, setMap] = useState(null)
    
      const onLoad = useCallback(function callback(map) {
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        const bounds = new window.google.maps.LatLngBounds(center)
        map.fitBounds(bounds)
    
        setMap(map)
      }, [])
    
      const onUnmount = useCallback(function callback(map) {
        setMap(null)
      }, [])
    
      return isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={5}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
         
          <></>
        </GoogleMap>
      ) : (
        <></>
      )
    }
    
    export default memo(Shelter);*/