"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from './page.module.css';
import { shops, Shop } from './shop';  // Import `shops` data
import { videos, Video } from './video'; // Import `videos` data from `video.tsx'

const SHOPS_PER_PAGE = 10; // Number of shops per page

const DiscoverPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [parcels, setParcels] = useState<number>(0);
  const [merchants, setMerchants] = useState<number>(0);
  const [businesses, setBusinesses] = useState<number>(0);
  const [visibleVideos, setVisibleVideos] = useState<number>(3); // Control how many videos to show initially
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page for pagination
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // State for the selected category
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null); // State for the selected shop
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State for modal visibility

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]); // Store references to videos

  // Animate the counting up of numbers
  useEffect(() => {
    const interval = setInterval(() => {
      setParcels((prev) => (prev < 30000 ? prev + 500 : 30000));
      setMerchants((prev) => (prev < 150 ? prev + 5 : 150));
      setBusinesses((prev) => (prev < 70 ? prev + 2 : 80));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Ensure that when one video plays, the other is paused
  const handleVideoPlay = (index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause(); // Pause other videos
      }
    });
  };

  // Handle category selection from the dropdown
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSearchTerm("");  // Clear the search term when a category is selected
    setCurrentPage(1);  // Reset to the first page
  };

  // Enhanced search logic to check for matches in both category and shop name
  const filteredShops = Object.entries(shops).reduce(
    (acc, [category, shopList]) => {
      const isCategoryMatch = category.toLowerCase().includes(searchTerm.toLowerCase());
      const isSelectedCategory = selectedCategory === "" || selectedCategory === category;

      const filteredList = shopList.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
          isCategoryMatch
      );

      if ((filteredList.length > 0 || isCategoryMatch) && isSelectedCategory) {
        acc.push({ category, shops: filteredList.length > 0 ? filteredList : shopList });
      }

      return acc;
    },
    [] as { category: string; shops: Shop[] }[]
  );

  // Sort categories alphabetically for both dropdown and category display
  const sortedCategories = Object.keys(shops).sort();

  // Pagination logic for shop categories
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * SHOPS_PER_PAGE,
    currentPage * SHOPS_PER_PAGE
  );

  const filteredVideos = searchTerm ? [] : videos;

  const handleLoadMore = () => {
    setVisibleVideos((prevVisible) => prevVisible + 3); // Load 3 more videos when clicked
  };

  const handleNextPage = () => {
    if (currentPage * SHOPS_PER_PAGE < filteredShops.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Handle clicking on a shop to open the modal
  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShop(null);
  };

  // Handle clicking outside the modal content
  const handleModalClick = () => {
    closeModal();
  };

  // Prevent modal from closing when clicking inside the modal content
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.discover}>
      <div className={styles.leftSection}>
        {/* Search and Category Dropdown in a single line */}
        <div className={styles.topBar}>
          <div className={styles.dropdownContainer}>
            <select
              className={styles.categoryDropdown}
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {sortedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search for shops or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchBar}
            />
            <button className={styles.searchButton}>Search</button>
          </div>
        </div>

        {/* Shop Section with Photos */}
        <div className={styles.categories}>
          {paginatedShops.map(({ category, shops }) => (
            <div key={category} className={styles.category}>
              <h2>{category}</h2>
              <div className={styles.shopList}>
                {shops.map((shop) => (
                  <div
                    key={shop.name}
                    className={styles.shopCard}
                    onClick={() => handleShopClick(shop)} // Open modal on click
                  >
                    <img src={shop.photo} alt={shop.name} className={styles.shopPhoto} />
                    <h3>{shop.name}</h3>
                    <p>{shop.description}</p>
                    <p>{shop.location}</p>
                    <p>{shop.mobile}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className={styles.pagination}>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          <span className={styles.pageNumber}>Page {currentPage}</span>
          <button
            onClick={handleNextPage}
            disabled={currentPage * SHOPS_PER_PAGE >= filteredShops.length}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.stat}>
            <p className={styles.statValue}>
              Delivered <span className={styles.highlight}>{parcels}+</span> parcels
            </p>
          </div>
          <div className={styles.separator} />
          <div className={styles.stat}>
            <p className={styles.statValue}>
              Merchants <span className={styles.highlight}>{merchants}+</span>
            </p>
          </div>
          <div className={styles.separator} />
          <div className={styles.stat}>
            <p className={styles.statValue}>
              Discovered <span className={styles.highlight}>{businesses}+</span> businesses
            </p>
          </div>
        </div>
      </div>

      {/* Right Section for Videos */}
      <div className={styles.videoSection}>
        {/* Video Section */}
        {filteredVideos.length > 0 && (
          <div className={styles.videoContainer}>
            {filteredVideos.slice(0, visibleVideos).map((video, index) => (
              <div key={video.name} className={styles.videoColumn}>
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el; // Assign the video element reference to the ref array
                  }}
                  className={styles.reelVideo}
                  loop
                  controls
                  muted={index !== 0} // Mute the second video by default
                  onPlay={() => handleVideoPlay(index)} // Pause the other video when this one plays
                >
                  <source src={video.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <h3>{video.name}</h3>
                <p>{video.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Load More Videos Button */}
        {visibleVideos < filteredVideos.length && (
          <div className={styles.loadMoreContainer}>
            <button onClick={handleLoadMore} className={styles.loadMoreButton}>
              Load More Videos
            </button>
          </div>
        )}

        {/* More Videos Redirect Button */}
        <div className={styles.moreVideosContainer}>
          <button onClick={() => window.open("https://www.instagram.com/mateng.discovery/", "_blank")} className={styles.moreVideosButton}>
            More Videos
          </button>
        </div>
      </div>

      {/* Modal for Shop Details */}
      {isModalOpen && selectedShop && (
        <div className={styles.modal} onClick={handleModalClick}>
          <div className={styles.modalContent} onClick={handleModalContentClick}>
            <span className={styles.closeButton} onClick={closeModal}>
              &times;
            </span>
            <img src={selectedShop.photo} alt={selectedShop.name} className={styles.shopPhoto} />
            <h2>{selectedShop.name}</h2>
            <p>{selectedShop.description}</p>
            <p>Location: {selectedShop.location}</p>
            <p>Contact: {selectedShop.mobile}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
