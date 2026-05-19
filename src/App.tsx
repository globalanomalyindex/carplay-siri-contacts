import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CaseStudyPage } from './case-study/CaseStudyPage'
import { PrototypePage } from './prototype/PrototypePage'

/**
 * App root. Two routes: the case study at /, the standalone prototype at
 * /prototype. The case study embeds the prototype inline as its own
 * section but the standalone route is what gets opened in a new tab from
 * the nav and footer.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CaseStudyPage />} />
        <Route path="/prototype" element={<PrototypePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
