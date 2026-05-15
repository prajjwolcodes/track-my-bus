import Image from "next/image";
import { Libre_Baskerville, Nunito } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
});

const nunito = Nunito({
    subsets: ["latin"],
    weight: ["400"],
});

const imgSubtract = "/howitworks.png"

const steps = [
    {
        number: "01",
        title: "Setup & Start Tracking",
        description:
            "The administrator sets up buses, routes, and users, while the driver logs into the app and starts the trip, enabling GPS tracking to begin in real time.",
    },
    {
        number: "02",
        title: "Real-Time Monitoring",
        description:
            "The system continuously tracks the bus location and updates it on a live map, allowing parents and administrators to monitor movement and route progress at any time.",
    },
    {
        number: "03",
        title: "Alerts & Management",
        description:
            "Parents receive instant notifications about arrivals and delays, while administrators monitor operations and make necessary adjustments for smooth transportation.",
    },
] as const;

type SectionHeadingProps = {
    className?: string;
    sectionHeading?: string;
    sectionSubtitle?: string;
};

function SectionHeading({
    className,
    sectionHeading = "How It Works?",
    sectionSubtitle =
    "A simple and efficient process that connects administrators, drivers, and parents to ensure safe and reliable school transportation in real time.",
}: SectionHeadingProps) {
    return (
        <div className={className}>
            <div className="flex w-full flex-col items-center gap-4 text-center">
                <h2
                    className={`${libreBaskerville.className} text-[40px] text-[#313235] sm:text-[44px] lg:text-[48px]`}
                    style={{ lineHeight: "48px" }}
                >
                    {sectionHeading}
                </h2>
                <p
                    className={`${libreBaskerville.className} text-[16px] tracking-[0.15px] text-[#535459] opacity-80`}
                    style={{ lineHeight: "24px", maxWidth: "820px" }}
                >
                    {sectionSubtitle}
                </p>
            </div>
        </div>
    );
}

type StepCardProps = {
    number: string;
    title: string;
    description: string;
    reverse?: boolean;
};

function StepCard({ number, title, description, reverse = false }: StepCardProps) {
    return (
        <div
            className={`flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-6 ${reverse ? "lg:flex-row-reverse" : ""}`}
        >
            <p
                className={`${libreBaskerville.className} shrink-0 text-[90px] tracking-[-1.5px] text-[#00244b] opacity-15`}
                style={{ lineHeight: "72px" }}
            >
                {number}
            </p>

            <div
                className="border border-[#edeef0] bg-[#f1f1f2] p-4 shadow-[10px_10px_10px_rgba(51,120,194,0.25)]"
                style={{ borderRadius: "20px" }}
            >
                <div
                    className="border border-[#c0c0c4] bg-[#f1f1f2] p-8"
                    style={{ borderRadius: "12px" }}
                >
                    <div className="space-y-2">
                        <h3
                            className={`${libreBaskerville.className} text-[20px] leading-6 tracking-[0.15px] text-[#313235]`}
                        >
                            {title}
                        </h3>
                        <p
                            className={`${nunito.className} text-[15px] leading-[22.5px] tracking-[0.25px] text-[#535459] opacity-80`}
                        >
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="bg-[#fdf9f2] px-6 py-20 sm:px-8 lg:px-8 lg:py-28">
            <div
                className="mx-auto flex w-full flex-col items-center gap-15"
                style={{ maxWidth: "1204px" }}
            >
                <SectionHeading className="w-full" />

                <div className="flex w-full flex-col items-center justify-center gap-15 lg:flex-row lg:items-start">
                    <div
                        className="relative w-full shrink-0 overflow-hidden lg:self-stretch"
                        style={{ maxWidth: "572px", borderRadius: "28px" }}
                    >
                        <Image
                            alt="School bus tracking illustration"
                            src={imgSubtract}
                            width={572}
                            height={696}
                            unoptimized
                            className="h-auto w-full object-cover"
                        />
                    </div>

                    <div
                        className="flex w-full flex-1 flex-col"
                        style={{ maxWidth: "572px", gap: "55px" }}
                    >
                        <StepCard
                            number={steps[0].number}
                            title={steps[0].title}
                            description={steps[0].description}
                        />
                        <StepCard
                            number={steps[1].number}
                            title={steps[1].title}
                            description={steps[1].description}
                            reverse
                        />
                        <StepCard
                            number={steps[2].number}
                            title={steps[2].title}
                            description={steps[2].description}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}