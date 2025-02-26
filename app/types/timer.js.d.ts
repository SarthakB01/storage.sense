
declare module 'timer.js' {

    interface TimerConfig {
  
      tick?: number;
  
      onTick?: (ms: number) => void;
  
      onEnd?: () => void;
  
    }
  
  
  
    class Timer {
  
      constructor(config?: TimerConfig);
  
      start(time?: number): void;
  
      stop(): void;
  
      pause(): void;
  
      resume(): void;
  
    }
  
  
  
    export default Timer;
  
  }
  