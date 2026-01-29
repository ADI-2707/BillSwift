const Footer = () => {
  return (
    <footer className="w-full mt-16 py-10 text-center border-t border-white/10 bg-transparent backdrop-blur-md">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-1">
          <img
            src="/BillSwift_logo.svg"
            alt="BillSwift Logo"
            className="h-6 w-6"
          />
          <span className="text-white">
            <span className="text-red-600">B</span>ill
            <span className="text-red-600">Swift</span>
          </span>
        </h2>

        <p className="text-gray-400 text-sm italic">
          Your Billing Buddy ⚡ — Because time is money and bills hate wasting
          it.
        </p>

        <p className="text-gray-500 text-xs mt-1">
          Built by{" "}
          <span className="text-green-500 font-semibold">Aditya Singh</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;