"use client";

const particles = [
  { left: "7%", top: "18%", size: 7, delay: "0s", duration: "8s" },
  { left: "16%", top: "72%", size: 5, delay: "1s", duration: "9s" },
  { left: "26%", top: "28%", size: 6, delay: "0.4s", duration: "7.5s" },
  { left: "34%", top: "82%", size: 4, delay: "1.8s", duration: "8.8s" },
  { left: "45%", top: "16%", size: 6, delay: "0.9s", duration: "9.5s" },
  { left: "52%", top: "58%", size: 8, delay: "1.4s", duration: "8.2s" },
  { left: "63%", top: "25%", size: 5, delay: "0.2s", duration: "7.8s" },
  { left: "72%", top: "70%", size: 7, delay: "1.2s", duration: "9.2s" },
  { left: "83%", top: "34%", size: 5, delay: "0.7s", duration: "8.6s" },
  { left: "92%", top: "55%", size: 6, delay: "1.6s", duration: "9s" },
];

export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Barrido diagonal sutil */}
      <div className="hero-scan absolute -left-[40%] top-0 h-full w-[35%] rotate-12 bg-gradient-to-r from-transparent via-[#D71920]/10 to-transparent" />

      {/* Líneas animadas tipo red */}
      <svg
        viewBox="0 0 1600 900"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#D71920" strokeWidth="1.4" strokeLinecap="round">
          <path
            className="network-line network-line-1"
            d="M110 210 C240 160 330 255 455 215 S690 175 805 250 S1010 345 1160 285 S1375 180 1510 240"
          />

          <path
            className="network-line network-line-2"
            d="M70 650 C210 610 280 520 415 565 S620 735 780 650 S1020 520 1170 590 S1360 740 1540 665"
          />

          <path
            className="network-line network-line-3"
            d="M220 95 C340 175 440 110 550 160 S760 280 920 210 S1160 95 1340 155"
          />

          <path
            className="network-line network-line-4"
            d="M290 820 C420 730 510 780 650 735 S850 650 1020 700 S1250 830 1460 760"
          />
        </g>

        {/* Nodos sobre las líneas */}
        <g fill="#D71920">
          <circle className="pulse-node" cx="455" cy="215" r="4" />
          <circle className="pulse-node delay-1" cx="805" cy="250" r="5" />
          <circle className="pulse-node delay-2" cx="1160" cy="285" r="4" />

          <circle className="pulse-node delay-2" cx="415" cy="565" r="4" />
          <circle className="pulse-node delay-1" cx="780" cy="650" r="5" />
          <circle className="pulse-node" cx="1170" cy="590" r="4" />

          <circle className="pulse-node delay-1" cx="550" cy="160" r="4" />
          <circle className="pulse-node delay-2" cx="920" cy="210" r="5" />

          <circle className="pulse-node" cx="650" cy="735" r="4" />
          <circle className="pulse-node delay-1" cx="1020" cy="700" r="5" />
        </g>
      </svg>

      {/* Partículas flotantes */}
      {particles.map((particle, index) => (
        <span
          key={index}
          className="hero-particle absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      {/* Orbes muy sutiles */}
      <span className="hero-orb hero-orb-1" />
      <span className="hero-orb hero-orb-2" />

      <style jsx>{`
        .hero-particle {
          background: #d71920;
          box-shadow:
            0 0 0 6px rgba(215, 25, 32, 0.06),
            0 0 22px rgba(215, 25, 32, 0.28);
          opacity: 0.55;
          animation-name: particleFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes particleFloat {
          0% {
            transform: translate3d(0, 0, 0) scale(0.85);
            opacity: 0.2;
          }
          25% {
            opacity: 0.65;
          }
          50% {
            transform: translate3d(26px, -22px, 0) scale(1.15);
            opacity: 0.9;
          }
          75% {
            opacity: 0.45;
          }
          100% {
            transform: translate3d(-18px, 18px, 0) scale(0.9);
            opacity: 0.2;
          }
        }

        .network-line {
          stroke-dasharray: 18 22;
          opacity: 0.22;
          filter: drop-shadow(0 0 4px rgba(215, 25, 32, 0.12));
          animation-name: lineMove, lineGlow;
          animation-timing-function: linear, ease-in-out;
          animation-iteration-count: infinite, infinite;
        }

        .network-line-1 {
          animation-duration: 11s, 4.8s;
        }

        .network-line-2 {
          animation-duration: 13s, 5.5s;
        }

        .network-line-3 {
          animation-duration: 9s, 4.2s;
        }

        .network-line-4 {
          animation-duration: 12s, 5.2s;
        }

        @keyframes lineMove {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -260;
          }
        }

        @keyframes lineGlow {
          0%,
          100% {
            opacity: 0.12;
          }
          50% {
            opacity: 0.42;
          }
        }

        .pulse-node {
          opacity: 0.5;
          transform-origin: center;
          animation: nodePulse 3s ease-in-out infinite;
          filter: drop-shadow(0 0 6px rgba(215, 25, 32, 0.35));
        }

        .delay-1 {
          animation-delay: 0.8s;
        }

        .delay-2 {
          animation-delay: 1.6s;
        }

        @keyframes nodePulse {
          0%,
          100% {
            opacity: 0.25;
            r: 3;
          }
          50% {
            opacity: 0.85;
            r: 6;
          }
        }

        .hero-scan {
          animation: scanMove 7s ease-in-out infinite;
        }

        @keyframes scanMove {
          0% {
            transform: translateX(0) rotate(12deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          55% {
            opacity: 0.55;
          }
          100% {
            transform: translateX(420%) rotate(12deg);
            opacity: 0;
          }
        }

        .hero-orb {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          border: 1px solid rgba(215, 25, 32, 0.08);
          opacity: 0.35;
          animation: orbFloat 10s ease-in-out infinite;
        }

        .hero-orb-1 {
          left: 34%;
          top: 22%;
        }

        .hero-orb-2 {
          right: 22%;
          bottom: 12%;
          width: 190px;
          height: 190px;
          animation-delay: 2s;
        }

        @keyframes orbFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(18px, -20px, 0) scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}