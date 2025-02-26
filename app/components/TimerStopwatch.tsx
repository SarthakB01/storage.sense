import { useState, useEffect, useRef } from "react";
import { Timer } from "easytimer.js";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa"; // Import icons from React Icons

const TimerStopwatch = () => {
    const [timerSeconds, setTimerSeconds] = useState<number>(120); // 2 minutes in seconds
    const [timerPaused, setTimerPaused] = useState<boolean>(false);
    const [stopwatchTime, setStopwatchTime] = useState<number>(0); // Store time in milliseconds
    const [stopwatchPaused, setStopwatchPaused] = useState<boolean>(false);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);

    const [timer, setTimer] = useState<Timer | null>(null);
    const stopwatchRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const pausedTimeRef = useRef<number>(0);

    // Initialize Timer
    useEffect(() => {
        const timerInstance = new Timer();

        // Timer Event Listeners
        timerInstance.addEventListener("secondsUpdated", () => {
            setTimerSeconds(timerInstance.getTotalTimeValues().seconds);
        });

        timerInstance.addEventListener("targetAchieved", () => {
            setIsTimerRunning(false);
            setTimerPaused(false);
            alert("Timer finished!");
        });

        setTimer(timerInstance);

        return () => {
            timerInstance.stop();
        };
    }, []);

    // Custom stopwatch implementation with RAF for millisecond precision
    useEffect(() => {
        if (isStopwatchRunning && !stopwatchPaused) {
            lastUpdateTimeRef.current = performance.now();

            const updateStopwatch = () => {
                const now = performance.now();
                const elapsed = now - lastUpdateTimeRef.current;
                lastUpdateTimeRef.current = now;

                setStopwatchTime((prevTime) => prevTime + elapsed);
                stopwatchRef.current = requestAnimationFrame(updateStopwatch);
            };

            stopwatchRef.current = requestAnimationFrame(updateStopwatch);

            return () => {
                if (stopwatchRef.current) {
                    cancelAnimationFrame(stopwatchRef.current);
                }
            };
        }
    }, [isStopwatchRunning, stopwatchPaused]);

    // Timer Controls
    const startTimer = () => {
        if (timer) {
            timer.start({
                countdown: true,
                startValues: { seconds: timerSeconds },
            });
            setIsTimerRunning(true);
            setTimerPaused(false);
        }
    };

    const pauseTimer = () => {
        if (timer) {
            timer.pause();
            setTimerPaused(true);
        }
    };

    const resumeTimer = () => {
        if (timer) {
            timer.start();
            setTimerPaused(false);
        }
    };

    const resetTimer = () => {
        if (timer) {
            timer.stop();
            setTimerSeconds(120); // Reset to 2 minutes
            setIsTimerRunning(false);
            setTimerPaused(false);
        }
    };

    // Stopwatch Controls
    const startStopwatch = () => {
        setIsStopwatchRunning(true);
        setStopwatchPaused(false);
    };

    const pauseStopwatch = () => {
        setStopwatchPaused(true);
        if (stopwatchRef.current) {
            cancelAnimationFrame(stopwatchRef.current);
            pausedTimeRef.current = stopwatchTime;
        }
    };

    const resumeStopwatch = () => {
        setStopwatchPaused(false);
    };

    const resetStopwatch = () => {
        if (stopwatchRef.current) {
            cancelAnimationFrame(stopwatchRef.current);
        }
        setStopwatchTime(0);
        setIsStopwatchRunning(false);
        setStopwatchPaused(false);
    };

    // Format Timer (MM:SS)
    const formatTimerTime = (timeInSeconds: number): string => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    // Format Stopwatch (MM:SS:MS)
    const formatStopwatchTime = (timeInMs: number): string => {
        const totalSeconds = Math.floor(timeInMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((timeInMs % 1000) / 10); // Show only two digits for ms

        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-[400px] rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-around p-4">
            {/* Timer Section */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-blue-500 dark:border-blue-700 mr-4">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                    Timer
                </h3>
                <div className="text-center">
                    <div className="text-6xl font-light text-gray-800 dark:text-white mb-6">
                        {formatTimerTime(timerSeconds)}
                    </div>
                    <div className="flex justify-center space-x-4">
                        {!isTimerRunning && !timerPaused && (
                            <button
                                onClick={startTimer}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-transform transform hover:scale-105 font-medium text-sm flex items-center"
                            >
                                <FaPlay className="mr-2" /> Start
                            </button>
                        )}

                        {isTimerRunning && !timerPaused && (
                            <button
                                onClick={pauseTimer}
                                className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-transform transform hover:scale-105 font-medium text-sm flex items-center"
                            >
                                <FaPause className="mr-2" /> Pause
                            </button>
                        )}

                        {timerPaused && (
                            <button
                                onClick={resumeTimer}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-transform transform hover:scale-105 font-medium text-sm flex items-center"
                            >
                                <FaPlay className="mr-2" /> Resume
                            </button>
                        )}

                        <button
                            onClick={resetTimer}
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-transform transform hover:scale-105 font-medium text-sm flex items-center"
                        >
                            <FaRedo className="mr-2" /> Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Stopwatch Section */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-blue-500 dark:border-blue-700">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                    Stopwatch
                </h3>
                <div className="text-center">
                    <div className="text-6xl font-light text-gray-800 dark:text-white mb-6">
                        {formatStopwatchTime(stopwatchTime)}
                    </div>
                    <div className="flex justify-center space-x-4">
                        {!isStopwatchRunning && !stopwatchPaused && (
                            <button
                                onClick={startStopwatch}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-transform transform hover:scale-105 font-medium text-sm flex items-center"
                            >
                                <FaPlay className="mr-2" /> Start
                            </button>
                        )}

                        {isStopwatchRunning && !stopwatchPaused && (
                            <button
                                onClick={pauseStopwatch}
                                className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-transform transform hover:scale-105 font-medium text-sm flex items-center"
                            >
                                <FaPause className="mr-2" /> Pause
                            </button>
                        )}

                        {stopwatchPaused && (
                            <button
                                onClick={resumeStopwatch}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-transform transform hover:scale-105 font-medium text-sm flex items-center"
                            >
                                <FaPlay className="mr-2" /> Resume
                            </button>
                        )}

                        <button
                            onClick={resetStopwatch}
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-transform transform hover:scale-105 font-medium text-sm flex items-center"
                        >
                            <FaRedo className="mr-2" /> Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimerStopwatch;