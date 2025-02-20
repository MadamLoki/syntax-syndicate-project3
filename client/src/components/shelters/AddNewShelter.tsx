import { useState } from "react"
import { ADD_SHELTER } from "../../utils/mutations";
import { useMutation } from "@apollo/client";

const AddNewShelter = () => {

    const [createShelter, { data, loading, error }] = useMutation(ADD_SHELTER);

    const [formData, setFormData] = useState({
        location: "",
        contactInfo: "",
    });

    const handleChangeInput = (event) => {
        const { name, value } = event.target;
        setFormData(previous => ({ ...previous, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const location = formData.location.split(' ').join('+');

        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}`);

        const data = await response.json();

        console.log(data.results[0].geometry.location.lat)
        console.log(data.results[0].geometry.location.lng)

        createShelter({
            variables: {
                createShelterInput2: {
                    contactInfo: formData.contactInfo,
                    latitude: parseFloat(data.results[0].geometry.location.lat),
                    longitude: parseFloat(data.results[0].geometry.location.lng)
                }
            }
        }).then(response => {
            console.log("Shelter created successfully:", response.data);
          }).catch(error => {
            console.error("Error creating shelter:", error);
          });
    }

    return (
        <div className="new-shelters">
            <h2>Add new shelter</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="location">Location:</label>
                    <input type="text" id="location" name="location" placeholder="1600 Amphitheatre Parkway, Mountain View, CA" onChange={handleChangeInput} />
                </div>
                <div className="form-group">
                    <label htmlFor="contact">Email</label>
                    <input type="text" id="contact" name="contactInfo" placeholder="johndoe@email.com" onChange={handleChangeInput} />
                </div>
                <div className="form-group">
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    )
}

export default AddNewShelter