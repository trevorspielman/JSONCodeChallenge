import React, { useState } from 'react'

// In production we would not have hardcoded email/query here
const API_BASE = '/api'
const QUERY = '?email=trevor.spielman@gmail.com'
// Base URL for the API and query parameters for fetching data.

function tryParse(jsonStr: string) {
  try {
    return { ok: true, value: JSON.parse(jsonStr) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
/**
 * Attempts to parse a JSON string. Returns an object with
 * { ok: true, value } if successful, or { ok: false, error } if parsing fails.
 */

function sanitizeCommonIssues(input: string): string {
  let inputString = input

  // 1) Remove trailing commas before } or ]
  inputString = inputString.replace(/,\s*(?=[}\]])/g, '')

  // 2) Add quotes around unquoted object keys (simple heuristic)
  // Matches keys like: { key: or , key:
  inputString = inputString.replace(/([\{,\s])([A-Za-z0-9_@\$-]+)\s*:/g, '$1"$2":')

  // 3) Fix unclosed string by ensuring even number of quotes. If odd, close at end.
  const quotes = (inputString.match(/"/g) || []).length
  if (quotes % 2 === 1) inputString = inputString + '"'

  return inputString
}

export default function App() {
  const [originalRaw, setOriginalRaw] = useState<string>('')
  const [validatedRaw, setValidatedRaw] = useState<string>('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [parsedValue, setParsedValue] = useState<any | null>(null)
  const [parsedOk, setParsedOk] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  async function handleFetch() {
    setLoading(true)
    setParseError(null)
    try {
      const res = await fetch(API_BASE + QUERY)
      const queryText = await res.text()
      setOriginalRaw(queryText)

      // First try parse as-is
      const parseQuery = tryParse(queryText)
      if (parseQuery.ok) {
        setValidatedRaw(JSON.stringify(parseQuery.value, null, 2))
        setParsedValue(parseQuery.value)
        setParsedOk(true)
      } else {
        const sanitized = sanitizeCommonIssues(queryText)
        const p2 = tryParse(sanitized)
        if (p2.ok) {
          setValidatedRaw(JSON.stringify(p2.value, null, 2))
          setParsedValue(p2.value)
          setParsedOk(true)
        } else {
          setValidatedRaw(sanitized)
          setParsedValue(null)
          setParsedOk(false)
          setParseError(p2.error || null)
        }
      }
    } catch (e) {
      setParseError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    const p = tryParse(validatedRaw)
    if (!p.ok) {
      alert('Edited JSON is invalid: ' + (p.error || 'unknown error'))
      return
    }

    try {
        // Stringify the validated JSON object for the "data" field
        const payload = {
          email: "trevor.spielman@gmail.com",
          data: JSON.stringify(p.value)
        }
        const body = JSON.stringify(payload)
      console.log('Sending POST body:', body)
      const res = await fetch(API_BASE + QUERY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const text = await res.text()
      alert('API response: ' + text)
    } catch (e) {
      alert('POST failed: ' + (e as Error).message)
    }
  }
  /**
   * Validates the current editor contents, then POSTs the stringified JSON
   * to the API in the required format: { email, data }.
   * Alerts with the API response or error.
   */

  function handleValidate() {
    const p = tryParse(validatedRaw)
    if (p.ok) {
      setParsedValue(p.value)
      setParsedOk(true)
      setParseError(null)
      setValidatedRaw(JSON.stringify(p.value, null, 2))
    } else {
      setParsedValue(null)
      setParsedOk(false)
      setParseError(p.error || 'Invalid JSON')
      console.warn('Validation failed:', p.error)
    }
  }
  /**
   * Manually validates the current editor contents, updating parsed state and
   * pretty-printing the JSON if valid. Shows a console message for success/failure.
   */

  return (
    <div className="app-root">
      <header className="header">
        <h1>Trevor Spielman JSON Validator</h1>
        <div className="controls">
          <button onClick={handleFetch} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch JSON'}
          </button>
          <button onClick={handleValidate} disabled={loading}>Validate Edited JSON</button>
          <button onClick={handleSubmit} disabled={!parsedOk || loading}>Submit Edited JSON</button>
        </div>
      </header>

      <main className="split">
        <section className="pane left">
          <h2>Original Response</h2>
          <pre className="mono">{originalRaw || 'Click "Fetch JSON" to load.'}</pre>
        </section>

        <section className="pane right">
          <h2>Editable JSON</h2>
          <textarea
            value={validatedRaw}
            onChange={(e) => setValidatedRaw(e.target.value)}
            className="editor"
            placeholder="Validated JSON will appear here"
          />
          <div className="status">
            {parseError ? <span className="error">Parse error: {parseError}</span> : <span>Format is Valid</span>}
          </div>
        </section>
      </main>
    </div>
  )
}
