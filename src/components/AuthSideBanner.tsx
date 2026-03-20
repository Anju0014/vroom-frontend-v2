import { AuthSideBannerProps } from "@/types/authTypes";
import Image from "next/image";


const AuthSideBanner: React.FC<AuthSideBannerProps> = ({
  heading = "Vroom",
  subText,
  bottomText,
}) => {
  return (
    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-600 to-orange-500 flex-col justify-center items-center p-12 relative">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-6">{heading}</h1>
        <p className="text-xl max-w-md">{subText}</p>
        <div>
          <Image
            src="/images/car-convertible.png"
            alt="Car Image"
            width={400}
            height={200}
            priority
            // layout="responsive"
          />
        </div>
      </div>
      <div className="absolute bottom-8 text-white opacity-80">
        <p className="font-medium">{bottomText}</p>
      </div>
    </div>
  );
};

export default AuthSideBanner;
