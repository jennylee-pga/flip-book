import { useEffect, useState, useRef } from "react";

type Props = {
  totalPages: number;
  baseUrl: string;
};

export default function FlipBook({ totalPages, baseUrl }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedPages, setLoadedPages] = useState<number[]>([0, 1, 2]);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const BOOK_WIDTH = 800; // base design size
  const BOOK_HEIGHT = 1000; // aspect ratio (portrait)

  // 🔥 AUTO SCALE TO FIT CONTAINER
  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;

      const { offsetWidth, offsetHeight } = containerRef.current;

      const scaleX = offsetWidth / BOOK_WIDTH;
      const scaleY = (offsetHeight - 40) / BOOK_HEIGHT;

      setScale(Math.min(scaleX, scaleY));
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

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

  // swipe
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
      ref={containerRef}
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* CENTERED + SCALED BOOK */}
      <div
        style={{
          ...styles.book,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
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
                  <img
                    src={getImageUrl(i)}
                    style={styles.image}
                    loading="lazy"
                  />

                  {i === currentPage && <div style={styles.pageShadow} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* click zones */}
      <div style={styles.leftZone} onClick={prevPage} />
      <div style={styles.rightZone} onClick={nextPage} />

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

      {/* counter */}
      <div style={styles.counter}>
        {currentPage + 1} / {totalPages}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    width: "100%",
    height: "100vh", // 👈 fallback
    minHeight: "900px",
    background: "#111",
    position: "relative",
    overflow: "hidden",
  },

  book: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "800px",
    height: "1000px",
    transformOrigin: "center center",
  },

  page: {
    position: "absolute",
    width: "100%",
    height: "100%",
    transformOrigin: "left center",
    transition: "transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)",
    backfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  },

  pageInner: {
    width: "100%",
    height: "100%",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain", // 🔥 important
    background: "black",
  },

  pageShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "40px",
    height: "100%",
    background: "linear-gradient(to left, rgba(0,0,0,0.5), transparent)",
  },

  leftZone: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "30%",
    height: "100%",
    zIndex: 1000,
  },

  rightZone: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "30%",
    height: "100%",
    zIndex: 1000,
  },

  leftArrow: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "40px",
    color: "white",
    opacity: 0.6,
    zIndex: 2000,
    cursor: "pointer",
  },

  rightArrow: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "40px",
    color: "white",
    opacity: 0.6,
    zIndex: 2000,
    cursor: "pointer",
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
