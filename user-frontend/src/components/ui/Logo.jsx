import React from "react";

const Logo = ({ className = "" }) => {
  return (
    <img
      src="/logo.png"
      alt="Grade A Learning logo"
      className={`block h-14 w-14 object-contain object-center sm:h-16 sm:w-16 ${className}`.trim()}
    />
  );
};

export default Logo;
