import type { District } from "../districts";

type Props = {
  district: District;
  index: number;
};

export default function DistrictIllustration({ district, index }: Props) {
  const hue = (index * 47 + 22) % 360;
  const sky = `hsl(${hue} 45% 72%)`;
  const distant = `hsl(${(hue + 36) % 360} 38% 48%)`;
  const foreground = `hsl(${(hue + 74) % 360} 39% 31%)`;
  const accent = `hsl(${(hue + 170) % 360} 63% 46%)`;
  const light = `hsl(${(hue + 18) % 360} 64% 84%)`;
  const sunX = 75 + ((index * 83) % 450);
  const hillPeak = 132 + ((index * 31) % 85);
  const shift = (index % 5) * 8 - 16;

  let landmark;
  switch (district.scene) {
    case "weaving":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M206 78v226M394 78v226M196 90h208M196 296h208" fill="none" stroke={foreground} strokeWidth="13" />
          <rect x="226" y="132" width="148" height="144" rx="4" fill={accent} />
          <path d="M226 156h148M226 183h148M226 210h148M226 237h148M250 132v144M278 132v144M306 132v144M334 132v144M362 132v144" fill="none" stroke={light} strokeWidth="5" opacity=".8" />
          <path d="m226 144 24 24 28-24 28 24 28-24 28 24 12-12M226 224l24 24 28-24 28 24 28-24 28 24 12-12" fill="none" stroke={foreground} strokeWidth="5" />
        </g>
      );
      break;
    case "fort":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M148 153h48v-32h35v32h49v-32h36v32h50v-32h36v32h48v155H148Z" fill={foreground} />
          <path d="M177 184h236v124H177Z" fill={distant} />
          <path d="M260 308v-67a35 35 0 0 1 70 0v67Z" fill={sky} />
          <path d="M198 205h25v34h-25zm166 0h25v34h-25z" fill={light} opacity=".82" />
          <path d="M140 309h324v17H140z" fill={foreground} />
        </g>
      );
      break;
    case "festival":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M124 124q176 121 352 0" fill="none" stroke={foreground} strokeWidth="5" />
          {[0, 1, 2, 3, 4, 5, 6].map((item) => {
            const x = 145 + item * 48;
            const y = 131 + Math.sin((item / 6) * Math.PI) * 82;
            return <path key={item} d={`M${x} ${y}l18 25h-36z`} fill={item % 2 ? accent : light} />;
          })}
          <path d="M204 292q96-72 192 0v17H204Z" fill={foreground} />
          <path d="M228 288a68 68 0 0 1 136 0" fill={accent} />
          <circle cx="296" cy="213" r="31" fill={light} />
          <path d="M290 244h12v44h-12z" fill={foreground} />
          <circle cx="159" cy="274" r="11" fill={light} />
          <circle cx="433" cy="274" r="11" fill={light} />
        </g>
      );
      break;
    case "craft":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M260 93h72v44q0 20 35 43 29 21 29 58 0 74-100 74t-100-74q0-37 29-58 35-23 35-43Z" fill={foreground} />
          <path d="M220 238q76 23 152 0M226 263q70 19 140 0" fill="none" stroke={light} strokeWidth="7" />
          <path d="M266 112h60M279 89h34" stroke={accent} strokeWidth="8" strokeLinecap="round" />
          <path d="m296 163 8 16 18 2-13 12 4 18-17-9-16 9 3-18-13-12 18-2z" fill={accent} />
          <path d="M244 219q52-29 104 0" fill="none" stroke={light} strokeWidth="4" />
        </g>
      );
      break;
    case "forest":
      landmark = (
        <g>
          {[154, 222, 296, 372, 448].map((x, item) => (
            <g key={x} transform={`translate(${x} ${item % 2 ? 18 : 0})`}>
              <path d="M-10 304v-94h20v94Z" fill={foreground} />
              <path d="M0 74-52 206h104ZM0 117-43 240h86ZM0 156-34 267h68Z" fill={item % 2 ? accent : distant} />
            </g>
          ))}
          <path d="M0 294q170-55 320 5t280-6v107H0Z" fill={foreground} />
          <path d="M270 305q26-18 52 0t52 0" fill="none" stroke={light} strokeWidth="7" />
        </g>
      );
      break;
    case "temple":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M190 303h212v16H190zM210 286h172v17H210z" fill={foreground} />
          <path d="M226 190h140v96H226Z" fill={distant} />
          <path d="M210 190h172l-18-18H228z" fill={accent} />
          <path d="M238 172v-29h116v29M248 143v-25h96v25M260 118V96h72v22M274 96V77h44v19" fill={foreground} />
          <path d="M278 286v-48a18 18 0 0 1 36 0v48Z" fill={light} />
          <path d="M242 204v28m36-28v28m36-28v28m36-28v28" stroke={light} strokeWidth="6" />
          <circle cx="296" cy="83" r="5" fill={accent} />
        </g>
      );
      break;
    case "coffee":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M0 272q126-137 246 0t354-21v149H0Z" fill={foreground} />
          <path d="M0 309q142-92 295 7t305-18v102H0Z" fill={distant} />
          <path d="M312 301q-5-70 40-116M343 236q-49-32-66-5 25 31 66 25M348 215q44-42 70-18-18 38-65 42M331 267q-38-25-57-2 23 28 57 23M351 188q-5-42 25-57 24 31 2 62" fill={accent} stroke={foreground} strokeWidth="5" strokeLinejoin="round" />
          <circle cx="364" cy="175" r="10" fill={light} />
          <circle cx="388" cy="201" r="9" fill={light} />
          <circle cx="301" cy="251" r="9" fill={light} />
          <circle cx="369" cy="244" r="8" fill={light} />
        </g>
      );
      break;
    case "dance":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M174 309q122-81 244 0v17H174Z" fill={foreground} />
          <circle cx="296" cy="115" r="24" fill={light} />
          <path d="M275 105q21-32 42 0M283 140h26l22 91-35 26-35-26z" fill={accent} stroke={foreground} strokeWidth="7" />
          <path d="m274 162-65-43m66 55-70 24m104-36 66-43m-63 56 70 24" fill="none" stroke={foreground} strokeWidth="12" strokeLinecap="round" />
          <path d="M266 233q30 29 60 0l38 62q-68 37-136 0Z" fill={light} stroke={foreground} strokeWidth="7" />
          <path d="M244 279h104M256 293h80" stroke={accent} strokeWidth="6" />
          <path d="M285 83q11-26 22 0" fill="none" stroke={light} strokeWidth="6" />
        </g>
      );
      break;
    case "food":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <ellipse cx="296" cy="278" rx="155" ry="43" fill={foreground} />
          <ellipse cx="296" cy="266" rx="137" ry="38" fill={light} />
          <ellipse cx="296" cy="255" rx="113" ry="28" fill={accent} />
          <path d="M217 242q16-81 79-75 63-6 79 75Z" fill={light} />
          <circle cx="274" cy="216" r="5" fill={accent} />
          <circle cx="296" cy="204" r="5" fill={accent} />
          <circle cx="319" cy="220" r="5" fill={accent} />
          <path d="M192 299q104 36 208 0" fill="none" stroke={distant} strokeWidth="7" />
          <circle cx="172" cy="236" r="12" fill={accent} />
          <circle cx="420" cy="236" r="12" fill={accent} />
        </g>
      );
      break;
    case "music":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M324 87 287 250M338 90 301 253M352 93 315 256" stroke={foreground} strokeWidth="5" />
          <path d="M251 252q48-34 72 9 16 30-7 58-26 31-63 6-30-21-19-52 4-13 17-21Z" fill={accent} stroke={foreground} strokeWidth="7" />
          <path d="M302 257q42-31 63 4 16 27-4 52-21 27-54 9" fill={distant} stroke={foreground} strokeWidth="7" />
          <circle cx="282" cy="286" r="13" fill={light} />
          <path d="M319 84h41l-7 18h-27z" fill={foreground} />
          <path d="M260 309h106" stroke={light} strokeWidth="7" />
        </g>
      );
      break;
    case "harvest":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          {[226, 260, 296, 332, 366].map((x, item) => (
            <g key={x} transform={`rotate(${(item - 2) * 7} ${x} 300)`}>
              <path d={`M${x} 312V${138 + (item % 2) * 20}`} stroke={foreground} strokeWidth="7" />
              {[0, 1, 2, 3, 4].map((grain) => (
                <ellipse key={grain} cx={x + (grain % 2 ? 11 : -11)} cy={158 + grain * 19} rx="8" ry="15" fill={accent} transform={`rotate(${grain % 2 ? -32 : 32} ${x + (grain % 2 ? 11 : -11)} ${158 + grain * 19})`} />
              ))}
            </g>
          ))}
          <path d="M218 276q78 55 156 0" fill="none" stroke={light} strokeWidth="8" />
        </g>
      );
      break;
    case "river":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M0 246q100-25 200 0t200 0 200 0v154H0Z" fill={accent} />
          <path d="M0 282q100-25 200 0t200 0 200 0M0 326q100-25 200 0t200 0 200 0" fill="none" stroke={light} strokeWidth="7" />
          <path d="M128 238a168 118 0 0 1 336 0" fill="none" stroke={foreground} strokeWidth="26" />
          <path d="M144 238a152 102 0 0 1 304 0" fill="none" stroke={light} strokeWidth="8" />
          <path d="M116 230h360v22H116z" fill={foreground} />
          <path d="M154 208v23m62-55v55m62-73v73m62-55v55m62-23v23" stroke={foreground} strokeWidth="9" />
        </g>
      );
      break;
    case "palace":
      landmark = (
        <g transform={`translate(${shift} 0)`}>
          <path d="M167 306V184h258v122Z" fill={accent} stroke={foreground} strokeWidth="7" />
          <path d="M145 185h302l-25-22H170z" fill={foreground} />
          <path d="M190 163a36 36 0 0 1 72 0M260 151a36 36 0 0 1 72 0M330 163a36 36 0 0 1 72 0" fill={distant} stroke={foreground} strokeWidth="7" />
          <path d="M188 306v-70a31 31 0 0 1 62 0v70m38 0v-70a31 31 0 0 1 62 0v70m38 0v-70a31 31 0 0 1 62 0v70" fill={light} stroke={foreground} strokeWidth="7" />
          <path d="M145 310h302v16H145z" fill={foreground} />
        </g>
      );
      break;
    case "waterfall":
      landmark = (
        <g>
          <path d={`M0 300 105 ${hillPeak + 54}l77 70 119-185 86 90 92-116 121 136v105H0Z`} fill={foreground} />
          <path d="m294 185 28 20-40 87 21 42-38 28 16-70-17-31z" fill={light} />
          <path d="M278 330q19-16 39 0t39 0" fill="none" stroke={accent} strokeWidth="9" />
          <path d="M0 337q110-31 220 0t220 0 160 0v63H0Z" fill={accent} />
        </g>
      );
      break;
    case "coast":
      landmark = (
        <g>
          {[0, 1, 2].map((item) => (
            <path key={item} d={`M${70 + item * 185} 288q12-101 55-167`} fill="none" stroke={foreground} strokeWidth="13" strokeLinecap="round" />
          ))}
          {[0, 1, 2].map((item) => {
            const x = 125 + item * 185;
            const y = 125 + item * 2;
            return <path key={item} d={`M${x} ${y}q-45-39-69-18 25 38 69 34m0-16q16-48 54-45-4 39-54 55m0-14q48-32 74-3-30 30-74 31`} fill={accent} stroke={foreground} strokeWidth="5" />;
          })}
          <path d="M0 286q75-20 150 0t150 0 150 0 150 0v114H0Z" fill={distant} />
          <path d="M0 316q75-20 150 0t150 0 150 0 150 0M0 354q75-20 150 0t150 0 150 0 150 0" fill="none" stroke={light} strokeWidth="8" />
        </g>
      );
      break;
  }

  return (
    <svg
      className="district-artwork"
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      data-district={district.name}
    >
      <rect width="600" height="400" fill={sky} />
      <circle cx={sunX} cy={78 + (index % 4) * 12} r={39 + (index % 3) * 4} fill={light} opacity=".82" />
      <path d={`M0 266Q145 ${hillPeak + 72} 290 ${hillPeak}T600 244V400H0Z`} fill={distant} />
      <path d={`M0 304Q178 ${hillPeak + 145} 340 286T600 278V400H0Z`} fill={foreground} opacity=".8" />
      {landmark}
      <path d="M0 330q125-25 250 0t350 0v70H0Z" fill={foreground} />
      <path d="M42 356h96m45 17h75m91-18h105m31 24h66" stroke={light} strokeWidth="5" strokeLinecap="round" opacity=".58" />
    </svg>
  );
}
