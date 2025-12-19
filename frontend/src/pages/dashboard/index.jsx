import { getAboutUser, getAllUsers } from '@/config/redux/action/authAction';
import { getAllPosts } from '@/config/redux/action/postAction';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import { useRouter } from 'next/router'
import React, {useEffect,useState } from 'react'
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import styles from "./index.module.css";
import { BASE_URL } from '@/config';




export default function dashboard() {

    const router = useRouter();

    const dispatch = useDispatch();

    const authState = useSelector((state) => state.auth)

    // const [isTokenThere, setIsTokenThere] = useState(false)




    useEffect(() => {
        if(authState.isTokenThere){
            
            dispatch(getAboutUser({token: localStorage.getItem('token')}))
            dispatch(getAllPosts())
        }
        if(!authState.all_profiles_fetched){
            dispatch(getAllUsers());

        }

    }, [authState.isTokenThere ])

    if(authState.user) {   /* Render only when user data is available to avoid undefined errors  or use ? */ 

    // modification

    // useEffect(() => {
    //   console.log(authState, authState.user)
    //   console.log("+++++++++++++++++++++++++++++")
    // //   console.log(authState.user.userId)
    
    // }, [authState])
    


  return (
    <UserLayout>
      {/* {authState.profileFetched &&   <div>

        Hey {authState.user.userId.name}

      </div>} */}

    <DashboardLayout>
        <div className={styles.scrollComponent}>

        <div className={styles.createPostContainer}>
            <img className={styles.userProfile} src={`${BASE_URL}/${authState.user.userId.profilePicture}`} alt="" />  
            <textarea placeholder={"What's in your mind?"} className={styles.textarea} name = "" id=""></textarea>
            <label htmlFor="fileUpload">
            <div className={styles.Fab}>
              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
  
              </div>
            </label>
            <input type="file" hidden id='fileUpload' />
            <div className={styles.uploadButton}>Upload File</div>

        </div>

        </div>
    </DashboardLayout>
    


    </UserLayout>
  )
} else {
    return (
      <UserLayout>



    <DashboardLayout>
        <h2>Loading...</h2>
    </DashboardLayout>
    


    </UserLayout>

    )
}
}


