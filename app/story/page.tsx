"use client";

import { useEffect } from "react";

export default function QRFGroupPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap");

        :root {
          --black: #111111;
          --dark-gray: #222222;
          --medium-gray: #444444;
          --light-gray: #666666;
          --lighter-gray: #888888;
          --lightest-gray: #f5f5f5;
          --white: #ffffff;
          --border-color: #e0e0e0;
          --shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --black: #ffffff;
            --dark-gray: #e5e5e5;
            --medium-gray: #cccccc;
            --light-gray: #999999;
            --lighter-gray: #777777;
            --lightest-gray: #374151;
            --white: #374151;
            --border-color: #4b5563;
            --shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
        }

        .qrf-page-body {
          font-family: "Lexend", sans-serif;
          // background: #fafafa;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 120px); /* Adjust based on your header/footer height */
          padding: 40px 20px;
        }

        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.7s ease;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Floating Lines */
        .floating-line {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 100vh;
          background-color: var(--border-color);
          z-index: -1;
        }

        .floating-line:nth-child(2) {
          left: calc(50% - 200px);
        }

        .floating-line:nth-child(3) {
          left: calc(50% + 200px);
        }

        /* Container */
        .qrf-container {
          max-width: 100vw;
          width: 100%;
          margin: 0 auto;
        }

        /* Story Card */
        .story-card {
          background: var(--white);
          border-radius: 16px;
          padding: 60px 50px;
          // box-shadow: var(--shadow);
          // border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 80px;
          position: relative;
        }

        .header::after {
          content: '';
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 2px;
          background-color: var(--black);
        }

        .header h1 {
          font-size: 3.2rem;
          font-weight: 300;
          color: var(--black);
          margin-bottom: 15px;
          letter-spacing: -0.03em;
        }

        .header h1 strong {
          font-weight: 600;
        }

        .tagline {
          font-size: 1.1rem;
          color: var(--light-gray);
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 10px;
        }

        /* Milestones */
        .milestones-container {
          position: relative;
        }

        .timeline-line {
          position: absolute;
          left: 25px;
          top: 0;
          bottom: 0;
          width: 1px;
          background-color: var(--border-color);
          z-index: 0;
        }

        .milestone {
          position: relative;
          margin-bottom: 60px;
          padding-left: 70px;
        }

        .milestone:last-child {
          margin-bottom: 0;
        }

        .milestone-number {
          position: absolute;
          left: 0;
          top: 0;
          width: 50px;
          height: 50px;
          background: var(--white);
          color: var(--black);
          border-radius: 50%;
          border: 1px solid var(--black);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 500;
          z-index: 1;
          transition: var(--transition);
        }

        .milestone:hover .milestone-number {
          background-color: var(--black);
          color: var(--white);
        }

        .milestone-header {
          display: flex;
          align-items: center;
          margin-bottom: 25px;
          gap: 15px;
        }

        .milestone-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: var(--lightest-gray);
          color: var(--black);
          font-size: 1.2rem;
          flex-shrink: 0;
          border: 1px solid var(--border-color);
          font-weight: 500;
        }

        .milestone h2 {
          color: var(--black);
          font-size: 1.6rem;
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: -0.02em;
        }

        .milestone-content {
          color: var(--medium-gray);
          line-height: 1.8;
          font-size: 1.05rem;
          letter-spacing: -0.01em;
        }

        .milestone-content p {
          margin-bottom: 20px;
        }

        .milestone-content strong {
          font-weight: 500;
          color: var(--black);
        }

        .milestone-content ul {
          margin-left: 20px;
          margin-top: 15px;
          margin-bottom: 25px;
        }

        .milestone-content li {
          margin-bottom: 10px;
          position: relative;
          padding-left: 5px;
          list-style: none;
        }

        .milestone-content li::before {
          content: '—';
          color: var(--light-gray);
          position: absolute;
          left: -15px;
        }

        .amount-highlight {
          font-weight: 500;
          color: var(--black);
          background-color: var(--lightest-gray);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          font-family: 'Lexend', monospace;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        /* Divider */
        .divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 60px 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 2px;
          background-color: var(--black);
        }

        /* Highlight Section */
        .highlight-section {
          background-color: var(--lightest-gray);
          padding: 50px;
          border-radius: 12px;
          text-align: center;
          margin: 70px 0 60px;
          border: 1px solid var(--border-color);
          position: relative;
        }

        .highlight-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background-color: var(--black);
        }

        .highlight-section h2 {
          font-size: 1.8rem;
          font-weight: 400;
          color: var(--black);
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }

        .highlight-section p {
          font-size: 1.05rem;
          line-height: 1.8;
          margin-bottom: 20px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          letter-spacing: -0.01em;
        }

        .date-display {
          font-size: 2.2rem;
          font-weight: 300;
          color: var(--black);
          margin: 30px 0;
          letter-spacing: 0.1em;
          font-family: 'Lexend', sans-serif;
        }

        .date-display::before, .date-display::after {
          content: '•';
          color: var(--light-gray);
          margin: 0 15px;
          font-weight: 300;
        }

        /* Footer CTA */
        .footer-cta {
          text-align: center;
          padding-top: 60px;
          border-top: 1px solid var(--border-color);
          margin-top: 60px;
        }

        .footer-cta h2 {
          font-size: 2rem;
          font-weight: 300;
          color: var(--black);
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }

        .footer-cta p {
          font-size: 1.05rem;
          margin-bottom: 10px;
          color: var(--light-gray);
          letter-spacing: -0.01em;
        }

        /* Button */
        .cta-button {
          display: inline-block;
          margin-top: 40px;
          padding: 16px 40px;
          background-color: transparent;
          color: var(--black);
          font-size: 1rem;
          font-weight: 500;
          border-radius: 0;
          text-decoration: none;
          transition: var(--transition);
          border: 1px solid var(--black);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.05em;
          font-family: 'Lexend', sans-serif;
        }

        .cta-button:hover {
          background-color: var(--black);
          color: var(--white);
        }

        .cta-button::after {
          content: '→';
          margin-left: 10px;
          transition: var(--transition);
          font-weight: 400;
        }

        .cta-button:hover::after {
          transform: translateX(5px);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .story-card {
            padding: 50px 40px;
          }
          
          .header h1 {
            font-size: 2.8rem;
          }
          
          .timeline-line {
            left: 20px;
          }
          
          .milestone {
            padding-left: 60px;
          }
          
          .milestone-number {
            width: 45px;
            height: 45px;
          }
        }

        @media (max-width: 768px) {
          .qrf-page-body {
            padding: 30px 15px;
          }
          
          .story-card {
            padding: 40px 30px;
            border-radius: 12px;
          }
          
          .header {
            margin-bottom: 60px;
          }
          
          .header h1 {
            font-size: 2.2rem;
            letter-spacing: -0.025em;
          }
          
          .tagline {
            font-size: 0.9rem;
            letter-spacing: 0.12em;
          }
          
          .timeline-line {
            display: none;
          }
          
          .milestone {
            padding-left: 0;
            padding-top: 50px;
          }
          
          .milestone-number {
            top: 0;
            left: 0;
          }
          
          .milestone-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
            margin-top: 15px;
          }
          
          .milestone h2 {
            font-size: 1.4rem;
            letter-spacing: -0.015em;
          }
          
          .highlight-section {
            padding: 30px 20px;
            margin: 50px 0;
          }
          
          .highlight-section h2 {
            font-size: 1.5rem;
            letter-spacing: -0.015em;
          }
          
          .date-display {
            font-size: 1.8rem;
            letter-spacing: 0.08em;
          }
          
          .footer-cta h2 {
            font-size: 1.6rem;
            letter-spacing: -0.015em;
          }
          
          .floating-line:nth-child(2),
          .floating-line:nth-child(3) {
            display: none;
          }
          
          .milestone-content {
            font-size: 1rem;
            letter-spacing: -0.005em;
          }
        }

        @media (max-width: 480px) {
          .story-card {
            padding: 30px 20px;
          }
          
          .header h1 {
            font-size: 1.8rem;
            letter-spacing: -0.02em;
          }
          
          .milestone-number {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
          
          .milestone h2 {
            font-size: 1.2rem;
            letter-spacing: -0.01em;
          }
          
          .highlight-section {
            padding: 25px 15px;
          }
          
          .date-display {
            font-size: 1.5rem;
            letter-spacing: 0.06em;
          }
          
          .cta-button {
            padding: 14px 30px;
            font-size: 0.9rem;
            letter-spacing: 0.04em;
          }
        }
      `}</style>

      {/* Floating Lines Background */}


      {/* Main Content - Centered Properly */}
      <div className="qrf-page-body">
        <div className="qrf-container">
          <div className="story-card">
            {/* Header */}
            <div className="header fade-in">
              <h1><strong>QRF</strong> Group</h1>
              <div className="tagline">Vision, Growth & Impact</div>
            </div>

            {/* Milestones */}
            <div className="milestones-container">
              <div className="timeline-line"></div>
              
              {/* Milestone 1 */}
              <div className="milestone fade-in">
                <div className="milestone-number">1</div>
                <div className="milestone-header">
                  <div className="milestone-icon">UK</div>
                  <h2>Major Investment from Renovet Group, U.K.</h2>
                </div>
                <div className="milestone-content">
                  <p>In a landmark achievement that validates our vision and dedication, Renovet Group (United Kingdom) has formally offered to invest <span className="amount-highlight">€5 million</span> in QRF Group&apos;s Indian venture. This prestigious investment from one of the UK&apos;s most respected business entities represents not just financial backing, but a strong vote of confidence in our business model, growth trajectory, and commitment to excellence.</p>
                  <p><strong>This transformative partnership marks a significant milestone and a proud achievement for every member associated with the Group.</strong> The investment will fuel our expansion plans, strengthen our market position, and enable us to scale operations across multiple verticals. It&apos;s a testament to the hard work, dedication, and unwavering commitment of our entire team who have built QRF Group into a venture worthy of international recognition and investment.</p>
                </div>
              </div>

              <div className="divider"></div>

              {/* Milestone 2 */}
              <div className="milestone fade-in">
                <div className="milestone-number">2</div>
                <div className="milestone-header">
                  <div className="milestone-icon">UAE</div>
                  <h2>Strategic Expansion in the UAE</h2>
                </div>
                <div className="milestone-content">
                  <p>QRF Group has successfully conducted several high-level strategic meetings in the United Arab Emirates, positioning ourselves at the heart of Middle Eastern business opportunities. These discussions have opened doors to unprecedented growth prospects in one of the world&apos;s most dynamic and rapidly evolving markets.</p>
                  <p>Major business groups, including the prestigious <strong>Pollent Group</strong> and other industry leaders, have shown exceptional interest in launching QRF projects across the UAE. These partnerships represent potential investments worth <span className="amount-highlight">millions of dirhams</span>, creating a strong foundation for our regional expansion strategy.</p>
                  <p>The UAE market offers immense potential with its cosmopolitan population, strong purchasing power, and appetite for innovative, high-quality products. Our expansion into this region will not only diversify our revenue streams but also establish QRF Group as a truly international brand with a significant presence in the Middle East.</p>
                </div>
              </div>

              <div className="divider"></div>

              {/* Milestone 3 */}
              <div className="milestone fade-in">
                <div className="milestone-number">3</div>
                <div className="milestone-header">
                  <div className="milestone-icon">V</div>
                  <h2>Revolutionary Product Line – Vegan & Gluten-Free</h2>
                </div>
                <div className="milestone-content">
                  <p>In response to the growing global demand for healthier, more sustainable food options, QRF Group is launching an extensive and innovative range of <strong>vegan and gluten-free products</strong>. This new product line represents our commitment to meeting the evolving needs of health-conscious consumers while maintaining the highest standards of quality, taste, and nutrition.</p>
                  <p>Our strategic focus is on aggressive expansion into <strong>Tier-3 cities across India</strong> – a largely untapped market with tremendous growth potential. While metro cities and Tier-1 locations already have access to premium health products, millions of people in smaller cities have been waiting for access to quality vegan and gluten-free alternatives. QRF Group is bridging this gap, democratizing access to healthier lifestyle choices for a much larger population.</p>
                  <p>This expansion strategy is not just about business growth; it&apos;s about creating a positive impact on public health by making nutritious, allergen-free, and plant-based options accessible and affordable to communities across India.</p>
                </div>
              </div>

              <div className="divider"></div>

              {/* Milestone 4 */}
              <div className="milestone fade-in">
                <div className="milestone-number">4</div>
                <div className="milestone-header">
                  <div className="milestone-icon">❤</div>
                  <h2>Commitment to Social Contribution</h2>
                </div>
                <div className="milestone-content">
                  <p>At QRF Group, we firmly believe that true success is measured not just by financial growth, but by the positive impact we create in society. With this philosophy at our core, QRF Group has made a solemn pledge to dedicate a significant and substantial portion of its profits toward meaningful social causes that address critical needs in our communities.</p>
                  <p><strong>Our social contribution initiatives span multiple areas of critical importance:</strong></p>
                  <ul>
                    <li><strong>Support for Gaushalas (Cow Shelters):</strong> Providing financial assistance and resources to cow shelters across India</li>
                    <li><strong>Assistance to Old-Age Homes:</strong> Supporting senior citizens who need care, companionship, and dignity</li>
                    <li><strong>Welfare Programs for Widows:</strong> Empowering widows through financial support and skill development</li>
                    <li><strong>Educational Initiatives:</strong> Breaking the cycle of poverty through education for underprivileged children</li>
                  </ul>
                  <p>These initiatives reflect our unwavering commitment to being a responsible corporate citizen and using our success as a platform to uplift those who need support the most.</p>
                </div>
              </div>

              <div className="divider"></div>

              {/* Milestone 5 */}
              <div className="milestone fade-in">
                <div className="milestone-number">5</div>
                <div className="milestone-header">
                  <div className="milestone-icon">↗️</div>
                  <h2>Transformative Joint Ventures</h2>
                </div>
                <div className="milestone-content">
                  <p>In a landmark collaboration that combines spiritual values with social action, QRF Group has initiated a joint venture with the revered <strong>Neem Karoli Baba Trust</strong>. This partnership is dedicated to supporting and uplifting the weaker and most vulnerable sections of society.</p>
                  <p><strong>Flagship Social Infrastructure Projects:</strong></p>
                  <ul>
                    <li><strong>Modern Old-Age Home in Vrindavan:</strong> State-of-the-art facility designed with compassion and dignity</li>
                    <li><strong>Free Animal Hospital in Bandhavgarh:</strong> Comprehensive veterinary hospital providing completely free medical care</li>
                  </ul>
                  <p><strong>QRF Group&apos;s Commitment:</strong> These are not profit-driven ventures. QRF Group will fully fund, construct, and support these noble projects, ensuring that all services are provided at absolutely zero cost to beneficiaries. This represents our genuine commitment to social welfare, where the only return we seek is the wellbeing and happiness of those we serve.</p>
                </div>
              </div>
            </div>

            {/* Highlight Section */}
            <div className="highlight-section fade-in">
              <h2>Save the Date</h2>
              <p><strong>Grand Investment Meet & International Business Conclave</strong></p>
              <div className="date-display">March 2026 | United Arab Emirates</div>
              <p>QRF Group is proud to announce a mega international investment meet and business conclave in the United Arab Emirates in March 2026. This landmark event will bring together visionary investors, dedicated channel partners, strategic business associates, and industry leaders from across the globe under one roof.</p>
              <p>This exclusive gathering will feature keynote presentations on our growth trajectory, detailed business expansion plans, investment opportunities, networking sessions, and the unveiling of exciting new ventures. It&apos;s an opportunity to be part of history as we chart the next phase of QRF Group&apos;s international journey.</p>
              <p><strong>All partners, investors, and associates are cordially invited to be part of this international event.</strong></p>
            </div>

            {/* Footer CTA */}
            <div className="footer-cta fade-in">
              <h2>Join Us on This Journey</h2>
              <p>Be part of a group that&apos;s transforming business and society</p>
              <p><strong>QRF Group – Growing Together, Giving Back</strong></p>
              <button 
                className="cta-button"
                onClick={() => {
                  window.location.href = "/franchise-details";
                }}
              >
                Express Interest
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}