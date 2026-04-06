import { useEffect, useState, useRef } from "react";

type Props = {
  totalPages: number;
  baseUrl: string;
};

export default function FlipBook({ totalPages, baseUrl }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedPages, setLoadedPages] = useState<number[]>([0, 1, 2]);
  const startX = useRef(0);

  // preload nearby pages
  useEffect(() => {
    const range = [];
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
      if (i >= 0 && i < totalPages) range.push(i);
    }
    setLoadedPages(range);
  }, [currentPage, totalPages]);

  const getImageUrl = (i: number) => `${baseUrl}${i + 1}.png`;

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  // swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextPage();
    if (diff < -50) prevPage();
  };

  return (
    <div
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {Array.from({ length: totalPages }).map((_, i) => {
        const isFlipped = i < currentPage;

        return (
          <div
            key={i}
            style={{
              ...styles.page,
              zIndex: totalPages - i,
              transform: isFlipped ? "rotateY(-180deg)" : "rotateY(0deg)",
            }}
          >
            {loadedPages.includes(i) && (
              <div style={styles.pageInner}>
                <img src={getImageUrl(i)} style={styles.image} loading="lazy" />
                {/* shadow on active flipping page */}
                {i === currentPage && <div style={styles.pageShadow} />}
              </div>
            )}
          </div>
        );
      })}

      {/* tap zones */}
      <div style={styles.leftZone} onClick={prevPage} />
      <div style={styles.rightZone} onClick={nextPage} />

      {/* hint overlays */}
      {currentPage > 0 && <div style={styles.hintLeft} />}
      {currentPage < totalPages - 1 && <div style={styles.hintRight} />}

      {/* arrows */}
      {currentPage > 0 && (
        <div style={styles.leftArrow} onClick={prevPage}>
          ‹
        </div>
      )}

      {currentPage < totalPages - 1 && (
        <div style={styles.rightArrow} onClick={nextPage}>
          ›
        </div>
      )}

      {/* page indicator */}
      <div style={styles.counter}>
        {currentPage + 1} / {totalPages}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    width: "100vw",
    height: "100vh",
    background: "#111",
    position: "relative",
    perspective: "2000px",
    overflow: "hidden",
  },

  page: {
    position: "absolute",
    width: "100%",
    height: "100%",
    transformOrigin: "left center",
    transition: "transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1)",
    backfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  },

  pageInner: {
    width: "100%",
    height: "100%",
    position: "relative",
  },

  pageShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "30px",
    height: "100%",
    background: "linear-gradient(to left, rgba(0,0,0,0.4), transparent)",
    pointerEvents: "none",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    background: "black",
  },

  leftZone: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "30%",
    height: "100%",
    zIndex: 900,
  },

  rightZone: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "30%",
    height: "100%",
    zIndex: 900,
  },

  hintLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "20%",
    height: "100%",
    background:
      "linear-gradient(to right, rgba(255,255,255,0.05), transparent)",
    pointerEvents: "none",
  },

  hintRight: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "20%",
    height: "100%",
    background: "linear-gradient(to left, rgba(255,255,255,0.05), transparent)",
    pointerEvents: "none",
  },

  leftArrow: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "40px",
    color: "white",
    opacity: 0.6,
    zIndex: 1000,
    cursor: "pointer",
    animation: "pulse 1.5s infinite",
  },

  rightArrow: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "40px",
    color: "white",
    opacity: 0.6,
    zIndex: 1000,
    cursor: "pointer",
    animation: "pulse 1.5s infinite",
  },

  counter: {
    position: "absolute",
    bottom: 15,
    width: "100%",
    textAlign: "center",
    color: "white",
    fontSize: 14,
    opacity: 0.7,
  },
};
