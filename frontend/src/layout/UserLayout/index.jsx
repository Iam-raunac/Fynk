// import NavBarComponent from '@/components/Navbar'
// import React from 'react'

// function UserLayout({children}) {
//   return (
//     <div>
//         <NavBarComponent/>
//      {children}

//     </div>
//   )
// }

// export default UserLayout

import React from 'react'

// NavBarComponent hataya — DashboardLayout mein sidebar already hai
// Agar koi page UserLayout use karta hai jo dashboard ke bahar hai
// (jaise blog, profile pages) toh wahan simple wrapper kaafi hai

function UserLayout({ children }) {
  return (
    <div>
      {children}
    </div>
  )
}

export default UserLayout
