import { useEffect, useState } from "react";
import { abstract, acknowledgement, certificateText, keywords, project } from "../data/project";
import { Section } from "./common";

export const NAV = [
  ["home", "Home"],
  ["certificate", "Certificate"],
  ["abstract", "Abstract"],
  ["introduction", "Introduction"],
  ["objectives", "Objectives"],
  ["literature", "Literature"],
  ["methodology", "Methodology"],
  ["dataset", "Dataset"],
  ["results", "Results"],
  ["findings", "Findings"],
  ["conclusion", "Conclusion"],
  ["references", "References"],
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  useEffect(() => {
    const ids = NAV.map(([id]) => id);
    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 90) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a className="brand" href="#home" onClick={() => setOpen(false)}>
          HGP <span className="brand-sub">M.Tech Dissertation</span>
        </a>
        <button className="menu-button" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
        <nav id="nav-links" className={open ? "nav-links open" : "nav-links"} aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "active" : ""} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Hero() {
  const rows = [
    ["Student", project.student],
    ["Roll number", project.roll],
    ["Degree", `${project.degree} (${project.degreeShort}), ${project.department}`],
    ["Institution", `${project.school}, ${project.university}, ${project.location}`],
    ["Course", project.course],
    ["Thesis advisor", `${project.advisor}, ${project.advisorDesignation}`],
    ["Source code", <a href={project.code} target="_blank" rel="noopener noreferrer">github.com/prof-sanjay/HGP</a>],
  ];
  return (
    <section id="home" className="hero">
      <div className="container">
        <p className="kicker">M.Tech Dissertation · {project.university}</p>
        <h1>{project.title}</h1>
        <dl className="meta">
          {rows.map(([k, v]) => (
            <div key={k} className="meta-row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="lead">
          Graph-based traffic forecasters use one graph of sensor-to-sensor influence for every forecast length, although
          congestion travels at a finite speed and the sensors that matter fifteen minutes ahead are not the ones that
          matter an hour ahead. This work builds a separate directed graph for each horizon (15, 30 and 60 minutes) from
          training data alone, with the false discovery rate of its edges controlled, and tests, under a decision rule fixed
          in advance, whether a forecaster that routes each horizon through its own graph predicts better.
        </p>
        <div className="buttons">
          <a className="button primary" href="#introduction">Explore Research</a>
          <a className="button" href="#results">View Results</a>
          <a className="button" href={project.code} target="_blank" rel="noopener noreferrer">Source Code on GitHub</a>
        </div>
      </div>
    </section>
  );
}

export function Certificate() {
  return (
    <Section id="certificate" title="Bonafide Certificate" kicker="Academic details">
      <div className="certificate">
        <p className="cert-uni">{project.university.toUpperCase()}</p>
        <p className="cert-sub">{project.school.toUpperCase()}, COIMBATORE</p>
        <p className="cert-sub">DEPARTMENT OF {project.department.toUpperCase()}</p>
        <p className="cert-title">BONAFIDE CERTIFICATE</p>
        <p className="cert-text">{certificateText}</p>
        <p className="cert-evaluated">Evaluated on:</p>
        <div className="cert-signatories">
          <div>
            <p><strong>{project.advisor}</strong></p>
            <p>Thesis Advisor</p>
            <p>{project.advisorDesignation}</p>
            <p>Department of {project.department}</p>
          </div>
          <div>
            <p><strong>{project.chairperson}</strong></p>
            <p>Chairperson</p>
            <p>Department of {project.department}</p>
          </div>
        </div>
        <div className="cert-signatories cert-examiners">
          <div>
            <span className="signature-line" aria-hidden="true" />
            <p>Internal Examiner</p>
          </div>
          <div>
            <span className="signature-line" aria-hidden="true" />
            <p>External Examiner</p>
          </div>
        </div>
        <p className="cert-note">Text of the certificate page of the thesis. Signatures are on the submitted copy and are not reproduced here.</p>
      </div>
    </Section>
  );
}

export function Acknowledgement() {
  return (
    <Section id="acknowledgement" title="Acknowledgement">
      <div className="prose">
        {acknowledgement.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className="signoff">
          {project.student}
          <br />
          {project.roll}
        </p>
      </div>
    </Section>
  );
}

export function Abstract() {
  return (
    <Section id="abstract" title="Abstract">
      <div className="prose">
        {abstract.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="keywords" aria-label="Keywords">
        <strong>Keywords:</strong>
        {keywords.map((k) => (
          <span key={k} className="tag">{k}</span>
        ))}
      </div>
    </Section>
  );
}
