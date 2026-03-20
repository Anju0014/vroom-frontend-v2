// import axios from'axios'

// const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
// export const nearByCars=async(latitude:number,longitude:number) =>{
//     console.log("sending")
//     console.log(API_URL)
//     console.log(`${API_URL}car/nearby?lat=${latitude}&lng=${longitude}&maxDistance=50`);

//     let response= await axios.get(`${API_URL}car/nearby?lat=${latitude}&lng=${longitude}&maxDistance=50`);
//     console.log("have came back")
//     return response.data
// }

// export const  featuredCarList=async ()=>{
//     let response=await axios.get(`${API_URL}car/featured`);
//     return response.data
// }

// export const findCarDetails=async(carId:string)=>{
//     let response=await axios.get(`${API_URL}car/getCarDetails/${carId}`)
//     return response.data
// }

// export const findBookingDetails=async(carId:string)=>{
//     let response=await axios.get(`${API_URL}car/getBookingDetails/${carId}`)
//     return response.data
    
// }



//   createPendingBooking :async (data: BookingData) => {
//     try {
//       console.log('Sending booking data to:', `bookings/create`, data);
//       const response = await customerApi.post("bookings/create", data);
//       console.log('Booking created:', response.data);
//       return response.data;
//     } catch (error: any) {
//       console.error('Booking API error:', error.response?.data || error.message);
//       throw new Error(`Failed to create booking: ${error.response?.data?.error || error.message}`);
//     }
//   }
// confirmBooking:async(){

// }

// cancelBooking{

// }


