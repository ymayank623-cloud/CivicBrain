import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function TopProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger on route change
    setVisible(true);
    setProgress(25);

    const timer1 = setTimeout(() => setProgress(65), 120);
    const timer2 = setTimeout(() => setProgress(88), 240);
    const timer3 = setTimeout(() => {
      setProgress(100);
      const timer4 = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer4);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div
        className="h-[3px] bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.9)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '180ms' : '280ms',
          opacity: visible ? 1 : 0
        }}
      />
    </div>
  );
}
