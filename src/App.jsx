import { Introduction, Literature, Objectives } from "./components/Background";
import { Conclusion, Findings, Footer, Limitations, References } from "./components/Closing";
import { Dataset } from "./components/Dataset";
import { Abstract, Acknowledgement, Certificate, Hero, Navbar } from "./components/FrontMatter";
import { Methodology } from "./components/Methodology";
import { Results } from "./components/Results";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#introduction">Skip to content</a>
      <Navbar />
      <main>
        <Hero />
        <Certificate />
        <Acknowledgement />
        <Abstract />
        <Introduction />
        <Objectives />
        <Literature />
        <Methodology />
        <Dataset />
        <Results />
        <Findings />
        <Conclusion />
        <Limitations />
        <References />
      </main>
      <Footer />
    </>
  );
}
