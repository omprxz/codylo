import { memo } from "react";
import PropTypes from "prop-types";

const Screen1 = memo(({ className = "" }) => {
  return (
    <div
      className={`w-full max-w-[390px] h-screen bg-gray-900 overflow-hidden text-center text-[36px] text-white font-circular-std ${className}`}
    >
      <img
        className="absolute h-[72%] w-[181%] top-[2%] right-[-41%] bottom-[26%] left-[-41%] max-w-full overflow-hidden max-h-full object-contain opacity-30"
        alt=""
        src="/group-11@2x.png"
      />
      <div className="absolute top-[66%] left-1/2 transform -translate-x-1/2 inline-block w-[306px]">
        How may I help you today!
      </div>
      <div className="absolute top-[82.5%] left-[6%] right-[6%] rounded-3xl bg-white flex items-center justify-center py-6 px-2 text-sm text-gray-900">
        <b className="relative">Get Started</b>
      </div>
      <img
        className="absolute h-[96%] w-[108%] top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/group.svg"
      />
    </div>
  );
});

Screen1.propTypes = {
  className: PropTypes.string,
};

export default Screen1;