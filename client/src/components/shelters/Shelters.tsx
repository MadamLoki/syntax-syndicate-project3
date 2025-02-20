import { useQuery } from "@apollo/client";
import { GET_SHELTERS } from "../../utils/sheltersQueries";
import Shelter from "./Shelter";
import AddNewShelter from "./AddNewShelter";

const Shelters = () => {
     const { loading, error, data } = useQuery(GET_SHELTERS);

     if(loading) return <p>Loading shelters...</p>

     if(error) return <p>Error loading shelters: {error.message}</p>
  return (
    <div>
        <h2>Shelters Listings</h2>

        <AddNewShelter />

        {data.shelters.map((shelter: any, index: number) => (
            <Shelter key={index} lat={shelter.latitude} lng={shelter.longitude} />
        ))}
    </div>
  )
}

export default Shelters