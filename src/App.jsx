import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/landing';
import Step1Mood from './pages/step1-mood';
import Step2Taste from './pages/step2-taste';
import Step3Result from './pages/step3-result';
import Loading from './pages/loading';
import Success from './pages/success';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/step1-mood" element={<Step1Mood />} />
        <Route path="/step2-taste" element={<Step2Taste />} />
        <Route path="/step3-result" element={<Step3Result />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
