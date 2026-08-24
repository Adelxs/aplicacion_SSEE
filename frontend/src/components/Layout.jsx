import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout() {
    
    
    return (
        <>
            <Sidebar />

            <main className="main-content">
                <Outlet />
                
            </main>
        </>
    );
}

export default Layout;