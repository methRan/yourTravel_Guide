import { HashRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import {
  About,
  Tours,
  TourDetail,
  Guides,
  GuideDetail,
  Ideas,
  DestinationDetail,
  NotFound,
} from "./pages/Explore";
import Contact from "./pages/Contact";
import AuthPage from "./pages/Auth";
import BookingPage from "./pages/Booking";
import Account from "./pages/Account";
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="tours" element={<Tours />} />
            <Route path="tours/:id" element={<TourDetail />} />
            <Route path="guides" element={<Guides />} />
            <Route path="guides/:id" element={<GuideDetail />} />
            <Route path="ideas" element={<Ideas />} />
            <Route path="ideas/:id" element={<DestinationDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<AuthPage />} />
            <Route path="signup" element={<AuthPage signup />} />
            <Route path="book" element={<BookingPage />} />
            <Route path="account" element={<Account />} />
            <Route path="owner" element={<Account admin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
