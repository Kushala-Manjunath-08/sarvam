import { getKaravaliPhotoCredit } from "../karavali-photos";

export default function KaravaliPhotoCredit({
  image,
}: {
  image: string;
}) {
  const credit = getKaravaliPhotoCredit(image);
  if (!credit) return null;

  return (
    <p className="karavali-photo-credit">
      Photograph: {credit.title} · © {credit.creator} ·{" "}
      <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
        {credit.license}
      </a>{" "}
      ·{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noreferrer">
        Source
      </a>
    </p>
  );
}
