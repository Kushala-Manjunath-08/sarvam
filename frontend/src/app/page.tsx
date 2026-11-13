"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    region: "Karnataka",
    places: "Bengaluru, Mysuru, Hampi",
    note: "A thousand ways to belong.",
    image: "/images/karnataka-heritage.svg",
    imageAlt: "An original illustration of a carved Karnataka palace in warm stone",
    keepsakes: ["Channapatna toys", "Yakshagana", "Bisi bele bath", "Ilkal saree"],
    index: "01",
  },
  {
    region: "Yakshagana",
    places: "The coast, after dusk",
    note: "Where stories take the stage.",
    image: "/images/yakshagana-stage.svg",
    imageAlt: "An original illustration of a Yakshagana performer beneath a gold stage halo",
    keepsakes: ["Drums at twilight", "Painted faces", "Stories retold", "Coastal Karnataka"],
    index: "02",
  },
  {
    region: "Mysuru",
    places: "Palace lights, silk lanes",
    note: "An evening dressed in gold.",
    image: "/images/mysore-palace.svg",
    imageAlt: "An original illustration of Mysore Palace glowing at dusk",
    keepsakes: ["Dasara procession", "Mysore silk", "Sandalwood craft", "Chamundi hills"],
    index: "03",
  },
  {
    region: "Hampi",
    places: "Stone chariots, river bends",
    note: "Old stones, still singing.",
    image: "/images/hampi-ruins.svg",
    imageAlt: "An original illustration of Hampi's stone temple and boulder landscape",
    keepsakes: ["Vijayanagara ruins", "Hampi Bazaar", "Tungabhadra", "Lotus Mahal"],
    index: "04",
  },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (document.visibilityState === "visible" && !prefersReducedMotion) {
        setActiveSlide((current) => (current + 1) % slides.length);
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  function showSlide(direction: number) {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <main className="landing-page" id="home">
      <div
        className="carousel-window"
        role="region"
        aria-roledescription="carousel"
        aria-label="Stories from Karnataka"
      >
        <div
          className="carousel-track"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${activeSlide * (100 / slides.length)}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <section
              className="story-slide"
              style={{ flex: `0 0 ${100 / slides.length}%` }}
              key={slide.region}
              aria-label={`${slide.region} story`}
              aria-roledescription="slide"
              aria-hidden={activeSlide !== index}
              inert={activeSlide !== index}
            >
              <div className="story-panel">
                <header className="masthead">
                  <a className="wordmark" href="#home" aria-label="Sarvam home">
                    <span className="wordmark-seal" aria-hidden="true">
                      S
                    </span>
                    <span className="wordmark-type">
                      <strong>SARVAM</strong>
                      <small>A LIVING ATLAS</small>
                    </span>
                  </a>
                  <span className="edition-label">FIELD NOTES&nbsp; / &nbsp;SOUTH INDIA</span>
                </header>

                <div className="story-content">
                  <p className="eyebrow">
                    <span className="eyebrow-rule" />
                    A place to begin
                  </p>
                  <h1>{slide.region}</h1>
                  <p className="place-names">{slide.places}</p>
                  <p className="story-note">{slide.note}</p>

                  <div className="photo-collage" aria-label="A glimpse of local tradition">
                    <div className="postcard postcard-back">
                      <Image
                        src={slides[(index + 1) % slides.length].image}
                        alt=""
                        fill
                        sizes="120px"
                      />
                    </div>
                    <div className="postcard postcard-front">
                      <Image src={slide.image} alt={slide.imageAlt} fill sizes="160px" />
                    </div>
                    <span className="collage-stamp" aria-hidden="true">
                      S
                    </span>
                  </div>

                  <div className="keepsakes-block">
                    <p className="keepsakes-heading">Little things, held close</p>
                    <ul className="keepsakes-list">
                      {slide.keepsakes.map((keepsake) => (
                        <li key={keepsake}>{keepsake}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <footer className="panel-footer">
                  <span className="footer-caption">A journey through living heritage</span>
                  <div className="carousel-controls" aria-label="Story navigation">
                    <button
                      className="arrow-button"
                      type="button"
                      onClick={() => showSlide(-1)}
                      aria-label="Previous story"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 12H5m0 0 7-7m-7 7 7 7" />
                      </svg>
                    </button>
                    <div className="slide-count" aria-live="polite">
                      <span>{slide.index}</span>
                      <span className="count-divider">/</span>
                      <span>{String(slides.length).padStart(2, "0")}</span>
                    </div>
                    <button
                      className="arrow-button arrow-button-next"
                      type="button"
                      onClick={() => showSlide(1)}
                      aria-label="Next story"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12h14m0 0-7-7m7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </footer>
              </div>

              <div className="image-panel">
                <Image
                  className="feature-image"
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 760px) 100vw, 48vw"
                />
                <div className="image-wash" />
                <div className="image-caption">
                  <span className="caption-index">
                    {slide.index}&nbsp; / &nbsp;{String(slides.length).padStart(2, "0")}
                  </span>
                  <span className="caption-rule" />
                  <span>Tradition, still in motion</span>
                </div>
                <div className="image-seal" aria-hidden="true">
                  <span>ROOTED IN</span>
                  <strong>India</strong>
                  <span className="seal-star" />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className="support-footer" id="support">
        <div className="support-footer-inner">
          <div className="support-intro">
            <p className="support-kicker">SARVAM&nbsp; / &nbsp;HERE TO HELP</p>
            <h2 id="support-title">Help &amp; support</h2>
            <p className="support-description">
              A few quick answers to help you find your way around the atlas.
            </p>
          </div>

          <div className="support-questions" aria-labelledby="support-title">
            <details>
              <summary>How do I explore Karnataka's districts?</summary>
              <p>
                Choose the search icon to browse district cards, search for a place or
                tradition, and open a card to learn more.
              </p>
            </details>
            <details>
              <summary>How do I move between stories?</summary>
              <p>
                Stories advance automatically every five seconds. Use the round arrows at
                the bottom of the story panel to move between them; the counter shows
                which story you are viewing.
              </p>
            </details>
            <details>
              <summary>Can I reduce the slide motion?</summary>
              <p>
                Turn on Reduce Motion in your device accessibility settings to pause
                automatic slide changes and minimize animation.
              </p>
            </details>
            <details>
              <summary>Is this a live travel guide?</summary>
              <p>
                This page introduces cultural stories. Check official local sources for
                current opening times, access and travel information.
              </p>
            </details>
          </div>

          <div className="support-footer-bottom">
            <a href="#home" className="support-wordmark">
              SARVAM <span>A LIVING ATLAS</span>
            </a>
            <a href="#home" className="back-to-stories">
              Back to stories <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
