/* ── ViralBoard SVG Logo Icon ── */
export const ViralBoardIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="vbg" x1="0" y1="0" x2="26" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff3535" />
        <stop offset="100%" stopColor="#c0180c" />
      </linearGradient>
    </defs>
    <rect width="26" height="26" rx="7" fill="url(#vbg)" />
    <rect x="4.5" y="17" width="4" height="5"  rx="1.2" fill="white" fillOpacity="0.75" />
    <rect x="11"  y="12" width="4" height="10" rx="1.2" fill="white" fillOpacity="0.88" />
    <rect x="17.5" y="7" width="4" height="15" rx="1.2" fill="white" />
    <polyline
      points="6.5,16.5 13,11.5 19.5,6.5"
      stroke="white"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.5"
    />
    <polyline
      points="17.5,6.5 19.5,6.5 19.5,8.5"
      stroke="white"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.5"
    />
  </svg>
);
