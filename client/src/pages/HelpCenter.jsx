import React, { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./HelpCenter.css";

function HelpCenter() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const faqData = [
    {
      id: 1,
      category: "students",
      question: t("helpCenter.faqs.q1") || "How do I find the right tutor for my subject?",
      answer: t("helpCenter.faqs.a1") || "Finding a tutor is simple! Use the Job Board to post a tuition request with your specific requirements (subject, class, location, and salary). Tutors will then apply to your post, and you can review their profiles, ratings, and experience to choose the best match."
    },
    {
      id: 2,
      category: "teachers",
      question: t("helpCenter.faqs.q2") || "How do I apply for tuition jobs?",
      answer: t("helpCenter.faqs.a2") || "To apply for jobs, ensure your profile is 100% complete and verified. Browse the Job Board for available tuition requests. When you find a match, click 'Apply Now'. You can track your applications in your Teacher Dashboard."
    },
    {
      id: 3,
      category: "general",
      question: t("helpCenter.faqs.q3") || "Is EduConnect free to use?",
      answer: t("helpCenter.faqs.a3") || "EduConnect offers a free platform for students to post jobs and for teachers to browse. We may have premium features or small service fees for successful matches to help maintain the platform's security and quality of service."
    },
    {
      id: 4,
      category: "students",
      question: t("helpCenter.faqs.q4") || "What should I do if a tutor doesn't show up?",
      answer: t("helpCenter.faqs.a4") || "Safety and reliability are our priorities. If a tutor fails to show up, please report it immediately through the 'Report' button on their profile or contact our support team. We take these matters seriously and will investigate."
    },
    {
      id: 5,
      category: "teachers",
      question: t("helpCenter.faqs.q5") || "How can I increase my chances of getting hired?",
      answer: t("helpCenter.faqs.a5") || "A complete and professional profile is key. Upload a clear profile picture, provide detailed educational background, and maintain a high response rate to messages. Positive reviews from previous students also significantly boost your credibility."
    },
    {
      id: 6,
      category: "security",
      question: t("helpCenter.faqs.q6") || "How does EduConnect verify tutors?",
      answer: t("helpCenter.faqs.a6") || "We have a multi-step verification process. Tutors are required to upload their National ID (NID) and educational certificates. Our team manually reviews these documents before granting a 'Verified' badge to the tutor's profile."
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
          <h1>{t("helpCenter.heroTitle")}</h1>
          <p>{t("helpCenter.heroSubtitle")}</p>
          <div className="help-search-wrapper">
            <span className="help-search-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input 
              type="text" 
              className="help-search-input" 
              placeholder={t("helpCenter.searchPlaceholder")}
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
            {t("helpCenter.tabs.faq")}
          </button>
          <button 
            className={`help-nav-btn ${activeTab === "safety" ? "active" : ""}`}
            onClick={() => setActiveTab("safety")}
          >
            {t("helpCenter.tabs.safety")}
          </button>
          <button 
            className={`help-nav-btn ${activeTab === "guidelines" ? "active" : ""}`}
            onClick={() => setActiveTab("guidelines")}
          >
            {t("helpCenter.tabs.guidelines")}
          </button>
          <button 
            className={`help-nav-btn ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            {t("helpCenter.tabs.contact")}
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
                  <p>{t("helpCenter.noResults")?.replace("{query}", searchQuery)}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "safety" && (
          <section className="help-section">
            <div className="trust-safety-banner">
              <h2>{t("helpCenter.safety.title")}</h2>
              <p>{t("helpCenter.safety.subtitle")}</p>
              <div className="trust-safety-grid">
                <div className="trust-item">
                  <h3>{t("helpCenter.safety.verifiedTitle")}</h3>
                  <p>{t("helpCenter.safety.verifiedDesc")}</p>
                </div>
                <div className="trust-item">
                  <h3>{t("helpCenter.safety.secureTitle")}</h3>
                  <p>{t("helpCenter.safety.secureDesc")}</p>
                </div>
                <div className="trust-item">
                  <h3>{t("helpCenter.safety.reviewTitle")}</h3>
                  <p>{t("helpCenter.safety.reviewDesc")}</p>
                </div>
              </div>
            </div>
            <div className="help-grid">
              <div className="help-card">
                <h3>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  {t("helpCenter.safety.studentInfoTitle")}
                </h3>
                <p>{t("helpCenter.safety.studentInfoDesc")}</p>
              </div>
              <div className="help-card">
                <h3>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  {t("helpCenter.safety.tutorInfoTitle")}
                </h3>
                <p>{t("helpCenter.safety.tutorInfoDesc")}</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "guidelines" && (
          <section className="help-section">
            <div className="help-card" style={{ marginBottom: "2rem" }}>
              <h3>{t("helpCenter.guidelines.professionalismTitle")}</h3>
              <p>{t("helpCenter.guidelines.professionalismDesc")}</p>
            </div>
            <div className="help-card" style={{ marginBottom: "2rem" }}>
              <h3>{t("helpCenter.guidelines.integrityTitle")}</h3>
              <p>{t("helpCenter.guidelines.integrityDesc")}</p>
            </div>
            <div className="help-card" style={{ marginBottom: "2rem" }}>
              <h3>{t("helpCenter.guidelines.accuracyTitle")}</h3>
              <p>{t("helpCenter.guidelines.accuracyDesc")}</p>
            </div>
            <div className="help-card">
              <h3>{t("helpCenter.guidelines.paymentTitle")}</h3>
              <p>{t("helpCenter.guidelines.paymentDesc")}</p>
            </div>
          </section>
        )}

        {activeTab === "contact" && (
          <section className="help-section">
            <div className="support-container">
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h2>{t("helpCenter.contact.title")}</h2>
                <p>{t("helpCenter.contact.subtitle")}</p>
              </div>
              <form className="support-form" onSubmit={(e) => e.preventDefault()}>
                <div className="support-form-grid">
                  <label>
                    {t("helpCenter.contact.nameLabel")}
                    <input type="text" placeholder="John Doe" required />
                  </label>
                  <label>
                    {t("helpCenter.contact.emailLabel")}
                    <input type="email" placeholder="john@example.com" required />
                  </label>
                </div>
                <label>
                  {t("helpCenter.contact.subjectLabel")}
                  <select required>
                    <option value="">{t("helpCenter.contact.subjectPlaceholder")}</option>
                    <option value="account">{t("helpCenter.contact.topics.account")}</option>
                    <option value="verification">{t("helpCenter.contact.topics.verification")}</option>
                    <option value="payment">{t("helpCenter.contact.topics.payment")}</option>
                    <option value="report">{t("helpCenter.contact.topics.report")}</option>
                    <option value="other">{t("helpCenter.contact.topics.other")}</option>
                  </select>
                </label>
                <label>
                  {t("helpCenter.contact.messageLabel")}
                  <textarea placeholder={t("helpCenter.contact.messagePlaceholder")} required></textarea>
                </label>
                <button type="submit" className="btn btn-primary" style={{ justifySelf: "center", padding: "1rem 3rem" }}>
                  {t("helpCenter.contact.sendButton")}
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

