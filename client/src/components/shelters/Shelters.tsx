/*import { useQuery } from "@apollo/client";
import { GET_SHELTERS } from "../../utils/sheltersQueries.js";
import Shelter from "./Shelter";
import AddNewShelter from "./AddNewShelter.js";

const Shelters = () => {
  const { loading, error, data } = useQuery(GET_SHELTERS);

  if (loading) return <p>Loading shelters...</p>

  if (error) return <p>Error loading shelters: {error.message}</p>
  return (
    <div className="bg-gray-100 py-16">
      <div className="container mx-auto px-6">
        <AddNewShelter />
        <div className="max-w-md w-full mx-auto py-16 space-y-8">
          <h2 className="text-3xl font-bold text-center">Shelters Listings</h2>
          <div className="w-full flex flex-wrap gap-4">
            {data.shelters.map((shelter: any, index: number) => (
              <Shelter key={index} lat={shelter.latitude} lng={shelter.longitude} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shelters;*/