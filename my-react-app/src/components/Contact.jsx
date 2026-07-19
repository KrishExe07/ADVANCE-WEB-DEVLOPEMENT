import { useState } from 'react'

function Contact() {
  const [message, setMessage] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  return (
    <section className="content-section contact-section">
      <div className="section-heading">
        <p className="section-kicker">Contact</p>
        <h2>Get in Touch</h2>
      </div>

      <div className="contact-layout">
        <div className="footer-card contact-info">
          <p>
            <strong>Name:</strong> Krish Patel
          </p>
          <p>
            <strong>Enrollment No.:</strong> 24IT068
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:krishpatel@example.com">krishpatel@example.com</a>
          </p>
        </div>

        <form className="contact-form footer-card" onSubmit={(event) => event.preventDefault()}>
          <div className="contact-form__header">
            <label htmlFor="message">Your Message</label>
            <button
              type="button"
              className="help-toggle"
              aria-expanded={showHelp}
              onClick={() => setShowHelp((visible) => !visible)}
            >
              {showHelp ? 'Hide Help' : 'Show Help'}
            </button>
          </div>

          {showHelp && (
            <p className="help-tooltip" role="status">
              Type a short introduction or question. Your message preview updates as you type.
            </p>
          )}

          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Write your message here..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          <p className="character-count">{message.length} characters</p>

          {message && (
            <div className="message-preview">
              <strong>Live Preview</strong>
              <p>{message}</p>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

export default Contact
