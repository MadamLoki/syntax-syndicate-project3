// @ts-nocheck

/*import { useState } from "react"
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
        <div className="max-w-md mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">Add new shelter</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center">
                <div className="mb-4">
                    <label htmlFor="location" className="mb-2 block text-xs font-semibold">Location:</label>
                    <input type="text" id="location" name="location" className="w-full pl-4 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500" placeholder="1600 Amphitheatre Parkway, Mountain View, CA" onChange={handleChangeInput} />
                </div>
                <div className="mb-4">
                    <label htmlFor="contact" className="mb-2 block text-xs font-semibold">Email</label>
                    <input type="text" id="contact" name="contactInfo" className="w-full pl-4 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500" placeholder="johndoe@email.com" onChange={handleChangeInput} />
                </div>
                <div className="form-group">
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors" type="submit">Submit</button>
                </div>
            </form>
        </div>
    )
}

export default AddNewShelter*/