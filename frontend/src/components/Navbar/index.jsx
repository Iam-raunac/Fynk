// import React from 'react'
// import { useRouter } from 'next/router'
// import styles from "./styles.module.css"
// import { useDispatch, useSelector } from 'react-redux';
// import { reset } from '@/config/redux/reducer/authReducer';

// export default function NavBarComponent() {
//   const router = useRouter();

//   const dispatch = useDispatch();

//   const authState = useSelector((state) => state.auth)

//   return (
//     <div className={styles.container}>
//       <nav className={styles.navBar}>
//         <h1 style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
//           Fynk
//         </h1>

//         <div className={styles.navBarOptionContainer}>

//         {authState.profileFetched &&  <div>
//           <div style={{display: "flex", gap: "1.2rem"}}>
//           <p>Hey, {authState.user.userId.name}</p>
//           <p
//             onClick={() => router.push(`/profile/${authState.user.userId.username}`)}
//             style={{fontWeight: "bold",cursor: "pointer"}}
//           >
//             Profile
//           </p>

//           <p onClick={() => {
//             localStorage.removeItem("token")
//             router.push("/login")
//             dispatch(reset())
//           }} style={{fontWeight: "bold",cursor: "pointer"}}>Logout</p>
//           </div>

//           </div>}

//           {!authState.profileFetched && <button

//             onClick={() => router.push("/login")}
//             className={styles.buttonJoin}
//           >
//             <span className={styles.text}>Be a part</span>
//             <span>Please Come in!</span>
//           </button>}

//         </div>
//       </nav>
//     </div>
//   )
// }
import React from 'react'
import { useRouter } from 'next/router'
import styles from "./styles.module.css"
import { useDispatch, useSelector } from 'react-redux';
import { reset } from '@/config/redux/reducer/authReducer';

export default function NavBarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const currentPath = router.pathname;

  const navItems = [
    {
      label: "Scroll",
      path: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      label: "Discover",
      path: "/discover",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      ),
    },
    {
      label: "My Connections",
      path: "/my_connections",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.sidebarWrapper}>
      {/* Logo */}
      <div className={styles.logo} onClick={() => router.push("/")}>
        <span className={styles.logoText}>Fynk</span>
      </div>

      {/* Nav Card */}
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

      {/* User section at bottom */}
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

      {!authState.profileFetched && (
        <button className={styles.buttonJoin} onClick={() => router.push("/login")}>
          <span className={styles.text}>Be a part</span>
          <span>Please Come in!</span>
        </button>
      )}
    </div>
  );
}