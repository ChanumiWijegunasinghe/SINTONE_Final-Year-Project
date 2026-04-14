import React, { useState, useEffect, useRef } from 'react' 
import '../assets/css/HomePage.css' // Import styles for the home page
import '../assets/css/AnalyzePage.css' // Import styles specific to the analyze page
import Logo from '../assets/images/logo.png' // Import the website logo image
// Features banner background moved to CSS (AnalyzePage.css)
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
    const el = textareaRef.current // Get the textarea element
    const selStart = el ? el.selectionStart : 0 // Get the start position of the current selection
    const selEnd = el ? el.selectionEnd : 0 // Get the end position of the current selection

    const before = textInput.slice(0, selStart) // Get text before the selected area
    const after = textInput.slice(selEnd) // Get text after the selected area

    const existingSinhala = countSinhala(before + after) // Count Sinhala characters that will remain after paste
    let remainingSinhala = Math.max(0, MAX_SINHALA - existingSinhala) // Calculate how many Sinhala characters can still be pasted

    let filteredPaste = '' // Store the filtered pasted text
    for (const ch of pasted) { // Check each pasted character
      if (SINHALA_REGEX.test(ch)) { // If it is Sinhala
        if (remainingSinhala > 0) { // Allow only if space is still available
          filteredPaste += ch // Add the Sinhala character
          remainingSinhala -= 1 // Reduce the remaining allowed Sinhala count
        }
      } else {
        filteredPaste += ch // Keep non-Sinhala characters
      }
    }

    const newValue = before + filteredPaste + after // Build the new textarea value with the pasted text inserted
    setTextInput(newValue) // Save the updated text
    setInputError('') // Clear any previous error

    // restore caret to end of inserted content
    setTimeout(() => { // Wait until the textarea value updates
      const el2 = textareaRef.current // Get the textarea element again
      if (el2) { // Check if it exists
        const pos = (before + filteredPaste).length // Calculate where the cursor should be placed
        el2.focus() // Focus the textarea
        el2.selectionStart = el2.selectionEnd = pos // Place the cursor right after the inserted text
      }
    }, 0)
  }

  // ================= TYPING AFTER RESULTS =================
  const handleKeyDown = (e) => { // Function that runs when a key is pressed inside the textarea
    if (!analysisResult) return // Do nothing if there is no result shown

    // ignore modifier combos
    if (e.ctrlKey || e.metaKey || e.altKey) return // Ignore shortcut combinations like Ctrl+C or Ctrl+V

    const k = e.key // Get the pressed key
    // If this is a printable single character (including space), replace input
    if (k.length === 1 || k === ' ' || k === 'Enter') { // Check if the key is a normal text key
      e.preventDefault() // Stop the default typing action

      // Insert the pressed key while respecting Sinhala limit
      let allowedSinhala = MAX_SINHALA // Reset the Sinhala limit
      let filtered = '' // Store the filtered key value
      for (const ch of k) { // Check each character in the pressed key
        if (SINHALA_REGEX.test(ch)) { // If it is Sinhala
          if (allowedSinhala > 0) { // Allow it only if the Sinhala limit allows
            filtered += ch // Add the Sinhala character
            allowedSinhala -= 1 // Reduce remaining limit
          }
        } else {
          filtered += ch // Keep non-Sinhala characters
        }
      }

      setTextInput(filtered) // Replace old input with the newly typed character
      setAnalysisResult(null) // Clear old result because new typing has started
      setInputError('') // Clear old error message

      setTimeout(() => { // Wait until the textarea updates
        const el = textareaRef.current // Get the textarea element
        if (el) { // Check if it exists
          el.focus() // Focus the textarea
          el.selectionStart = el.selectionEnd = filtered.length // Move cursor to the end of the new text
        }
      }, 0)
    }
  }

  // ================= ANALYZE =================
  const handleAnalyze = async () => { // Function that runs when the Analyze button is clicked

    if (!textInput.trim()) return // Stop if the input is empty or only contains spaces

    let hasSinhala = false // Track whether the input contains at least one Sinhala character

    for (let char of textInput) { // Check each character in the input
      if (SINHALA_REGEX.test(char)) { // If a Sinhala character is found
        hasSinhala = true // Mark that Sinhala text exists
        break // Stop checking further
      }
    }
    if (!hasSinhala) { // If no Sinhala character was found
      setInputError('Please enter at least one Sinhala character') // Show an error message
      return // Stop analysis
    }

    setIsLoading(true) // Show loading state
    setAnalysisResult(null) // Clear old result before getting a new one
    setInputError('') // Clear any old error message

    try {
      const result = await predict(textInput) // Send the input text to the backend and wait for the prediction result
      setAnalysisResult(result) // Save the returned result so it can be shown on the page
    } catch (err) {
      console.error('Analyze error:', err) // Print the error in the browser console for debugging
      setAnalysisResult(null) // Clear result if an error happens

      // Provide user-friendly messages depending on error type/status
      if (err && err.status === 'network') { // If the backend cannot be reached
        setInputError('Network error: cannot reach backend. Is the backend running?') // Show network-related error
      } else if (err && err.status === 'invalid-json') { // If the server returned invalid JSON
        setInputError('Server error: received an unexpected response.') // Show invalid response error
      } else if (err && (err.status === 400 || err.status === 422)) { // If the server rejected the input
        setInputError('Server rejected the input. Please check the text and try again.') // Show validation-related error
      } else {
        setInputError(err.message || 'An unexpected error occurred') // Show any other error message
      }
    } finally {
      setIsLoading(false) // Stop loading state whether request succeeds or fails
    }
  }

  // ================= CLEAR =================
  const handleClear = () => { // Function that clears everything from the input area
    setTextInput('') // Remove the entered text
    setAnalysisResult(null) // Remove the shown result
    setInputError('') // Remove any shown error
  }

  return ( 
    <div className="analyze-page"> {/* Main wrapper for the analyze page */}

      {/* ================= NAVBAR ================= */}
      <section className="top-header"> {/* Top header section */}
        <nav className="site-nav"> {/* Navigation bar */}
          <div className="nav-inner"> {/* Inner container for navbar content */}
            <div className="brand-left"> {/* Left side of navbar for logo and name */}
              <img src={Logo} alt="SINTONE logo" className="nav-logo" /> {/* Show the website logo */}
              <div className="brand-logo">SINTONE</div> {/* Show the website name */}
            </div>

            <ul className="nav-links nav-right"> {/* Right side navigation links */}
              <li
                className={route === 'home' ? 'active' : ''} // Highlight Home if current route is home
                onClick={() => onNavigate('home')} // Navigate to home page when clicked
              >
                Home
              </li>
              <li
                className={route === 'features' ? 'active' : ''} // Highlight Features if current route is features
                onClick={() => onNavigate('features')} // Navigate to features page when clicked
              >
                Features
              </li>

              <li
                className={route === 'analyze' ? 'active' : ''} // Highlight Analyze if current route is analyze
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

      {/* ================= MAIN ================= */}
      <div className="analyze-wrapper"> 
        <div className="analyze-card"> {/* Card container for the analysis section */}

          {/* ================= INPUT CARD (textarea + footer) ================= */}
          <div className="input-card"> {/* Card containing the textarea and action buttons */}
            <textarea
              ref={textareaRef} // Connect textareaRef so the textarea can be controlled directly
              className="text-input" // Apply textarea styling
              placeholder="සිංහල පාඨය මෙහි ඇතුලත් කරන්න..." // Show placeholder text when input is empty
              value={textInput} // Bind textarea value to component state
              onChange={handleInputChange} // Run input filtering when user types
              onPaste={handlePaste} // Run custom paste handling when user pastes text
              onKeyDown={handleKeyDown} // Run custom key handling after results are shown
            />

            {/* ================= Error message dispplayed as a pop up ================= */}

            <div className="input-footer"> {/* Footer below the textarea */}
              <div className="char-count">{(textInput.match(/[\u0D80-\u0DFF]/g) || []).length} / 100 characters</div> {/* Show Sinhala character count */}

              <div className="footer-actions"> {/* Area for clear and analyze buttons */}
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
                  className="btn-analyze" // Apply analyze button styling
                  onClick={handleAnalyze} // Run text analysis when clicked
                  disabled={!textInput.trim() || isLoading} // Disable if input is empty or analysis is in progress
                >
                  🔍 {isLoading ? 'Analyzing...' : 'Analyze Now →'} {/* Show loading text while processing */}
                </button>
              </div>
            </div>
          </div>

          {/* ================= RESULT ================= */}
          {analysisResult && ( 
            <div className="result-container"> {/* Container for result cards */}

              <div className="result-card"> {/* Card for category result */}
                <div className="result-card-top"> {/* Top section of the result card */}
                  <div className="result-icon">🏷️</div> {/* Icon for category */}
                  <div className="result-meta"> {/* Text area for result heading */}
                    <h3>Category Detection</h3> {/* Title for category result */}
                  </div>
                </div>

                <div className="result-card-body"> {/* Main body of the result card */}
                  <div className="result-value">{analysisResult.category}</div> {/* Show predicted category */}
                </div>
              </div>

              <div className="result-card"> {/* Card for tone result */}
                <div className="result-card-top"> {/* Top section of the result card */}
                  <div className="result-icon">📊</div> {/* Icon for tone */}
                  <div className="result-meta"> {/* Text area for result heading */}
                    <h3>Tone Analysis</h3> {/* Title for tone result */}
                  </div>
                </div>

                <div className="result-card-body"> {/* Main body of the result card */}
                  <div className="result-value">{analysisResult.tone || '—'}</div> {/* Show predicted tone or dash if not available */}
                </div>
              </div>

            </div>
          )}

          {/* ================= SUPPORT CARDS (conditional) ================= */}
          {analysisResult && (() => { // Run this block only when a result exists
            const cat = (analysisResult.category || '').toString().trim().toLowerCase() 
            const tone = (analysisResult.tone || '').toString().trim().toLowerCase() 
            const noToneValues = new Set(['no tone', 'notone', 'not tone', '—', '','none']) 
            const isNeutralNoTone = cat === 'neutral' && noToneValues.has(tone) // Checking if result is neutral and has no tone
            if (isNeutralNoTone) return null // not showing the support section for neutral no-tone results

            return ( 
              <section className="support-section"> {/* Section containing support information */}
                <div className="support-intro"> {/* Intro text for support section */}
                  <div className="header-box"> {/* Header box */}
                    <h2>Hate Detected</h2> {/* Warning title */}
                  </div>

                  <div className="english-box"> {/* English explanation box */}
                    <p className="support-text">Hate content detected in the input text comment. If need help and protection can contact the below places.</p> {/* English support message */}
                  </div>

                  <div className="sinhala-box"> {/* Sinhala explanation box */}
                    <p className="support-text sinhala">ඔබ ලබාදුන් පෙළ අදහස තුළ ද්වේශ සහිත අන්තර්ගතයක් හඳුනාගන්නා ලදී. ඔබට උදව් හෝ ආරක්ෂාව අවශ්‍ය නම්, පහත සඳහන් ස්ථාන සම්බන්ධ කරගත හැක.</p> {/* Sinhala support message */}
                  </div>
                </div>

                <div className="support-grid"> {/* Grid of support contact cards */}
                  <div className="support-card"> {/* Support card 1 */}
                    <h4>🛡️ Sri Lanka CERT|CC</h4> {/* Organization name */}
                    <p>සයිබර්/අන්තර්ජාල පැමිණිලි  සයිබර් හිරිහැර / ද්වේශ ප්‍රකාශ / අන්තර්ජාල අපයෝජන</p> {/* Description of help provided */}
                    <p className="card-contact">☎️ 101 / +94 11 269 1692</p> {/* Contact number */}
                    <p className="card-link">🌐 <a href="https://www.cert.gov.lk" target="_blank" rel="noreferrer">www.cert.gov.lk</a></p> {/* Website link */}
                  </div>

                  <div className="support-card"> {/* Support card 2 */}
                    <h4>🔹 Police Cyber Crimes</h4> {/* Organization name */}
                    <p>බරපතල තර්ජන / සංවිධානාත්මක ද්වේශ ප්‍රචාර / සයිබර් හිරිහැර</p> {/* Description of help provided */}
                    <p className="card-contact">☎️ 011 242 2176</p> {/* Contact number */}
                    <p className="card-link">🌐 <a href="https://www.police.lk" target="_blank" rel="noreferrer">www.police.lk</a></p> {/* Website link */}
                  </div>

                  <div className="support-card"> {/* Support card 3 */}
                    <h4>⚖️ Human Rights Commission</h4> {/* Organization name */}
                    <p>නීතිමය / මානව හිමිකම් පැමිණිලි</p> {/* Description of help provided */}
                    <p className="card-contact">☎️ 011 250 5580</p> {/* Contact number */}
                    <p className="card-link">🌐 <a href="https://www.hrcsl.lk" target="_blank" rel="noreferrer">www.hrcsl.lk</a></p> {/* Website link */}
                  </div>

                  <div className="support-card"> {/* Support card 4 */}
                    <h4>📡 TRC</h4> {/* Organization name */}
                    <p>මාධ්‍ය / සන්නිවේදන පැමිණිලි</p> {/* Description of help provided */}
                    <p className="card-contact">☎️ 011 268 9345</p> {/* Contact number */}
                    <p className="card-link">🌐 <a href="https://www.trc.gov.lk" target="_blank" rel="noreferrer">www.trc.gov.lk</a></p> {/* Website link */}
                  </div>

                  <div className="support-card"> {/* Support card 5 */}
                    <h4>🚨 Emergency / Police</h4> {/* Emergency service name */}
                    <p>හදිසි අවස්ථා</p> {/* Description */}
                    <p className="card-contact">☎️ 119</p> {/* Emergency number */}
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