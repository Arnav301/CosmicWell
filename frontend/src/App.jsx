import Background from "./Background"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import Hero from "./Hero"

function App() {
  return (
     <Background>
      <div className="flex h-screen">
        {/* --- Sidebar (Fixed on the left) --- */}
        <Sidebar />

        {/* --- Main Content Area (Takes remaining space) --- */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* --- Navbar (Stays at the top) --- */}
          <Navbar />

          {/* --- Page Content (Scrollable) --- */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* This is where your actual page content, charts, 
              and other components will go.
            */}
            {/* Add more components here */}
            <Hero/>
            
          </div>

        </main>
      </div>
    </Background>

  )
}

export default App
