import { SOURCES } from "@/content/sources";

const KEY = [
  {
    kind: "photograph",
    title: "Documented: photographs",
    body: "The rock from the air, the water gardens, the Lion Gate paws, the summit foundations and the frescoes are present-day photographs of surviving remains.",
  },
  {
    kind: "animated",
    title: "Animated photographs",
    body: "The drone flights and the walks through the gardens and the Lion Gate are video clips generated with AI (Higgsfield, Kling) from those photographs. The first frame is the photograph; the camera movement, clouds and mist are added. The time-lapses are clips that end on a reconstruction.",
  },
  {
    kind: "reconstruction",
    title: "Cinematic reconstruction",
    body: "The rebuilt city, the filled gardens, the complete lion and the summit palace are AI-generated visualizations, made for this site from the present-day photographs and guided by published descriptions. They show what the site may have looked like, not what it did look like. The form of the palace buildings and of the lion’s body and head is unknown.",
  },
  {
    kind: "illustration",
    title: "Illustration",
    body: "The climbing rock face, the Mirror Wall surface, the survey drawing and the verses (paraphrased themes, not transcriptions) are illustrations.",
  },
];

const NOTES = [
  "The king’s name appears as Kashyapa, Kassapa or Kasyapa in different sources; this site uses Kashyapa.",
  "His reign is usually dated 477–495 CE. Years shown during the reign are a pacing device for the journey, not a dated building sequence.",
  "Older dates are approximate and shown with “c.”. Centuries between the reign and the 19th century are compressed.",
  "Interpretations of the painted women vary; no single reading is presented as established.",
  "The Mirror Wall verses are generally dated to between the 8th and 10th centuries.",
];

export function HistoricalNotes() {
  return (
    <section id="notes" className="notes" aria-labelledby="notes-title" tabIndex={-1}>
      <div className="notes__inner">
        <h2 id="notes-title" className="notes__title">
          Sources &amp; historical notes
        </h2>

        <div className="notes__grid">
          <div>
            <h3 className="notes__h">What you are looking at</h3>
            <ul className="notes__key">
              {KEY.map((k) => (
                <li key={k.kind}>
                  <span className={`hud-evidence__dot hud-evidence__dot--${k.kind}`} aria-hidden="true" />
                  <div>
                    <strong>{k.title}</strong>
                    <p>{k.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="notes__h">Notes</h3>
            <ul className="notes__list">
              {NOTES.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>

            <h3 className="notes__h">Sources</h3>
            <ul className="notes__sources">
              {Object.values(SOURCES).map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                  <span>{s.publisher}</span>
                </li>
              ))}
            </ul>

            <h3 className="notes__h">Image credits</h3>
            <p className="notes__credits">
              Present-day photographs were supplied for this project; photographer credits and licences are to be confirmed before public release. Reconstructions and video clips generated with Higgsfield from those photographs.
            </p>
          </div>
        </div>

        <p className="notes__foot">Sigiriya · Journey Through Time</p>
      </div>
    </section>
  );
}
