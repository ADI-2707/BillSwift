const InteractiveGrid = () => {
  const stackItems = [
    { id: 1, label: "Create", color: "bg-green-500", delay: "0s" },
    { id: 2, label: "Track", color: "bg-green-600", delay: "0.15s" },
    { id: 3, label: "Manage", color: "bg-green-700", delay: "0.3s" },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-6">
        {stackItems.map((item) => (
          <div
            key={item.id}
            className="cube-animate grid grid-cols-[80px_64px] items-center gap-6"
            style={{ animationDelay: item.delay, marginTop: `${item.id * 2}px` }}
          >
            <div className="label-animate">
              <span className="label-inner text-xs font-bold tracking-widest text-white/80 uppercase">
                {item.label}
              </span>
            </div>

            <div className="w-16 h-16 cube-container relative">
              <div className={`cube-face cube-face-front ${item.color}`} />
              <div
                className={`cube-face cube-face-back ${item.color} brightness-75`}
              />
              <div
                className={`cube-face cube-face-right ${item.color} brightness-90`}
              />
              <div
                className={`cube-face cube-face-left ${item.color} brightness-75`}
              />
              <div className="cube-face cube-face-top bg-green-400" />
              <div
                className={`cube-face cube-face-bottom ${item.color} brightness-50`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveGrid;
