export default function LogoText() {
  return (
    <svg
      width="188"
      height="61"
      viewBox="0 0 188 61"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, width: '187.771px', height: '61px' }} // 필요하면 스타일 추가
    >
      <g filter="url(#filter0_d_245_2848)">
        <path
          d="M22.0526 6.45787H42.0661V11.8824H46.0193V19.1783H42.9925C42.9925 19.1783 48.7984 24.0562 42.9925 28.6865C42.9925 28.6865 40.6444 30.23 37.8042 29.9824H46.4535V37.9471H39.3513C39.3513 37.9471 44.4721 39.9858 44.6908 44.6772C44.6908 44.6772 45.8359 51.2239 39.6601 53.3236C39.6601 53.3236 31.1362 56.5359 23.2298 52.5197C23.2298 52.5197 17.485 49.9281 19.5855 43.4456C19.5855 43.4456 20.0808 40.0436 24.2173 38.3105H17.7295V30.23H26.3145C26.3145 30.23 21.6183 29.6737 20.0744 26.9566C20.0744 26.9566 17.1087 22.7572 21.3707 18.7442H18.0383V11.8792H21.9915L22.0526 6.45465V6.45787Z"
          fill="#E6F9FF"
        />
        {/* 나머지 path, linearGradient, filter 등도 모두 같은 방식으로 JSX에 복사 */}
      </g>

      {/* linearGradient, filter 등 defs 안에 내용도 그대로 넣어주세요 */}
      <defs>
        <filter
          id="filter0_d_245_2848"
          x="17.7295"
          y="6.45465"
          width="151.015"
          height="51.0852"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="2" dy="2" />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0559032 0 0 0 0 0.0552684 0 0 0 0 0.128906 0 0 0 0.7 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_245_2848" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_245_2848" result="shape" />
        </filter>

        <linearGradient
          id="paint0_linear_245_2848"
          x1="32.024"
          y1="8.02379"
          x2="32.024"
          y2="52.9731"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#009BC1" />
          <stop offset="0.61" stopColor="#020079" />
        </linearGradient>

        {/* 나머지 linearGradient 도 마찬가지 */}
      </defs>
    </svg>
  );
}
