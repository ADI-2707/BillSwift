import React from 'react';

const InteractiveGrid = () => {

  const stackItems = [
    { id: 1, label: "Manage", color: "bg-green-700", cubeDelay: "0s", labelDelay: "1.0s" },
    { id: 2, label: "Track", color: "bg-green-600", cubeDelay: "0.2s", labelDelay: "1.2s" },
    { id: 3, label: "Create", color: "bg-green-500", cubeDelay: "0.4s", labelDelay: "1.4s" },
  ];

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
      <div className="relative pt-20 w-full h-full">
        {stackItems.map((item, index) => (
          <div
            key={item.id}
            className="cube-animate flex items-center absolute"
            style={{
              animationDelay: item.cubeDelay,
              bottom: `${index * 80 + 40}px`, 
              left: '80%',
              marginLeft: '-64px',
              zIndex: index, 
            }}
          >
            <div 
              className="label-animate absolute right-[130%] whitespace-nowrap text-right pr-6 flex flex-col justify-center"
              style={{ 
                top: '16px',
                animationDelay: item.labelDelay 
              }} 
            >
              <span className="text-white font-bold text-sm tracking-wider uppercase drop-shadow-md">
                {item.label}
              </span>

              <div className="h-[1px] w-10 bg-white/20 absolute right-0 top-1/2"></div>
            </div>

            <div className="w-16 h-16 cube-container relative">
              <div className={`cube-face cube-face-front ${item.color} shadow-lg`}></div>
              <div className={`cube-face cube-face-back ${item.color} brightness-75`}></div>
              <div className={`cube-face cube-face-right ${item.color} brightness-90`}></div>
              <div className={`cube-face cube-face-left ${item.color} brightness-75`}></div>
              <div className={`cube-face cube-face-top bg-green-400`}></div>
              <div className={`cube-face cube-face-bottom ${item.color} brightness-50`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute top-[50%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 blur-[70px] rounded-full -z-10 pointer-events-none"></div>
    </div>
  );
};

export default InteractiveGrid;