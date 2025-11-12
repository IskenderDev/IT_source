import { Routes, Route } from "react-router-dom";
import { Home, Tariffs, Services, NewsList, NewsArticle } from "../pages";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppFab from "../components/common/WhatsAppFab";

export default function App() {
  return (
    <div className="bg-main min-h-screen font-mono">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/tariffs" element={<Tariffs />} />
        <Route path="/news" element={<NewsList />} />
        <Route path="/news/:slug" element={<NewsArticle />} />
      </Routes>
      <Footer />
      <WhatsAppFab phone="996555800013" message="Здравствуйте! Нужна консультация по тарифам." />
    </div>
  );
}
