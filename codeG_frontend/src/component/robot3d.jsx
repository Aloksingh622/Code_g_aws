import React from 'react';
import Spline from '@splinetool/react-spline';

const RobotModel = () => {
  return (
    // Container for positioning and initial animation
    // The robot will fade in and slide up slightly when the page loads.
    <div className="w-full h-full flex items-center justify-center 
                  animate-fade-in-up animation-delay-300">
      
      {}
      {}
      <div className="w-full h-full transform scale-90 lg:scale-110 xl:scale-125 animate-float">
        <Spline 
          scene="https://prod.spline.design/WIFA8Gu4KAAgMvdR/scene.splinecode" 
        />
      </div>

    </div>
  );
};

export default RobotModel;