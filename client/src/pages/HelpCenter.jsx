import React, { useState } from "react";
import "./HelpCenter.css";

function HelpCenter() {
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const faqData = [
    {
      id: 1,
      category: "students",
      question: "How do I find the right tutor for my subject?",
      answer: "Finding a tutor is simple! Use the Job Board to post a tuition request with your specific requirements (subject, class, location, and salary). Tutors will then apply to your post, and you can review their profiles, ratings, and experience to choose the best match."
    },
    {
      id: 2,
      category: "teachers",
      question: "How do I apply for tuition jobs?",
      answer: "To apply for jobs, ensure your profile is 100% complete and verified. Browse the Job Board for available tuition requests. When you find a match, click 'Apply Now'. You can track your applications in your Teacher Dashboard."
    },
    {
      id: 3,
      category: "general",
      question: "Is EduConnect free to use?",
      answer: "EduConnect offers a free platform for students to post jobs and for teachers to browse. We may have premium features or small service fees for successful matches to help maintain the platform's security and quality of service."
    },
    {
      id: 4,
      category: "students",
      question: "What should I do if a tutor doesn't show up?",
      answer: "Safety and reliability are our priorities. If a tutor fails to show up, please report it immediately through the 'Report' button on their profile or contact our support team. We take these matters seriously and will investigate."
    },
    {
      id: 5,
      category: "teachers",
      question: "How can I increase my chances of getting hired?",
      answer: "A complete and professional profile is key. Upload a clear profile picture, provide detailed educational background, and maintain a high response rate to messages. Positive reviews from previous students also significantly boost your credibility."
    },
    {
      id: 6,
      category: "security",
      question: "How does EduConnect verify tutors?",
      answer: "We have a multi-step verification process. Tutors are required to upload their National ID (NID) and educational certificates. Our team manually reviews these documents before granting a 'Verified' badge to the tutor's profile."
    }
  ];

  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="help-center-page">
      <section className="help-hero">
        <div className="container">
          <h1>How can we help you?</h1>
          <p>Search our frequently asked questions or get in touch with our support team.</p>
          <div className="help-search-wrapper">
            <span className="help-search-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input 
              type="text" 
              className="help-search-input" 
              placeholder="Search for topics, e.g., 'verification' or 'payments'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container">
        <nav className="help-nav">
          <button 
            className={`help-nav-btn ${activeTab === "faq" ? "active" : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            FAQs
          </button>
          <button 
            className={`help-nav-btn ${activeTab === "safety" ? "active" : ""}`}
            onClick={() => setActiveTab("safety")}
          >
            Trust & Safety
          </button>
          <button 
            className={`help-nav-btn ${activeTab === "guidelines" ? "active" : ""}`}
            onClick={() => setActiveTab("guidelines")}
          >
            Community Guidelines
          </button>
          <button 
            className={`help-nav-btn ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            Contact Support
          </button>
        </nav>

        {activeTab === "faq" && (
          <section className="help-section">
            <div className="faq-list">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className={`faq-item ${openFaq === faq.id ? "open" : ""}`}>
                    <button className="faq-question" onClick={() => toggleFaq(faq.id)}>
                      {faq.question}
                      <span className="faq-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </span>
                    </button>
                    {openFaq === faq.id && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="help-card" style={{ textAlign: "center" }}>
                  <p>No results found for "{searchQuery}". Try a different keyword.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "safety" && (
          <section className="help-section">
            <div className="trust-safety-banner">
              <h2>Your Safety is Our Priority</h2>
              <p>We work tirelessly to ensure EduConnect remains a safe and reliable environment for education.</p>
              <div className="trust-safety-grid">
                <div className="trust-item">
                  <h3>Verified Profiles</h3>
                  <p>We manually verify IDs and certificates of all our premium tutors.</p>
                </div>
                <div className="trust-item">
                  <h3>Secure Communication</h3>
                  <p>Our in-app messaging keeps your personal details private until you're ready.</p>
                </div>
                <div className="trust-item">
                  <h3>Review System</h3>
                  <p>Transparent feedback from real students helps maintain high standards.</p>
                </div>
              </div>
            </div>
            <div className="help-grid">
              <div className="help-card">
                <h3>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Information for Students
                </h3>
                <p>Never share your home address or phone number publicly on the job board. Only share these details with tutors you've vetted through our messaging system. Always have a parent or guardian present during the first session.</p>
              </div>
              <div className="help-card">
                <h3>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Information for Tutors
                </h3>
                <p>Verify the identity of the student/parent before visiting a new location. Inform someone you trust about the tuition location and timing. If something feels wrong, trust your instincts and report the profile.</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "guidelines" && (
          <section className="help-section">
            <div className="help-card" style={{ marginBottom: "2rem" }}>
              <h3>1. Professionalism and Respect</h3>
              <p>All users must maintain a professional and respectful tone. Harassment, discrimination, or offensive language will lead to immediate account suspension. We foster a community built on mutual growth and respect.</p>
            </div>
            <div className="help-card" style={{ marginBottom: "2rem" }}>
              <h3>2. Academic Integrity</h3>
              <p>Tutors are here to help students understand concepts, not to do their homework or take exams for them. EduConnect strictly forbids any form of academic dishonesty or cheating services.</p>
            </div>
            <div className="help-card" style={{ marginBottom: "2rem" }}>
              <h3>3. Accuracy of Information</h3>
              <p>Users must provide accurate information in their profiles and job posts. Falsifying educational qualifications or identity is a violation of our terms and will result in permanent banning.</p>
            </div>
            <div className="help-card">
              <h3>4. Payment Safety</h3>
              <p>We recommend all payments be handled transparently. Do not participate in suspicious payment schemes. Always keep a record of your tuition hours and payments received/made.</p>
            </div>
          </section>
        )}

        {activeTab === "contact" && (
          <section className="help-section">
            <div className="support-container">
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h2>Get in Touch</h2>
                <p>Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.</p>
              </div>
              <form className="support-form" onSubmit={(e) => e.preventDefault()}>
                <div className="support-form-grid">
                  <label>
                    Your Name
                    <input type="text" placeholder="John Doe" required />
                  </label>
                  <label>
                    Email Address
                    <input type="email" placeholder="john@example.com" required />
                  </label>
                </div>
                <label>
                  Subject
                  <select required>
                    <option value="">Select a topic</option>
                    <option value="account">Account Issues</option>
                    <option value="verification">Verification Status</option>
                    <option value="payment">Payment & Refunds</option>
                    <option value="report">Report a User</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  Message
                  <textarea placeholder="How can we help you today?" required></textarea>
                </label>
                <button type="submit" className="btn btn-primary" style={{ justifySelf: "center", padding: "1rem 3rem" }}>
                  Send Message
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default HelpCenter;
