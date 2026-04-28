import React, { Profiler } from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
//import css
import './assets/css/style.css';
import './assets/css/admin.css';


//import layout
import TopBar from './components/layout/TopBar';
import Header from './components/layout/Header';
import Menu from './components/layout/Menu';
import Footer from './components/layout/Footer';
import Chatbot1 from './components/ui/Chatbot1';
import Chatbot2 from './components/ui/Chatbot2';

//import pages client

import HomePage from './pages/client/HomePage';
import About from './pages/client/AboutPage';
import Toptho from './pages/client/TopthoPage';
import Login from './pages/client/LoginPage';
import Forgot from './pages/client/ForgotPage';
import Signup from './pages/client/SignupPage';
import DatLichPage from './pages/client/DatLichPage';
import LichSuPage from './pages/client/LichSuPage';
import DichVuDetailsPage from './pages/client/DichVuDetailsPage';
import ProfilePage from './pages/client/ProfilePage';

//import layout admin
import AdminLayout from './components/layout/AdminLayout';
//import pages admin
import DashboardPage from './pages/admin/DashBoardPage';
import AccountsPage from './pages/admin/AccountPage';
import KhuyenMaiPage from './pages/admin/KhuyenMaiPage';
import DichVuPage from './pages/admin/DichVuPage';
import CustomerPage from './pages/admin/CustomerPage';
import StaffPage from './pages/admin/StaffPage';
import BookingPage from './pages/admin/BookingPage';
import HoaDonPage from './pages/admin/HoaDonPage';
import ReportPage from './pages/admin/ReportPage';

//check auth
import PrivateRoute from './components/ui/PrivateRoute';


const MainLayout = ({ menus }: { menus: any[] }) => {
  return (
    <>
      <TopBar />
      <Header />
      <Menu menus={menus} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Chatbot1 />
      <Chatbot2 />

    </>
  );
};

class App extends React.Component<any, any> {
  menus = [
    { url: "/home", name: "Trang chủ" },
    { url: "/toptho", name: "Top thợ" },
    { url: "/about", name: "Về 30Shine" },
    //{ url: "#timmap", name: "30Shine gần nhất", href: "#timmap" },
    //{ url: "#nucuoidv", name: "Nụ cười dịch vụ", href: "#nucuoidv" },
    // { url: "#cuocthi", name: "Cuộc thi 30Shine", href: "#cuocthi" },
    //{ url: "#saotoasang", name: "Sao toả sáng", href: "#saotoasang" },
  ];
  render(): React.ReactNode {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/signup" element={<Signup />} />


        {/* === ROUTE CHO KHU VỰC ADMIN === */}
        <Route element={<PrivateRoute allowedRoles={[1, 2, 3, 4, 5]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />


            <Route element={<PrivateRoute allowedRoles={[1]} />}>
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="promotions" element={<KhuyenMaiPage />} />
            </Route>


            <Route element={<PrivateRoute allowedRoles={[1, 2]} />}>
              <Route path="services" element={<DichVuPage />} />
              <Route path="customers" element={<CustomerPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="reports" element={<ReportPage />} />
            </Route>


            <Route element={<PrivateRoute allowedRoles={[1, 2, 3, 5]} />}>
              <Route path="bookings" element={<BookingPage />} />
            </Route>


            <Route element={<PrivateRoute allowedRoles={[1, 2, 4]} />}>
              <Route path="invoices" element={<HoaDonPage />} />
            </Route>

          </Route>
        </Route>
        {/* === ROUTE CHO KHU VỰC CLIENT === */}
        <Route element={<MainLayout menus={this.menus} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/toptho" element={<Toptho />} />
          <Route path="/about" element={<About />} />
          <Route path="/datlich" element={<DatLichPage />} />
          <Route path="/lichsu" element={<LichSuPage />} />
          <Route path="/dichvuchitiet/:madv" element={<DichVuDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

      </Routes>
    );
  };
};

export default App;