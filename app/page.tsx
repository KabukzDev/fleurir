import Image from "next/image"
import Navbar from "@/app/components/navbar"

export default function Home() {
  return (
  <div className="min-h-screen bg-mist-950">
    <Navbar />
      <div className="px-12 flex flex-col items-start justify-start text-left gap-6 mt-25">
        <h1 className="font-family-name:--font-heading) tracking-tight text-8xl italic font-semibold text-white">
          Learn better. <br></br> Grow faster. <br></br><span className="text-flower-blue">Fleurir.</span>
        </h1>
        <button className="text-xl px-6 py-2 bg-flower-blue text-white rounded-md hover:bg-flower-blue/90 transition">
          Get Started
        </button>
      </div>
  </div>
  );
}
