import { Journey } from "@/components/journey/Journey";
import { HistoricalNotes } from "@/components/notes/HistoricalNotes";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  name: "Sigiriya",
  alternateName: ["Lion Rock", "Sinhagiri", "Ancient City of Sigiriya"],
  description:
    "Rock fortress and ruins of the capital built by King Kashyapa I (477–495 CE) in Sri Lanka's Central Province; a UNESCO World Heritage Site since 1982.",
  geo: { "@type": "GeoCoordinates", latitude: 7.957, longitude: 80.7603 },
  address: { "@type": "PostalAddress", addressRegion: "Central Province", addressCountry: "LK" },
  isAccessibleForFree: false,
  sameAs: ["https://whc.unesco.org/en/list/202/"],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Journey notes={<HistoricalNotes />} />
    </>
  );
}
