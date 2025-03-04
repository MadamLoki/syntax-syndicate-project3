import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import axios from "axios";
import { GET_SHELTERS } from "../../utils/sheltersQueries";
import ShelterMap from "./ShelterMap"; // Import the map component

interface Shelter {
  id: string;
  name: string;
  address: {
    address1: string | null;
    address2: string | null;
    city: string;
    state: string;
  };
}

interface ShelterData {
  shelters: {
    shelters: Shelter[];
    hasMore: boolean;
  };
}

interface ShelterQueryVariables {
  location: string;
  page: number;
}

const Shelters = () => {
  const [location, setLocation] = useState<string>("");
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [geoCache, setGeoCache] = useState<{ [key: string]: { lat: number; lng: number } }>({});

  const { loading, error, data, refetch } = useQuery<ShelterData, ShelterQueryVariables>(GET_SHELTERS, {
    variables: { location: searchLocation, page },
    skip: !searchLocation,
  });

  const getCoordinates = async (address: string) => {
    if (geoCache[address]) return geoCache[address];

    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address,
          key: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
        },
      });

      if (response.data.status === "OK") {
        const location = response.data.results[0].geometry.location;
        setGeoCache((prev) => ({ ...prev, [address]: location }));
        console.log(`Coordinates for ${address}:`, location);
        return location;
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return null;
  };

  useEffect(() => {
    if (!data?.shelters?.shelters) return;

    data.shelters.shelters.forEach(async (shelter) => {
      const fullAddress = `${shelter.address.address1 || ""}, ${shelter.address.city}, ${shelter.address.state}`;
      if (!geoCache[fullAddress]) {
        await getCoordinates(fullAddress);
      }
    });
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Find Shelters</h1>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter city, state or zip code"
            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button
            onClick={() => {
              setSearchLocation(location);
              setPage(1);
              refetch({ location, page: 1 });
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            Search
          </button>
        </div>
      </div>

      {/* Search Results */}
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      <ul className="mt-4">
        {data?.shelters?.shelters?.map((shelter) => {
          const fullAddress = `${shelter.address.address1 || ""}, ${shelter.address.city}, ${shelter.address.state}`;
          const location = geoCache[fullAddress];

          return (
            <li key={shelter.id} className="border-b py-4 text-gray-700">
              <strong className="font-semibold">{shelter.name}</strong> - {shelter.address.city}, {shelter.address.state}

              {/* Render map if coordinates exist */}
              {location && (
                <div className="mt-2">
                  <ShelterMap lat={location.lat} lng={location.lng} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => {
            setPage(page - 1);
            refetch({ location: searchLocation, page: page - 1 });
          }}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => {
            setPage(page + 1);
            refetch({ location: searchLocation, page: page + 1 });
          }}
          disabled={!data?.shelters?.hasMore}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Shelters;
