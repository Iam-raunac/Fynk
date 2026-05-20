// import React, {useEffect} from 'react'


// import styles from "./index.module.css";
// import { useRouter } from 'next/router';
// import ChatWidget from "@/components/ChatWidget";

// import { setTokenIsThere } from '@/config/redux/reducer/authReducer';
// import { useDispatch, useSelector } from 'react-redux';

// export default function DashboardLayout({children}) {

    
//     const router = useRouter();
//     const dispatch = useDispatch();
//     const authState = useSelector((state) => state.auth)

//     useEffect(() => {
//         if(localStorage.getItem('token') === null) {
//             router.push("/login")
//             return;
            
//         }
//        dispatch(setTokenIsThere())
//     }, [dispatch, router])

//   return (
//     <div className="container">



//     <div className={styles.homeContainer}>



//     <div className={styles.homeContainer__leftBar}>




//     <div onClick={() => {

//         router.push("/dashboard")

//     }} className={styles.sideBarOption}>
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
//   <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
// </svg>
// <p>Scroll</p>

//     </div>

//     <div onClick={() => {
//                 router.push("/discover")
//     }} className={styles.sideBarOption}>
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
//   <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
// </svg>

// <p>Discover</p>

//     </div>


//     <div onClick={() => {
//                 router.push("/my_connections")
//     }} className={styles.sideBarOption}>
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
//   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
// </svg>


// <p>My Connections</p>

//     </div>

    

//     </div>
//     <div className={styles.homeContainer__feedContainer}>
//         {children}
        

//     </div>

//     <div className={styles.homeContainer__extraContainer}>
//         <h3>Top Profiles</h3>

//         {authState.all_profiles_fetched && authState.all_users.map((profile) => {

//             return (
//                  <div
//                     key={profile._id}
//                     onClick={() => router.push(`/profile/${profile.userId.username}`)}
//                     className={styles.extraContainer_profile}
//                   >
//                     <p>{profile.userId.name}</p>
//                     {/* <p>{profile?.userId?.name}</p> */}
//                     </div>
                      
//                     )

            
//         })}

//     </div>





//     </div>

//     <ChatWidget />


//   </div>
//   )
// }

import React, { useEffect } from 'react'
import styles from "./index.module.css";
import { useRouter } from 'next/router';
import ChatWidget from "@/components/ChatWidget";
import { setTokenIsThere, reset } from '@/config/redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const currentPath = router.pathname;

  useEffect(() => {
    if (localStorage.getItem('token') === null) {
      router.push("/login");
      return;
    }
    dispatch(setTokenIsThere());
  }, [dispatch, router]);

  const navItems = [
    {
      label: "Scroll",
      path: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      label: "Discover",
      path: "/discover",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      ),
    },
    {
      label: "My Connections",
      path: "/my_connections",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.homeContainer}>

      {/* ── LEFT SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.logo} onClick={() => router.push("/")}>
          Fynk
        </div>

        <div className={styles.navCard}>
          {navItems.map((item) => {
            const isActive = currentPath.startsWith(item.path);
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {isActive && <span className={styles.activeBar} />}
              </button>
            );
          })}
        </div>

        {authState.profileFetched && (
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              <p className={styles.userGreet}>Hey,</p>
              <p className={styles.userName}>{authState.user.userId.name}</p>
            </div>
            <div className={styles.userActions}>
              <button
                className={styles.userActionBtn}
                onClick={() => router.push(`/profile/${authState.user.userId.username}`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                Profile
              </button>
              <button
                className={`${styles.userActionBtn} ${styles.logoutBtn}`}
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/login");
                  dispatch(reset());
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── FEED ── */}
      <main className={styles.feedContainer}>
        {children}
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className={styles.extraContainer}>

        {/* Top Profiles */}
        <div className={styles.sideCard}>
          <h3 className={styles.sideCardTitle}>Top Profiles</h3>
          {authState.all_profiles_fetched && authState.all_users.slice(0, 3).map((profile) => (
            <div
              key={profile._id}
              onClick={() => router.push(`/profile/${profile.userId.username}`)}
              className={styles.extraProfile}
            >
              <div className={styles.extraProfileAvatar}>
                {profile.userId.name?.[0]?.toUpperCase()}
              </div>
              <p>{profile.userId.name}</p>
            </div>
          ))}
        </div>

        {/* Who to Connect */}
        <div className={styles.sideCard}>
          <h3 className={styles.sideCardTitle}>Who to Connect</h3>
          <p className={styles.sideCardSub}>People you might know</p>
          {authState.all_profiles_fetched && authState.all_users.slice(0, 4).map((profile) => (
            <div key={profile._id} className={styles.connectCard}>
              <div className={styles.connectAvatar}>
                {profile.userId.name?.[0]?.toUpperCase()}
              </div>
              <div className={styles.connectInfo}>
                <p className={styles.connectName}>{profile.userId.name}</p>
                <p className={styles.connectUsername}>@{profile.userId.username}</p>
              </div>
              <button
                className={styles.connectBtn}
                onClick={() => router.push(`/profile/${profile.userId.username}`)}
              >
                Connect
              </button>
            </div>
          ))}
        </div>

        {/* <p className={styles.sideFooter}>Fynk © 2025</p> */}

      </aside>

      <ChatWidget />
    </div>
  );
}