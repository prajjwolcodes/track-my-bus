import heroImage from "@/public/herosection.jpg";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative h-[calc(100vh-64px)] w-full overflow-hidden">
            <Image
                src={heroImage}
                alt="Hero Background"
                className="absolute inset-0 h-full w-full object-cover"
            />

        </section>
    );
}