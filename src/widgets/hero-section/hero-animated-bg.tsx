export function HeroAnimatedBg() {
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden opacity-20 dark:opacity-15">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="heroGrad1" cx="50%" cy="50%" fx="10%" fy="50%" r=".5">
            <animate attributeName="fx" dur="34s" values="0%;3%;0%" repeatCount="indefinite" />
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heroGrad2" cx="50%" cy="50%" fx="10%" fy="50%" r=".5">
            <animate attributeName="fx" dur="23.5s" values="0%;3%;0%" repeatCount="indefinite" />
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heroGrad3" cx="50%" cy="50%" fx="50%" fy="50%" r=".5">
            <animate attributeName="fx" dur="21.5s" values="0%;3%;0%" repeatCount="indefinite" />
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#heroGrad1)">
          <animate attributeName="x" dur="20s" values="25%;0%;25%" repeatCount="indefinite" />
          <animate attributeName="y" dur="21s" values="0%;25%;0%" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="17s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#heroGrad2)">
          <animate attributeName="x" dur="23s" values="-25%;0%;-25%" repeatCount="indefinite" />
          <animate attributeName="y" dur="24s" values="0%;50%;0%" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="18s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#heroGrad3)">
          <animate attributeName="x" dur="25s" values="0%;25%;0%" repeatCount="indefinite" />
          <animate attributeName="y" dur="26s" values="0%;25%;0%" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 50 50"
            to="0 50 50"
            dur="19s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </div>
  )
}
