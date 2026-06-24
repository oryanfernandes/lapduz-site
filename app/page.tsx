import HeroVideo from "@/components/sections/HeroVideo";
import PillarsAndDiamond from "@/components/sections/PillarsAndDiamond";
import Frases from "@/components/sections/Frases";
import Solucoes from "@/components/sections/Solucoes";
import ClientsAndReviews from "@/components/sections/ClientsAndReviews";
import LapidationLevels from "@/components/sections/LapidationLevels";
import Legacy from "@/components/sections/Legacy";
import ContactForm from "@/components/sections/ContactForm";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="overflow-clip">
      <HeroVideo />
      <PillarsAndDiamond />
      <Frases />
      <Solucoes />
      <ClientsAndReviews />
      <LapidationLevels />
      <Legacy />
      <ContactForm />
      <Footer />
    </main>
  );
}
