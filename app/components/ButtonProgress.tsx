"use client";

import { useState } from "react";
import { Button, Progress } from "@mantine/core";
import { useInterval } from "@mantine/hooks";

interface ButtonProgressProps {
  onClick: (setFileName: (name: string) => void) => void;
  disabled: boolean;
}

export function ButtonProgress({ onClick, disabled }: ButtonProgressProps) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fileName, setFileName] = useState<string | null>(null);

  const interval = useInterval(() => {
    setProgress((current) => {
      if (current < 100) {
        return current + 5;
      }
      interval.stop();
      setLoaded(true);
      return 0;
    });
  }, 20);

  const handleClick = () => {
    if (loaded) {
      setLoaded(false);
      setProgress(0);
      setFileName(null); // ✅ Reset file name after upload
    } else {
      interval.start();
      onClick(setFileName); // ✅ Pass setFileName to update name
    }
  };

  return (
    <div className="relative w-full ">
      <Button
        fullWidth
        onClick={handleClick}
        color={loaded ? "teal" : "blue"}
        disabled={disabled}
        className="relative z-10 "
      >
        {progress !== 0
          ? "Uploading..."
          : loaded
          ? "Upload Complete"
          : "Upload File"}
      </Button>
      {progress !== 0 && (
        <Progress
          value={progress}
          className="absolute inset-0 h-full bg-opacity-30 "
          color="blue"
        />
      )}
    </div>
  );
}
