import { getAboutUser, getAllUsers } from '@/config/redux/action/authAction';
import { createPost, deletePost, getAllPosts } from '@/config/redux/action/postAction';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import { useRouter } from 'next/router'
import React, {useEffect,useState } from 'react'
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import styles from "./index.module.css";
import { BASE_URL } from '@/config';
import { Cursor } from 'react-simple-typewriter';




export default function dashboard() {

    const router = useRouter();

    const dispatch = useDispatch();

    const authState = useSelector((state) => state.auth)

    // const [isTokenThere, setIsTokenThere] = useState(false)

      const postState =  useSelector((state) => state.postReducer)


    useEffect(() => {
        if(authState.isTokenThere){
            
            dispatch(getAboutUser({token: localStorage.getItem('token')}))
            dispatch(getAllPosts())
        }
        if(!authState.all_profiles_fetched){
            dispatch(getAllUsers());

        }

    }, [authState.isTokenThere ])

    const[postContent, setPostContent] = useState("");
    const[fileContent, setFileContent] = useState(); // BELOW HOW TO HANDLE FILE UPLOAD

    const handleUpload = async() => {

      await dispatch(createPost({file: fileContent, body: postContent}));
      setPostContent("");
      setFileContent(null);
      dispatch(getAllPosts());

    }
    // long pooling
    useState(() => {
      setInterval(()=> {
        dispatch(getAllPosts())
      }, 900)
    })  // every 900 milliseconds fetch posts


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

          <div className={styles.wrapper}>
          <div className={styles.createPostContainer}>
            <img className={styles.userProfile} src={`${BASE_URL}/${authState.user.userId.profilePicture}`} alt="" />  
            <textarea onChange={(e) => setPostContent(e.target.value)} value={postContent}placeholder={"What's in your mind?"} className={styles.textarea} name = "" id=""></textarea>
            <label htmlFor="fileUpload">
            <div className={styles.Fab}>
              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
  
              </div>
            </label>
            <input onChange={(e) => setFileContent(e.target.files[0])} type="file" hidden id='fileUpload' />
            {postContent.length > 0 &&
              <div onClick={handleUpload} className={styles.uploadButton}>Post</div>
            
            }
             

            

              


        </div>
{/* feed below */}

        <div className={styles.feedContainer}>
              {postState.posts.map((post) => {
                return(
                  <div key={post._id} className={styles.singleCard}>

                    <div className={styles.singleCard_profileContainer}>
                   <img src={`${BASE_URL}/${post.userId.profilePicture}`}/>
                    <div>
                      <div  style={{display:"flex", gap:"1.2rem", justifyContent:"space-between"}}  >
                      <p style={{fontWeight:"bold"}}>{post.userId.name}</p>
                      {
                      post.userId._id === authState.user.userId._id &&
                      <div onClick={async() => {
                       await dispatch(deletePost({post_id: post._id}))
                       await dispatch(getAllPosts())
                      }} style={{ cursor:"pointer"}}>
                      <svg style={{height: "1.4em", color:"red"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                           <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                      </div>
                    }

                      </div>

                    <p style={{color:"grey"}}>@{post.userId.username}</p>
                    <p style ={{paddingTop:"1.3rem"}}>{post.body}</p>

                    <div className={styles.singleCard_image}> 
                    <img src={`${BASE_URL}/${post.media}`}  />
                    </div>


                    </div>

                    </div>

                  </div>
                )
              })}

              </div>

          </div>



        </div>

        {/* <div className={styles.scrollComponent}>
  <div className={styles.wrapper}> */}

    {/* CREATE POST — SIRF POST BOX */}
    {/* <div className={styles.createPostContainer}>
      <img
        className={styles.userProfile}
        src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
      />

      <textarea
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        placeholder="What's in your mind?"
        className={styles.textarea}
      />

      <label htmlFor="fileUpload">
        <div className={styles.Fab}>+</div>
      </label>

      <input
        type="file"
        hidden
        id="fileUpload"
        onChange={(e) => setFileContent(e.target.files[0])}
      />

      {postContent.length > 0 && (
        <div onClick={handleUpload} className={styles.uploadButton}>
          Post
        </div>
      )}
    </div> */}

    {/* ✅ FEED — AB NICHE AAYEGA */}
    {/* <div className={styles.feedContainer}>
      {postState.posts.map((post) => (
        <div key={post._id} className={styles.singleCard}>
          <div className={styles.singleCard_profileContainer}>
            <img src={`${BASE_URL}/${post.userId.profilePicture}`} />
            <div>
              <div style={{display:"flex", gap:"1.2rem", justifyContent:"space-between"}}>
              <p style={{fontWeight:"bold"}}>{post.userId.name}</p>
                    {
                      post.userId._id === authState.user.userId._id &&
                      <div style={{ cursor:"pointer"}}>
                      <svg style={{height: "1.4em", color:"red"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                           <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                      </div>
                    }


              </div>

            <p style={{color:"grey"}}>@{post.userId.username}</p>
            <p style ={{paddingTop:"1.3rem"}}>{post.body}</p>


            <div className={styles.singleCard_image}> </div>
              <img src={`${BASE_URL}/${post.media}`}  />


            </div>
          </div>
        </div>
      ))}
    </div>

  </div>
</div> */}



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


