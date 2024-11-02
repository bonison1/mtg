"use client";
import React from "react";
import styles from './video.module.css';  // Ensure CSS is imported correctly

// Define the Video type if needed here or import it
export type Video = {
  name: string;
  src: string;
  description: string;
};

// Export predefined video data
export const videos: Video[] = [
  {
    name: "Beautiful Blossoms",
    src: "/videos/175.mp4",
    description: "A vibrant collection of blooming flowers.",
  },
  {
    name: "Dancing Colors",
    src: "/videos/nachom.mp4",
    description: "An artistic video showcasing the vivid colors of nature.",
  },
  {
    name: "DIY Products",
    src: "/videos/arjay.mp4",
    description: "DIY Products overview video.",
  },
];

// Main Video Component
export default function VideoGallery() {
  const handleMoreVideos = () => {
    window.open("https://www.instagram.com/mateng.discovery/", "_blank");
  };

  return (
    <div className={styles.videoGallery}>
      <h1 className={styles.heading}>Video Gallery</h1>
      <div className={styles.videos}>
        {videos.map((video, index) => (
          <div key={index} className={styles.videoItem}>
            <h2 className={styles.videoTitle}>{video.name}</h2>
            <video className={styles.videoPlayer} controls>
              <source src={video.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className={styles.videoDescription}>{video.description}</p>
          </div>
        ))}
      </div>
      
      {/* Button for More Videos */}
      <div className={styles.buttonContainer}>
        <button
          onClick={handleMoreVideos}
          className={styles.moreVideosButton}  // Button styling from CSS
        >
          More Videos
        </button>
      </div>
    </div>
  );
}
