export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
}

export const SOURCES: Record<string, Source> = {
  unesco: {
    id: "unesco",
    title: "Ancient City of Sigiriya — World Heritage List entry 202",
    publisher: "UNESCO World Heritage Centre",
    url: "https://whc.unesco.org/en/list/202/",
  },
  ccf: {
    id: "ccf",
    title: "Sigiriya World Heritage Site",
    publisher: "Central Cultural Fund, Sri Lanka",
    url: "https://www.ccf.gov.lk/",
  },
  sltda: {
    id: "sltda",
    title: "Sigiriya — Cultural Triangle",
    publisher: "Sri Lanka Tourism Promotion Bureau",
    url: "https://www.srilanka.travel/",
  },
  culavamsa: {
    id: "culavamsa",
    title: "Cūḷavaṃsa, ch. 38–39 (tr. W. Geiger, 1929)",
    publisher: "Pali chronicle of Sri Lanka",
    url: "https://archive.org/details/culavamsabeingmo01geig",
  },
  bandaranayake: {
    id: "bandaranayake",
    title: "Sigiriya: City, Palace and Royal Gardens (S. Bandaranayake, 2005)",
    publisher: "Central Cultural Fund",
    url: "https://www.ccf.gov.lk/",
  },
  paranavitana: {
    id: "paranavitana",
    title: "Sigiri Graffiti (S. Paranavitana, 1956)",
    publisher: "Oxford University Press for the Government of Ceylon",
    url: "https://archive.org/search?query=Sigiri+Graffiti+Paranavitana",
  },
};
