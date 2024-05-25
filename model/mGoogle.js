
const {Client} = require("@googlemaps/google-maps-services-js");


async function getNearestCityName(coordinates) {
  try {
      const client = new Client({});
      const apiKey = "AIzaSyAr-VpPFIrxBgrr8M99Xm1w9um5e9fi238";
      const response = await client.reverseGeocode({
          params: {
              latlng: `${coordinates.lat},${coordinates.lng}`,
              key: apiKey,
          }
      });

      if (response.data.results && response.data.results.length > 0) {
          const addressComponents = response.data.results[0].address_components;
          const cityNameComponent = addressComponents.find(component => {
              return component.types.includes('locality') || component.types.includes('administrative_area_level_1');
          });
          if (cityNameComponent) {
              console.log("Nearest city:", cityNameComponent.long_name);
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