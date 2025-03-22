/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from "react";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import { useTimer } from "@/app/context/TimerContext";

const TimerStopwatch = () => {
    const {
        timerTime,
        timeLeft,
        timerPaused,
        isTimerRunning,
        stopwatchTime,
        stopwatchPaused,
        isStopwatchRunning,
        timer,
        setTimerTime,
        setTimeLeft,
        setTimerPaused,
        setIsTimerRunning,
        setStopwatchTime,
        setStopwatchPaused,
        setIsStopwatchRunning,
    } = useTimer();

    const stopwatchRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);

    // Stopwatch Logic
    useEffect(() => {
        if (isStopwatchRunning && !stopwatchPaused) {
            lastUpdateTimeRef.current = performance.now();
            const updateStopwatch = () => {
                const now = performance.now();
                const elapsed = now - lastUpdateTimeRef.current;
                setStopwatchTime((prevTime: number) => prevTime + elapsed); // Added type annotation
                lastUpdateTimeRef.current = now;
                stopwatchRef.current = requestAnimationFrame(updateStopwatch);
            };
            stopwatchRef.current = requestAnimationFrame(updateStopwatch);
            return () => {
                if (stopwatchRef.current) {
                    cancelAnimationFrame(stopwatchRef.current);
                }
            };
        }
    }, [isStopwatchRunning, stopwatchPaused, setStopwatchTime]);

    // Timer Controls
    const startTimer = () => {
        if (timer) {
            timer.start({ countdown: true, startValues: { seconds: timeLeft } });
            setIsTimerRunning(true);
            setTimerPaused(false);
        }
    };

    const pauseTimer = () => timer && (timer.pause(), setTimerPaused(true));
    const resumeTimer = () => timer && (timer.start(), setTimerPaused(false));
    const resetTimer = () => {
        if (timer) {
            timer.stop();
            setTimerTime("00:02:00");
            setTimeLeft(120);
            setIsTimerRunning(false);
            setTimerPaused(false);
        }
    };

    // Stopwatch Controls
    const startStopwatch = () => setIsStopwatchRunning(true);
    const pauseStopwatch = () => setStopwatchPaused(true);
    const resumeStopwatch = () => setStopwatchPaused(false);
    const resetStopwatch = () => (stopwatchRef.current && cancelAnimationFrame(stopwatchRef.current), setStopwatchTime(0));

    // Handle Timer Time Input
    const handleTimerTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,2}:\d{0,2}:\d{0,2}$/.test(value)) {
            setTimerTime(value);
            const [hours, minutes, seconds] = value.split(":").map(Number);
            setTimeLeft((hours * 3600) + (minutes * 60) + (seconds || 0));
        }
    };

    // Format Time Helpers
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatStopwatchTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col md:flex-row justify-around p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-lg shadow-lg">
            {/* Timer Section */}
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center mb-6 md:mb-0 transform transition-transform hover:scale-105">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Timer</h3>
                <input
                    type="text"
                    value={timerTime}
                    onChange={handleTimerTimeChange}
                    placeholder="HH:MM:SS"
                    className="w-48 text-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl text-gray-600 font-sans mb-4"
                    disabled={isTimerRunning}
                />
                <div className="text-5xl font-sans text-gray-700 dark:text-gray-300 mb-6">
                    {formatTime(timeLeft)}
                </div>
                <div className="space-x-3">
                    {!isTimerRunning && !timerPaused && (
                        <button
                            onClick={startTimer}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-110"
                        >
                            <FaPlay />
                        </button>
                    )}
                    {isTimerRunning && !timerPaused && (
                        <button
                            onClick={pauseTimer}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-110"
                        >
                            <FaPause />
                        </button>
                    )}
                    {timerPaused && (
                        <button
                            onClick={resumeTimer}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-110"
                        >
                            <FaPlay />
                        </button>
                    )}
                    <button
                        onClick={resetTimer}
                        className="bg-gray-400 hover:bg-gray-500 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-110"
                    >
                        <FaRedo />
                    </button>
                </div>
            </div>

            {/* Stopwatch Section */}
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center transform transition-transform hover:scale-105">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Stopwatch</h3>
                <div className="text-5xl font-sans text-gray-700 dark:text-gray-300 mb-6">
                    {formatStopwatchTime(stopwatchTime)}
                </div>
                <div className="space-x-3">
                    {!isStopwatchRunning && !stopwatchPaused && (
                        <button
                            onClick={startStopwatch}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-110"
                        >
                            <FaPlay />
                        </button>
                    )}
                    {isStopwatchRunning && !stopwatchPaused && (
                        <button
                            onClick={pauseStopwatch}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-110"
                        >
                            <FaPause />
                        </button>
                    )}
                    {stopwatchPaused && (
                        <button
                            onClick={resumeStopwatch}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-110"
                        >
                            <FaPlay />
                        </button>
                    )}
                    <button
                        onClick={resetStopwatch}
                        className="bg-gray-400 hover:bg-gray-500 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-110"
                    >
                        <FaRedo />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimerStopwatch;