import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlay, FaPause, FaCog, FaTasks } from 'react-icons/fa'; // Example icons

interface Slide {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    icon: <FaPlay className="text-4xl text-primary mb-3" />,
    title: 'Start the Timer',
    description: 'Select a mode (Focus, Short Break, Long Break) and press the play button to begin your session.',
  },
  {
    icon: <FaTasks className="text-4xl text-secondary mb-3" />,
    title: 'Manage Tasks',
    description: 'Add your tasks for the focus session. Mark them complete as you go.',
  },
  {
    icon: <FaCog className="text-4xl text-accent mb-3" />,
    title: 'Customize Settings',
    description: 'Click the settings icon to adjust timer durations, sounds, appearance, and other preferences.',
  },
  // Add more slides as needed
];

export const UsageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="card bg-base-100 shadow-xl mt-8 p-6 relative">
      <h3 className="text-lg font-semibold mb-4 text-center">How to Use Pomodoro Timer</h3>
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform ease-out duration-300" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="min-w-full flex flex-col items-center text-center px-4">
              {slide.icon}
              <h4 className="font-bold mb-1">{slide.title}</h4>
              <p className="text-sm text-base-content/80">{slide.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={goToPrevious} 
        className="btn btn-circle btn-ghost btn-sm absolute top-1/2 left-2 transform -translate-y-1/2"
      >
        <FaChevronLeft />
      </button>
      <button 
        onClick={goToNext} 
        className="btn btn-circle btn-ghost btn-sm absolute top-1/2 right-2 transform -translate-y-1/2"
      >
        <FaChevronRight />
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentIndex === slideIndex ? 'bg-primary' : 'bg-base-300 hover:bg-base-content/30'
            }`}
            aria-label={`Go to slide ${slideIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
