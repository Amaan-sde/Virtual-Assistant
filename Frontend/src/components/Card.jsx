import React from 'react'
import { userDataContext } from '../context/userDataContext';



export default function Card({image}) {
    const {
      serverUrl,
      userData,
      setUserData,
      backendImage,
      setBackendImage,
      frontendImage,
      setFrontendImage,
      selectedImage,
      setSelectedImage,
    } = React.useContext(userDataContext);
  return (
    <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#030326] border-2 border-[blue] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer transition-shadow duration-300 hover:border-[white] hover:border-4 ${selectedImage == image ? "border-[white] border-4 shadow-2xl hover:shadow-blue-950" :null}`} onClick={()=>{ setSelectedImage(image) 
    setBackendImage(null);
    setFrontendImage(null);
    }}>
        <img src={image} alt="card image" className='h-full object-cover'/>
    </div>
  )
}
