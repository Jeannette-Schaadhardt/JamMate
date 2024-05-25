
const {Client} = require("@googlemaps/google-maps-services-js");


async function getNearestCityName(coordinates) {
    const apiKey = "AIzaSyAr-VpPFIrxBgrr8M99Xm1w9um5e9fi238";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&location_type=ROOFTOP&result_type=street_address&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const addressComponents = data.results[0].address_components;
            const cityNameComponent = addressComponents.find(component => {
                return component.types.includes('locality') || component.types.includes('administrative_area_level_1');
            });
            if (cityNameComponent) {
                return cityNameComponent.long_name;
            } else {
                console.log("No city found near the coordinates.");
            }
        } else {
            console.log("No results found for the given coordinates.");
        }
    } catch (error) {
        console.error("Error getting nearest city:", error);
    }
}


module.exports = {
  getNearestCityName
  }