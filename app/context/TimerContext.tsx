"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Timer } from 'easytimer.js';

interface TimerContextType {
    timerTime: string;
    timeLeft: number;
    timerPaused: boolean;
    isTimerRunning: boolean;
    stopwatchTime: number;
    stopwatchPaused: boolean;
    isStopwatchRunning: boolean;
    timer: Timer | null;
    setTimerTime: (time: string) => void;
    setTimeLeft: (time: number) => void;
    setTimerPaused: (paused: boolean) => void;
    setIsTimerRunning: (running: boolean) => void;
    setStopwatchTime: React.Dispatch<React.SetStateAction<number>>; // Updated this line
    setStopwatchPaused: (paused: boolean) => void;
    setIsStopwatchRunning: (running: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
    const [timerTime, setTimerTime] = useState(() => 
        typeof window !== 'undefined' ? localStorage.getItem('timerTime') || "00:02:00" : "00:02:00"
    );
    const [timeLeft, setTimeLeft] = useState(() => 
        typeof window !== 'undefined' ? Number(localStorage.getItem('timeLeft')) || 120 : 120
    );
    const [timerPaused, setTimerPaused] = useState(() => 
        typeof window !== 'undefined' ? localStorage.getItem('timerPaused') === 'true' : false
    );
    const [isTimerRunning, setIsTimerRunning] = useState(() => 
        typeof window !== 'undefined' ? localStorage.getItem('isTimerRunning') === 'true' : false
    );
    const [stopwatchTime, setStopwatchTime] = useState(() => 
        typeof window !== 'undefined' ? Number(localStorage.getItem('stopwatchTime')) || 0 : 0
    );
    const [stopwatchPaused, setStopwatchPaused] = useState(() => 
        typeof window !== 'undefined' ? localStorage.getItem('stopwatchPaused') === 'true' : false
    );
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(() => 
        typeof window !== 'undefined' ? localStorage.getItem('isStopwatchRunning') === 'true' : false
    );
    const [timer, setTimer] = useState<Timer | null>(null);

    useEffect(() => {
        const timerInstance = new Timer();
        timerInstance.addEventListener("secondsUpdated", () => {
            const totalSeconds = timerInstance.getTotalTimeValues().seconds;
            setTimeLeft(totalSeconds);
        });
        timerInstance.addEventListener("targetAchieved", () => {
            setIsTimerRunning(false);
            setTimerPaused(false);
            alert("Timer finished!");
        });
        setTimer(timerInstance);
        return () => timerInstance.stop();
    }, []);

    // Persist state changes to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('timerTime', timerTime);
            localStorage.setItem('timeLeft', timeLeft.toString());
            localStorage.setItem('timerPaused', timerPaused.toString());
            localStorage.setItem('isTimerRunning', isTimerRunning.toString());
            localStorage.setItem('stopwatchTime', stopwatchTime.toString());
            localStorage.setItem('stopwatchPaused', stopwatchPaused.toString());
            localStorage.setItem('isStopwatchRunning', isStopwatchRunning.toString());
        }
    }, [timerTime, timeLeft, timerPaused, isTimerRunning, stopwatchTime, stopwatchPaused, isStopwatchRunning]);

    return (
        <TimerContext.Provider value={{
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
        }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
};
