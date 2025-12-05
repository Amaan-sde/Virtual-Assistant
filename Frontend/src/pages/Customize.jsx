import React from 'react'
import Card from '../components/Card'
import { useState } from 'react'
import image1 from '../assets/image1.png'
import image2 from '../assets/image2.jpg'
import image3 from '../assets/authBg.png'
import image4 from '../assets/image4.png'   
import image5 from '../assets/image5.png'
import image6 from '../assets/image6.jpeg'
import image7 from '../assets/image7.jpeg'
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from '../context/userDataContext';
import { useNavigate } from 'react-router-dom'
import { MdKeyboardBackspace } from "react-icons/md";

export default function Customize() {
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

    // const [frontendImage , setFrontendImage] = useState(null);
    // const [backendImage , setBackendImage] = useState(null);
    const inputImage = React.useRef(null);
    const navigate = useNavigate();

    const handleImage = (e) =>{
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    }


  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px]'>
      <MdKeyboardBackspace className='absolute top-[30px] left-[30px] text-white w-[30px] h-[30px] cursor-pointer' onClick={()=>navigate('/')}/>
        <h1 className='text-white text-[30px] mb-[40px] text-center'>Select your <span className='text-blue-300'>Assistant Image</span></h1>
        <div className='w-[90%] max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]  '> 
          <Card image={image1}/>
          <Card image={image2}/>
          <Card image={image3}/>
          <Card image={image4}/>
          <Card image={image5}/>
          <Card image={image6}/>
          <Card image={image7}/>
           <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#030326] border-2 border-[blue] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer transition-shadow duration-300 hover:border-[white] hover:border-4 flex items-center justify-center ${selectedImage == "input" ? "border-[white] border-4 shadow-2xl hover:shadow-blue-950" :null} `} onClick={()=>{inputImage.current.click()
            setSelectedImage('input');
           }}>
            {!frontendImage && <RiImageAddLine className='text-white w-[25px] h-[25px] ' />}
            {frontendImage && <img src={frontendImage} className='h-full object-cover '/>}
            
         
      
    </div>
    <input type="file" accept='image/' ref={inputImage}  hidden onChange={handleImage} />
   
        </div>
        {selectedImage && <button className="min-w-[150px] h-[60px] bg-white rounded-full text-black font-semibold text-[19px] mt-[30px] p-[10px] cursor-pointer" onClick={()=>navigate('/customize2')}>Next</button>}
         
        
    </div>
  )
}
