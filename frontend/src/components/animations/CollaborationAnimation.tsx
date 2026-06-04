import { useEffect, useState } from "react";
import {
  Plane,
  Rocket,
  Users,
  Sparkles,
  ClipboardList,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function CollaborationAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    // Start animation when component mounts
    setIsVisible(true);

    const interval = setInterval(() => {
      setAnimationStage((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='mt-16 mb-8 relative overflow-hidden rounded-2xl gradient-surface border border-border p-8'>
      <div className='absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none' />

      <div className='relative z-10'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h3 className='text-xl font-semibold font-heading mb-2'>
            Teams are collaborating in real-time
          </h3>
          <p className='text-muted-foreground text-sm'>
            Groups form dynamically around tasks, meetings connect people
            instantly
          </p>
        </div>

        {/* Animated content based on stage */}
        <div className='relative h-40 flex items-center justify-center'>
          {animationStage === 0 && <PlaneTakeoffAnimation />}
          {animationStage === 1 && <RocketLaunchAnimation />}
          {animationStage === 2 && <TeamSyncAnimation />}
          {animationStage === 3 && <TaskFlowAnimation />}
        </div>

        {/* Stage indicator dots */}
        <div className='flex justify-center gap-2 mt-6'>
          {[0, 1, 2, 3].map((stage) => (
            <button
              key={stage}
              onClick={() => setAnimationStage(stage)}
              className={`transition-all duration-300 rounded-full ${
                animationStage === stage
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>

        {/* Status message */}
        <div className='text-center mt-4'>
          <p className='text-sm text-primary/80 font-medium animate-pulse'>
            {animationStage === 0 && "Meeting launched — team is taking off!"}
            {animationStage === 1 &&
              "Groups forming dynamically around tasks..."}
            {animationStage === 2 &&
              "Real-time sync — everyone's on the same page"}
            {animationStage === 3 && "Tasks flowing — backlog → board → done!"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Plane Takeoff Animation
function PlaneTakeoffAnimation() {
  return (
    <div className='relative w-full h-full flex items-center justify-center'>
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='relative'>
          {/* Runway line */}
          <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-0.5 bg-primary/30 rounded-full'>
            <div className='absolute inset-0 bg-primary animate-pulse' />
          </div>

          {/* Animated plane */}
          <div className='animate-[takeoff_2s_ease-in-out_infinite]'>
            <div className='relative'>
              <Plane
                size={48}
                className='text-primary'
                style={{
                  transform: "rotate(-45deg)",
                  filter: "drop-shadow(0 0 10px rgba(255,160,0,0.5))",
                }}
              />
              {/* Motion trail */}
              <div className='absolute -left-8 top-1/2 -translate-y-1/2 flex gap-1'>
                <div
                  className='w-1 h-1 rounded-full bg-primary animate-ping'
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className='w-1 h-1 rounded-full bg-primary animate-ping'
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className='w-1 h-1 rounded-full bg-primary animate-ping'
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>

          {/* Clouds */}
          <div className='absolute -top-8 -right-12 opacity-30'>
            <div className='w-12 h-8 bg-white/20 rounded-full animate-[float_4s_ease-in-out_infinite]' />
          </div>
          <div className='absolute bottom-4 -left-16 opacity-20'>
            <div className='w-16 h-10 bg-white/20 rounded-full animate-[float_5s_ease-in-out_infinite]' />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes takeoff {
          0%, 100% {
            transform: translateX(0) translateY(0) rotate(-45deg);
          }
          50% {
            transform: translateX(30px) translateY(-20px) rotate(-40deg);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

// Rocket Launch Animation
function RocketLaunchAnimation() {
  return (
    <div className='relative w-full h-full flex items-center justify-center'>
      <div className='relative'>
        {/* Launch pad */}
        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary/50 rounded-full' />

        {/* Animated rocket */}
        <div className='animate-[launch_2.5s_ease-in-out_infinite]'>
          <Rocket size={44} className='text-primary' />

          {/* Fire/Thrust effect */}
          <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5'>
            <div className='w-3 h-3 rounded-full bg-orange-500 animate-ping' />
            <div className='w-4 h-4 rounded-full bg-orange-400 animate-pulse' />
            <div
              className='w-2 h-2 rounded-full bg-yellow-500 animate-ping'
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>

        {/* Particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className='absolute w-1 h-1 rounded-full bg-primary/60 animate-[particle_2s_ease-out_infinite]'
            style={{
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              animationDelay: `${i * 0.15}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes launch {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }
        @keyframes particle {
          0% {
            transform: translateX(-50%) translateY(0);
            opacity: 0.8;
          }
          100% {
            transform: translateX(calc(-50% + ${(Math.random() - 0.5) * 40}px)) translateY(-60px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Team Sync Animation
function TeamSyncAnimation() {
  return (
    <div className='relative w-full h-full flex items-center justify-center'>
      <div className='flex items-center gap-6'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='relative animate-[bounce_2s_ease-in-out_infinite]'
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center'>
              <Users size={24} className='text-primary' />
            </div>
            {/* Connection lines between participants */}
            {i < 3 && (
              <div className='absolute top-1/2 -right-8 w-6 h-0.5 bg-gradient-to-r from-primary to-transparent animate-pulse' />
            )}
          </div>
        ))}
      </div>
      {/* Sync ring */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='w-48 h-48 rounded-full border-2 border-primary/20 animate-[spin_4s_linear_infinite]' />
        <div className='absolute w-32 h-32 rounded-full border border-primary/10 animate-[spin_3s_linear_infinite_reverse]' />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

// Task Flow Animation
function TaskFlowAnimation() {
  return (
    <div className='relative w-full h-full flex items-center justify-center'>
      <div className='flex items-center gap-3'>
        {/* Backlog -> Board -> Done flow */}
        <div className='flex flex-col items-center gap-2'>
          <div className='w-12 h-12 rounded-lg bg-secondary flex items-center justify-center animate-pulse'>
            <ClipboardList size={24} className='text-primary' />
          </div>
          <span className='text-[10px] text-muted-foreground'>Backlog</span>
        </div>

        <ArrowRight
          className='text-primary animate-[bounceHorizontal_1s_ease-in-out_infinite]'
          size={20}
        />

        <div className='flex flex-col items-center gap-2'>
          <div className='w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center animate-bounce'>
            <BarChart3 size={24} className='text-primary' />
          </div>
          <span className='text-[10px] text-muted-foreground'>Board</span>
        </div>

        <ArrowRight
          className='text-primary animate-[bounceHorizontal_1s_ease-in-out_infinite_0.5s]'
          size={20}
        />

        <div className='flex flex-col items-center gap-2'>
          <div className='w-12 h-12 rounded-lg bg-chart-4/20 flex items-center justify-center relative'>
            <CheckCircle2 size={24} className='text-chart-4' />
            <div className='absolute inset-0 rounded-lg border-2 border-chart-4/50 animate-ping' />
          </div>
          <span className='text-[10px] text-muted-foreground'>Done</span>
        </div>
      </div>

      {/* Flying particles (tasks) */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className='absolute w-1.5 h-1.5 rounded-full bg-primary animate-[flyAcross_2.5s_linear_infinite]'
          style={{
            top: `${40 + Math.random() * 20}%`,
            animationDelay: `${i * 0.4}s`,
            opacity: 0.6,
          }}
        />
      ))}

      <style>{`
        @keyframes bounceHorizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        @keyframes flyAcross {
          0% {
            transform: translateX(-100px);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// ArrowRight component for the task flow
function ArrowRight({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M5 12h14' />
      <path d='m12 5 7 7-7 7' />
    </svg>
  );
}
