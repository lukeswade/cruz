#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

echo "Downloading Baiana by Bakermat..."
yt-dlp "ytsearch1:Baiana Bakermat" -x --audio-format mp3 -o "assets/baiana.mp3"

if [ -f "assets/baiana.mp3" ]; then
    echo "Overlaying audio on video 7..."
    ffmpeg -y -i assets/video7.mp4 -ss 00:00:45 -i assets/baiana.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest assets/video7_new.mp4
    mv assets/video7_new.mp4 assets/video7.mp4

    echo "Overlaying audio on video 3..."
    ffmpeg -y -i assets/video3.mp4 -ss 00:00:45 -i assets/baiana.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest assets/video3_new.mp4
    mv assets/video3_new.mp4 assets/video3.mp4

    echo "Cleaning up..."
    rm assets/baiana.mp3
else
    echo "Failed to download Audio."
fi

echo "Done!"
