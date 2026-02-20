import React from 'react';

function Contact() {
  return (
    <div className="page">
      <h1>Contact Us</h1>
      <p className="subtitle">Get in touch with the Campus Marketplace team.</p>

      <div className="contact-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#00d2ff', marginBottom: '0.5rem' }}>Email</h3>
          <p style={{ fontSize: '1.1rem' }}>
            <a href="mailto:adarshk5478953@gmail.com" style={{ color: '#621717' }}>
              adarshk5478953@gmail.com
            </a>
          </p>
        </div>

        <div>
          <h3 style={{ color: '#ff007f', marginBottom: '0.5rem' }}>Location</h3>
          <p style={{ fontSize: '1.1rem', color: '#621717' }}>
            Lucknow, Uttar Pradesh, India
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
