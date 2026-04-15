import React, { useState, useEffect, useRef } from 'react' 
import '../assets/css/HomePage.css' // Import styles for the home page
import '../assets/css/AnalyzePage.css' // Import styles specific to the analyze page
import Logo from '../assets/images/logo.png' // Import the website logo image
import Footer from './Footer' // Import the Footer component

// ================= API CALL =================
async function predict(text) { // function that sends the entered text to the backend for analysis
  try {
    const res = await fetch('/predict', { // Sending  a POST request to the predict backend endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ text }), // Converting the text into JSON format and send it in the request body
    })

    if (!res.ok) { 
      const msg = await res.text().catch(() => res.statusText || 'Failed to connect to server') 
      const error = new Error(msg || 'Failed to connect to server') 
      error.status = res.status 
      throw error 
    }

   
    try {
      return await res.json() 
    } catch (parseErr) {
      const error = new Error('Invalid response from server') // Creates an error if the response cannot be read as JSON
      error.status = 'invalid-json' 
      throw error
    }
  } catch (err) {
  
    if (err instanceof TypeError) { 
      const netErr = new Error('Failed to connect to server') 
      netErr.status = 'network' 
      throw netErr 
    }
    throw err 
  }
}

function AnalyzePage({ onNavigate, route }) { 
  const fullText = "Analyze Sinhala Text"; 
  const [displayText, setDisplayText] = useState(""); 
  const [isDeleting, setIsDeleting] = useState(false); 
  const [finished, setFinished] = useState(false); 

  useEffect(() => { 
    let timeout; 

    if (!finished) { 
      if (!isDeleting && displayText.length < fullText.length) { 
        timeout = setTimeout(() => setDisplayText(fullText.slice(0, displayText.length + 1)), 100); 
      } else if (!isDeleting && displayText.length === fullText.length) { 
        // stop looping after fully typed
        setFinished(true); // Stop the animation permanently
      } else if (isDeleting && displayText.length > 0) { 
        timeout = setTimeout(() => setDisplayText(fullText.slice(0, displayText.length - 1)), 50); 
      } else if (isDeleting && displayText.length === 0) { 
        timeout = setTimeout(() => setIsDeleting(false), 400); 
      }
    }

    return () => clearTimeout(timeout); 
  }, [displayText, isDeleting]); 

  const [textInput, setTextInput] = useState('') // Stores the text entered by the user
  const [analysisResult, setAnalysisResult] = useState(null) // Stores the prediction result returned from the backend
  const [isLoading, setIsLoading] = useState(false) // Stores whether analysis is currently in progress
  const [inputError, setInputError] = useState('') // Stores any input or server error message

  // ================= REGEX =================
  const SINHALA_REGEX = /[\u0D80-\u0DFF]/ // Regular expression used to check Sinhala characters
  const MAX_SINHALA = 100 // Maximum allowed Sinhala characters

  const countSinhala = (s) => (s.match(SINHALA_REGEX) || []).length // Function to count Sinhala characters in a string

  const textareaRef = useRef(null) 

  // ================= INPUT =================
  const handleInputChange = (e) => { // Function that runs whenever the user types in the textarea
    const raw = e.target.value // Get the full current input value
    let sinhalaCount = 0 // Track the number of Sinhala characters
    let filtered = '' // Stores the filtered final text

    for (const ch of raw) { // Check each typed character one by one
      if (SINHALA_REGEX.test(ch)) { 
        if (sinhalaCount < MAX_SINHALA) { 
          filtered += ch 
          sinhalaCount += 1 
        } else {
        }
      } else {
        // keeping all non-Sinhala characters (spaces, English, numbers, symbols)
        filtered += ch // keeping non-Sinhala characters without limiting them
      }
    }

    setTextInput(filtered) // save the filtered input text
    setInputError('') // clearing any previous error message

    // If the input becomes empty (user deleted text), clear previous results
    if (!filtered.trim()) { 
      setAnalysisResult(null) // Clear the old analysis result
    }
  }

  // ================= PASTE HANDLING =================
  const handlePaste = (e) => { // Function that runs when the user pastes text
    const pasted = (e.clipboardData && e.clipboardData.getData('text')) || (window.clipboardData && window.clipboardData.getData('Text')) || '' 
    if (!pasted) return 

    if (analysisResult) { 
      e.preventDefault() 
      
      let allowedSinhala = MAX_SINHALA 
      let filtered = '' 
      for (const ch of pasted) { 
        if (SINHALA_REGEX.test(ch)) { 
          if (allowedSinhala > 0) { 
            filtered += ch 
            allowedSinhala -= 1 
          }
        } else {
          filtered += ch 
        }
      }

      setTextInput(filtered) 
      setAnalysisResult(null) 
      setInputError('') 
      
      setTimeout(() => { 
        const el = textareaRef.current 
        if (el) { 
          el.focus() 
          el.selectionStart = el.selectionEnd = filtered.length 
        }
      }, 0)
      return 
    }
 
    e.preventDefault() 
    const el = textareaRef.current 
    const selStart = el ? el.selectionStart : 0 
    const selEnd = el ? el.selectionEnd : 0 

    const before = textInput.slice(0, selStart) 
    const after = textInput.slice(selEnd) 

    const existingSinhala = countSinhala(before + after) 
    let remainingSinhala = Math.max(0, MAX_SINHALA - existingSinhala) 

    let filteredPaste = '' 
    for (const ch of pasted) { 
      if (SINHALA_REGEX.test(ch)) { 
        if (remainingSinhala > 0) { 
          filteredPaste += ch 
          remainingSinhala -= 1 
        }
      } else {
        filteredPaste += ch // Keep non-Sinhala characters
      }
    }

    const newValue = before + filteredPaste + after 
    setTextInput(newValue) 
    setInputError('') 

  
    setTimeout(() => { 
      const el2 = textareaRef.current 
      if (el2) { // Check if it exists
        const pos = (before + filteredPaste).length 
        el2.focus() // Focus the textarea
        el2.selectionStart = el2.selectionEnd = pos 
      }
    }, 0)
  }

  // ================= TYPING AFTER RESULTS =================
  const handleKeyDown = (e) => { 
    if (!analysisResult) return 

  
    if (e.ctrlKey || e.metaKey || e.altKey) return 

    const k = e.key 
 
    if (k.length === 1 || k === ' ' || k === 'Enter') { 
      e.preventDefault()

      
      let allowedSinhala = MAX_SINHALA 
      let filtered = '' 
      for (const ch of k) { 
        if (SINHALA_REGEX.test(ch)) { 
          if (allowedSinhala > 0) {
            filtered += ch 
            allowedSinhala -= 1
          }
        } else {
          filtered += ch 
        }
      }

      setTextInput(filtered) 
      setAnalysisResult(null)
      setInputError('') 

      setTimeout(() => { 
        const el = textareaRef.current 
        if (el) { 
          el.focus() 
          el.selectionStart = el.selectionEnd = filtered.length 
        }
      }, 0)
    }
  }

  // ================= ANALYZE =================
  const handleAnalyze = async () => { 

    if (!textInput.trim()) return 

    let hasSinhala = false 

    for (let char of textInput) { 
      if (SINHALA_REGEX.test(char)) { 
        hasSinhala = true 
        break 
      }
    }
    if (!hasSinhala) { 
      setInputError('Please enter at least one Sinhala character') 
      return // Stop analysis
    }

    setIsLoading(true) 
    setAnalysisResult(null) 
    setInputError('') 

    try {
      const result = await predict(textInput) 
      setAnalysisResult(result) 
    } catch (err) {
      console.error('Analyze error:', err) 
      setAnalysisResult(null)

      
      if (err && err.status === 'network') { 
        setInputError('Network error: cannot reach backend. Is the backend running?') 
      } else if (err && err.status === 'invalid-json') { 
        setInputError('Server error: received an unexpected response.')
      } else if (err && (err.status === 400 || err.status === 422)) { 
        setInputError('Server rejected the input. Please check the text and try again.') 
      } else {
        setInputError(err.message || 'An unexpected error occurred') 
      }
    } finally {
      setIsLoading(false) 
    }
  }

  // ================= CLEAR =================
  const handleClear = () => { // Function that clears everything from the input area
    setTextInput('') // Removing entered text
    setAnalysisResult(null) // Removing shown result
    setInputError('')                 
  }

  return ( 
    <div className="analyze-page"> 

      {/* ================= NAVBAR ================= */}
      <section className="top-header">
        <nav className="site-nav"> 
          <div className="nav-inner"> 
            <div className="brand-left"> 
              <img src={Logo} alt="SINTONE logo" className="nav-logo" /> 
              <div className="brand-logo">SINTONE</div> 
            </div>

            <ul className="nav-links nav-right"> 
              <li
                className={route === 'home' ? 'active' : ''} 
                onClick={() => onNavigate('home')} // Navigate to home page when clicked
              >
                Home
              </li>
              <li
                className={route === 'features' ? 'active' : ''} 
                onClick={() => onNavigate('features')} // Navigate to features page when clicked
              >
                Features
              </li>

              <li
                className={route === 'analyze' ? 'active' : ''} 
                onClick={() => onNavigate('analyze')} // Navigate to analyze page when clicked
              >
                Analyze
              </li>
            </ul>
          </div>
        </nav>
      </section>

     
      <header className="hero"> 
        <div className="features-banner"> 
          <div className="features-banner-inner"> 
            <h1 className="banner-title"> 
              <span className="typewriter">{displayText}</span> 
            </h1>
            <p className="banner-sub">Enter a Sinhala text comment below to detect hate speech category and tone</p> 
          </div>
        </div>
      </header>

     
      <div className="analyze-wrapper"> 
        <div className="analyze-card">

         
          <div className="input-card"> 
            <textarea
              ref={textareaRef} 
              className="text-input" 
              placeholder="සිංහල පාඨය මෙහි ඇතුලත් කරන්න..." 
              value={textInput} 
              onChange={handleInputChange} 
              onPaste={handlePaste} 
              onKeyDown={handleKeyDown}
            />

            

            <div className="input-footer">
              <div className="char-count">{(textInput.match(/[\u0D80-\u0DFF]/g) || []).length} / 100 characters</div> 

              <div className="footer-actions"> 
                {textInput.trim() && ( // Show clear button only if there is text in the input
                  <button
                    className="btn-clear small" // Apply clear button styling
                    onClick={handleClear} // Clear input and result when clicked
                    disabled={isLoading} // Disable button while analysis is running
                  >
                    ✕
                  </button>
                )}

                <button
                  className="btn-analyze" 
                  onClick={handleAnalyze} 
                  disabled={!textInput.trim() || isLoading} 
                >
                  🔍 {isLoading ? 'Analyzing...' : 'Analyze Now →'} 
                </button>
              </div>
            </div>
          </div>

          {/* ================= RESULT ================= */}
          {analysisResult && ( 
            <div className="result-container">

              <div className="result-card"> 
                <div className="result-card-top"> 
                  <div className="result-icon">🏷️</div> 
                  <div className="result-meta"> 
                    <h3>Category Detection</h3>
                  </div>
                </div>

                <div className="result-card-body"> 
                  <div className="result-value">{analysisResult.category}</div>
                </div>
              </div>

              <div className="result-card"> 
                <div className="result-card-top"> 
                  <div className="result-icon">📊</div> 
                  <div className="result-meta"> 
                    <h3>Tone Analysis</h3> 
                  </div>
                </div>

                <div className="result-card-body"> 
                  <div className="result-value">{analysisResult.tone || '—'}</div> 
                </div>
              </div>

            </div>
          )}

          {/* ================= SUPPORT CARDS (conditional) ================= */}
          {analysisResult && (() => { 
            const cat = (analysisResult.category || '').toString().trim().toLowerCase() 
            const tone = (analysisResult.tone || '').toString().trim().toLowerCase() 
            const noToneValues = new Set(['no tone', 'notone', 'not tone', '—', '','none']) 
            const isNeutralNoTone = cat === 'neutral' && noToneValues.has(tone) // Checking if result is neutral and has no tone
            if (isNeutralNoTone) return null // not showing the support section for neutral no-tone results

            return ( 
              <section className="support-section"> 
                <div className="support-intro"> 
                  <div className="header-box"> 
                    <h2>Hate Detected</h2> 
                  </div>

                  <div className="english-box"> 
                    <p className="support-text">Hate content detected in the input text comment. If need help and protection can contact the below places.</p> 
                  </div>

                  <div className="sinhala-box"> 
                    <p className="support-text sinhala">ඔබ ලබාදුන් පෙළ අදහස තුළ ද්වේශ සහිත අන්තර්ගතයක් හඳුනාගන්නා ලදී. ඔබට උදව් හෝ ආරක්ෂාව අවශ්‍ය නම්, පහත සඳහන් ස්ථාන සම්බන්ධ කරගත හැක.</p> 
                  </div>
                </div>

                <div className="support-grid"> {/* Grid of support contact cards */}
                  <div className="support-card"> 
                    <h4>🛡️ Sri Lanka CERT|CC</h4> 
                    <p>සයිබර්/අන්තර්ජාල පැමිණිලි  සයිබර් හිරිහැර / ද්වේශ ප්‍රකාශ / අන්තර්ජාල අපයෝජන</p> 
                    <p className="card-contact">☎️ 101 / +94 11 269 1692</p> 
                    <p className="card-link">🌐 <a href="https://www.cert.gov.lk" target="_blank" rel="noreferrer">www.cert.gov.lk</a></p> 
                  </div>

                  <div className="support-card"> 
                    <h4>🔹 Police Cyber Crimes</h4> 
                    <p>බරපතල තර්ජන / සංවිධානාත්මක ද්වේශ ප්‍රචාර / සයිබර් හිරිහැර</p>
                    <p className="card-contact">☎️ 011 242 2176</p>
                    <p className="card-link">🌐 <a href="https://www.police.lk" target="_blank" rel="noreferrer">www.police.lk</a></p> 
                  </div>

                  <div className="support-card"> 
                    <h4>⚖️ Human Rights Commission</h4>
                    <p>නීතිමය / මානව හිමිකම් පැමිණිලි</p> 
                    <p className="card-contact">☎️ 011 250 5580</p> 
                    <p className="card-link">🌐 <a href="https://www.hrcsl.lk" target="_blank" rel="noreferrer">www.hrcsl.lk</a></p> 
                  </div>

                  <div className="support-card"> 
                    <h4>📡 TRC</h4> 
                    <p>මාධ්‍ය / සන්නිවේදන පැමිණිලි</p> 
                    <p className="card-contact">☎️ 011 268 9345</p> 
                    <p className="card-link">🌐 <a href="https://www.trc.gov.lk" target="_blank" rel="noreferrer">www.trc.gov.lk</a></p> 
                  </div>

                  <div className="support-card"> 
                    <h4>🚨 Emergency / Police</h4> 
                    <p>හදිසි අවස්ථා</p> 
                    <p className="card-contact">☎️ 119</p> 
                  </div>

                </div>
              </section>
            )
          })()}

        </div>
      </div>

      {/* ================= ERROR POPUP ================= */}
      {inputError && ( // Show this popup only when an error message exists
        <div role="alert" aria-live="assertive" className="error-popup">
          <div className="error-popup-inner">
            <div className="error-message">{inputError}</div>
            <button onClick={() => setInputError('')} aria-label="Close error" className="error-close">✕</button>
          </div>
        </div>
      )}

      <Footer /> {/* Show the footer at the bottom of the page */}
    </div>
  )
}

export default AnalyzePage