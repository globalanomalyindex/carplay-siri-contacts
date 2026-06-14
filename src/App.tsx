import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CaseStudyPage } from './case-study/CaseStudyPage'
import { PrototypePage } from './prototype/PrototypePage'

/**
 * App root. Two routes: the case study at /, the standalone prototype at
 * /prototype. The case study embeds the prototype inline as its own
 * section but the standalone route is what gets opened in a new tab from
 * the nav and footer.
 */
// import.meta.env.BASE_URL is '/carplay-siri-contacts/' in the deployed build and
// '/' in dev, so the router resolves /prototype under whatever base it ships on.
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <Routes>
        <Route path="/" element={<CaseStudyPage />} />
        <Route path="/prototype" element={<PrototypePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
