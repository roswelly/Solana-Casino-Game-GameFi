import React from 'react';

interface IconProps {
  className?: string;
  fill?: string;
  size?: number;
  height?: number;
  marginLeft?: number;
  margin?: number;
  icon: string;
}

export const Icon = ({ className, fill, size, height, icon, marginLeft, margin }: IconProps) => (
  <div
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      color: fill,
      width: size || 16,
      height: height || size || 16,
      marginLeft: marginLeft || 0,
      marginRight: margin || 0
    }}
  >
    {icons[icon]}
  </div>
);

const icons = {
  Back: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.55844 9.1117L14.4623 9.1117C14.9507 9.1117 15.3455 9.5065 15.3455 9.99481C15.3455 10.4831 14.9507 10.8779 14.4623 10.8779L5.54805 10.8779C5.05974 10.8779 4.66494 10.4831 4.66494 9.99481C4.66494 9.5065 5.07013 9.1117 5.55844 9.1117Z"
        fill="currentColor"
      />
      <path
        d="M8.52988 6.14016C8.75845 6.14016 8.98702 6.22328 9.15326 6.3999C9.49611 6.74276 9.49611 7.3038 9.15326 7.65704L6.80521 10.0051L9.15326 12.3531C9.49611 12.696 9.49611 13.257 9.15326 13.6103C8.8104 13.9531 8.24936 13.9531 7.89611 13.6103L4.92469 10.6389C4.58183 10.296 4.58183 9.73497 4.92469 9.38172L7.89611 6.41029C8.07274 6.23367 8.30131 6.14016 8.52988 6.14016Z"
        fill="currentColor"
      />
      <path
        d="M10.0052 1.86265e-08C15.5221 1.86265e-08 20.0104 4.48831 20.0104 9.9948C20.0104 15.5117 15.5221 20 10.0052 20C4.4883 20 -1.56843e-05 15.5117 -1.56843e-05 9.9948C0.0103739 4.48831 4.49869 1.86264e-08 10.0052 1.86265e-08ZM10.0052 18.2234C14.5454 18.2234 18.2338 14.5351 18.2338 9.9948C18.2338 5.45455 14.5454 1.76623 10.0052 1.76623C5.46492 1.76623 1.77661 5.45455 1.77661 9.9948C1.787 14.5351 5.47531 18.2234 10.0052 18.2234Z"
        fill="currentColor"
      />
    </svg>
  ),
  LeftArr: (
    <svg viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line
        x1="0.75"
        y1="-0.75"
        x2="7.65232"
        y2="-0.75"
        transform="matrix(-0.712358 0.701816 -0.709083 -0.705125 6.91455 0.457031)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="0.75"
        y1="-0.75"
        x2="7.81536"
        y2="-0.75"
        transform="matrix(-0.718058 -0.695983 0.703523 -0.710672 7.89404 11.5767)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  RightArr: (
    <svg viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line
        x1="0.75"
        y1="-0.75"
        x2="7.64532"
        y2="-0.75"
        transform="matrix(0.712358 -0.701816 0.709083 0.705125 1.24463 12.5967)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="0.75"
        y1="-0.75"
        x2="7.80841"
        y2="-0.75"
        transform="matrix(0.718641 0.695381 -0.704118 0.710083 0.265625 1.49463)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Dropdown: (
    <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line
        x1="1.41415"
        y1="1.25378"
        x2="7.61406"
        y2="7.48262"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="14.3672"
        y1="1.41414"
        x2="8.07151"
        y2="7.84132"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
} as { [key: string]: JSX.Element };

export default Icon;
