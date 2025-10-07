// src/App.jsx
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Hero from "./sections/Hero";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Experience from "./sections/Experience";
import Achievements from "./sections/Achievements";
import Contact from "./sections/Contact";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-gray-200">
      <Navbar />
      <main className="pt-[64px]"> {/* account for fixed navbar height */}
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}