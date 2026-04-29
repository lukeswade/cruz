#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

echo "Downloading video 3 from Unbounce..."
yt-dlp "https://share.unbounce.com/4guqRb4m" -o "assets/video3_orig.mp4" || curl -L "https://share.unbounce.com/4guqRb4m" | grep -oE "https://[^\"]+\.mp4" | head -n 1 | xargs -I {} curl -L "{}" -o assets/video3.mp4

# if yt-dlp succeeded, it saved to assets/video3_orig.mp4, move to video3.mp4
if [ -f "assets/video3_orig.mp4" ]; then
    mv assets/video3_orig.mp4 assets/video3.mp4
fi

echo "Downloading video 7 from YouTube..."
yt-dlp "https://youtu.be/YUbmY5HEHDc" -o "assets/video7_orig.mp4"

echo "Downloading Baiana by Bakermat..."
yt-dlp "ytsearch1:Baiana Bakermat" -x --audio-format mp3 -o "assets/baiana.mp3"

echo "Overlaying audio on video 7..."
if [ -f "assets/video7_orig.mp4" ] && [ -f "assets/baiana.mp3" ]; then
    ffmpeg -y -i assets/video7_orig.mp4 -i assets/baiana.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest assets/video7.mp4
    echo "Cleaning up..."
    rm assets/video7_orig.mp4 assets/baiana.mp3
else
    echo "Failed to download Video 7 or Audio."
fi

echo "Done!"
