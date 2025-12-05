import React from 'react'
import { userDataContext } from '../context/userDataContext';
import axios from 'axios';
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';



export default function Customize2() {

  const {userData , backendImage , selectedImage, serverUrl ,setUserData} = React.useContext(userDataContext);
  const [assistantName , setAssistantName] = React.useState(userData?.assistantName ||"" );

  const[loading , setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleUpdateAssistant = async ()=>{
    setLoading(true);
    try{
      let formData = new FormData();
      formData.append('assistantName' , assistantName);
      if(backendImage){
        formData.append('assistantImage' , backendImage);
      }else{
        formData.append('imageUrl' , selectedImage);
      }
      const result = await axios.post(`${serverUrl}/api/user/update`, formData,

      {withCredentials:true}
      
      )
      console.log("Assistant updated successfully:", result.data);
      // API returns { user }, ensure we set the actual user object in context
      setUserData(result.data?.user ?? result.data);
      setLoading(false);
      navigate('/');
    }
    catch(err){
      setLoading(false);
      console.log("Error updating assistant:", err);
    }
  }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px] relative'>
      <MdKeyboardBackspace className='absolute top-[30px] left-[30px] text-white w-[30px] h-[30px] cursor-pointer' onClick={()=>navigate('/customize')}/>
      <h1 className='text-white text-[30px] mb-[40px] text-center'>Enter Your <span className='text-blue-300'>Assistant Name</span></h1>
      <input
          type="text"
          placeholder="eg. Ultron"
          className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[20px] rounded-full text-[18px]"
          required
          onChange={(e) => setAssistantName(e.target.value)} value={assistantName}
        />
        {assistantName && <button className="min-w-[300px] h-[60px] bg-white rounded-full text-black font-semibold text-[19px] mt-[30px] p-[10px] cursor-pointer" disabled={loading} onClick={()=>{handleUpdateAssistant()}}> {!loading ? "Finally Create Your Assistant" : "Loading..."} </button>}

        
        
      
    </div>
  )
}
