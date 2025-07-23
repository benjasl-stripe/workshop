import Image from "next/image"
import { Button, Heading } from "@medusajs/ui"
import Link from "next/link"

const Hero = () => {
  return (
    <div className="relative h-[65vh] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero.jpg"
        layout="fill"
        loading="eager"
        priority={true}
        quality={90}
        objectFit="cover"
        objectPosition="center 75%"
        alt="homepage banner"
        className="absolute inset-0"
        draggable="false"
      />
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center items-center text-center h-full px-4 small:px-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-5xl leading-10 text-white font-normal drop-shadow-lg"
          >
            Scooter Rentals
          </Heading>
          <Heading
            level="h2"
            className="text-xl leading-10 text-gray-200 font-normal drop-shadow-md"
          >
            See the world on two wheels
          </Heading>
        </span>
        <Link href="/store">
          <Button variant="secondary">
            Rent a Scooter
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Hero
