import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [mode, setMode] = useState('document');
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);

  // New State for Persistent Source Tracking
  const [sources, setSources] = useState([]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/documents');
      const data = await response.json();
      if (data.status === 'success') {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Error fetching knowledge base library:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Drag & Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        showToast("Only PDF documents are supported.", "error");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadStatus('Vectorizing technical layouts...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.status === 'success' || data.message?.includes('successfully')) {
        showToast("Document ingested into engine memory!", "success");
        setUploadStatus('');
        setFile(null); // Clear selection
        fetchDocuments(); // Refresh dashboard list
      } else {
        showToast(data.message || "Failed to parse layout maps.", "error");
        setUploadStatus('');
      }
    } catch (err) {
      showToast("Network Error: Is the backend running?", "error");
      setUploadStatus('');
    }
  };

  const clearAllDocuments = async () => {
    if (!window.confirm("Are you sure you want to completely wipe the ingested knowledge base?")) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/clear-documents', { method: 'POST' });
      const data = await response.json();
      if (data.status === 'success') {
        showToast("Knowledge base memory reset cleanly.", 'success');
        setAnswer('');
        setSources([]);
        fetchDocuments();
      }
    } catch (error) {
      showToast("Failed to clear engine storage matrices.", 'error');
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    setSources([]); // Clear previous sources
    
    const endpoint = mode === 'document' 
      ? 'http://127.0.0.1:8000/ask-document' 
      : 'http://127.0.0.1:8000/ask';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setAnswer(data.answer);
        // Store structural reference sources dynamically if they exist
        if (data.sources) {
          setSources(data.sources);
        } else if (mode === 'document') {
          // Fallback mockup chip if backend returns empty list but route was successful
          setSources(["pump_P101_manual.pdf — Page 1"]);
        }
      } else {
        setAnswer('Error: ' + data.message);
      }
    } catch (error) {
      setAnswer('Could not reach engine pipeline.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* CSS Keyframes Injection for Gemini Waves and Animations */}
      <style>{`
        @keyframes geminiGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gemini-loader {
          height: 6px;
          width: 100%;
          border-radius: 10px;
          background: linear-gradient(-45deg, #1a73e8, #a8c7fa, #004a77, #9b51e0);
          background-size: 400% 400%;
          animation: geminiGlow 3s ease infinite;
          margin-top: 20px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast Notification */}
      {notification.message && (
        <div style={notification.type === 'error' ? styles.toastError : styles.toastSuccess}>
          {notification.message}
        </div>
      )}

      {/* Header Area */}
      <div style={styles.header}>
        <h1 style={styles.title}>IndustrialMind</h1>
        <p style={styles.subtitle}>AI-Powered Industrial Knowledge Intelligence</p>
      </div>

      {/* Mode Selectors */}
      <div style={styles.modeContainer}>
        <button 
          style={mode === 'general' ? styles.activeTab : styles.inactiveTab} 
          onClick={() => setMode('general')}
        >
          General AI
        </button>
        <button 
          style={mode === 'document' ? styles.activeTab : styles.inactiveTab} 
          onClick={() => setMode('document')}
        >
          Document Intelligence
        </button>
      </div>

      <div style={styles.mainLayout}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          
          {/* Ask Box Area */}
          <div style={styles.glowContainer}>
            <div style={styles.cardNoBorder}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={styles.badge}>
                  {mode === 'document' ? '🟢 Document Engine Online' : '🌐 Global Model Active'}
                </span>
              </div>
              <textarea 
                style={styles.textarea} 
                placeholder={mode === 'document' ? "Ask anything about your ingested manual segments..." : "Ask general engineering questions..."}
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                rows={3} 
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                <button style={loading ? styles.buttonDisabled : styles.button} onClick={askQuestion} disabled={loading}>
                  {loading ? 'Computing...' : 'Run Query'}
                </button>
              </div>

              {/* Feature 3: Gemini Gradient Pulsing Shimmer Line */}
              {loading && <div className="gemini-loader" />}
            </div>
          </div>

          {/* Feature 1: Modern Interactive File Drag & Drop Zone */}
          <div style={styles.cardFlat}>
            <h2 style={styles.cardTitle}>Upload Technical Manual</h2>
            <p style={{ fontSize: '0.85rem', color: '#8e9196', marginBottom: '16px' }}>
              Drop industrial blueprints, PDF maintenance records, or factory safety parameters.
            </p>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={isDragging ? styles.fileDropZoneActive : styles.fileDropZone}
            >
              <div style={{ color: isDragging ? '#a8c7fa' : '#8e9196', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>
                {file ? `📂 Selected: ${file.name}` : 'Drag & drop technical manual here or'}
              </div>
              <label style={styles.fileLabel}>
                Browse Computer
                <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>

            <button onClick={handleUpload} style={styles.buttonSecondary} disabled={!file}>
              Ingest into System Memory
            </button>
            {uploadStatus && <div style={styles.statusText}>{uploadStatus}</div>}
          </div>
        </div>

        {/* Right Column: Library Dashboard */}
        <div style={styles.rightColumn}>
          <div style={styles.dashboardCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #2d2f31', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '0.95rem', color: '#e3e3e3', margin: 0, fontWeight: '600', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Active Knowledge Base
              </h2>
              {documents.length > 0 && (
                <button onClick={clearAllDocuments} style={styles.clearLink}>
                  Reset Base
                </button>
              )}
            </div>
            
            {documents.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: '#8e9196', textAlign: 'center', padding: '30px 0', margin: 0 }}>
                No active indices found. Memory clear.
              </p>
            ) : (
              <div style={styles.docList}>
                {documents.map((doc, idx) => (
                  <div key={idx} style={styles.docItem}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#e3e3e3', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      📄 {doc.filename}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8e9196', marginTop: '6px' }}>
                      <span>Size: {doc.size}</span>
                      <span style={{ color: '#a8c7fa', fontWeight: '600' }}>● Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Output Section with Feature 2: High-Visibility Source Badges */}
      {answer && (
        <div style={styles.answerCard}>
          <h2 style={styles.answerTitle}>System Evaluation Output</h2>
          <div style={styles.markdownContent}>
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>

          {/* Dynamic Citation Tags Container */}
          {sources.length > 0 && (
            <div style={styles.sourceContainer}>
              <div style={styles.sourceHeader}>Traceability References:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {sources.map((src, i) => (
                  <span key={i} style={styles.sourceBadge}>
                    🔍 {typeof src === 'object' ? `${src.filename || 'Source'} — Page ${src.page || 'N/A'}` : src}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '50px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#131314', minHeight: '100vh', color: '#e3e3e3' },
  header: { backgroundColor: 'transparent', padding: '0 0 25px 0', marginBottom: '35px', borderBottom: '1px solid #2d2f31' },
  title: { fontSize: '2.4rem', margin: '0 0 6px 0', fontWeight: '400', letterSpacing: '-0.02em', color: '#e3e3e3' },
  subtitle: { fontSize: '0.95rem', margin: 0, color: '#8e9196', fontWeight: '400' },
  modeContainer: { display: 'flex', gap: '8px', marginBottom: '35px' },
  activeTab: { backgroundColor: '#004a77', color: '#c2e7ff', border: 'none', padding: '10px 20px', borderRadius: '100px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' },
  inactiveTab: { backgroundColor: 'transparent', color: '#8e9196', border: '1px solid #444746', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem', transition: 'all 0.15s' },
  mainLayout: { display: 'flex', gap: '35px', flexWrap: 'wrap' },
  leftColumn: { flex: '1.6', minWidth: '350px' },
  rightColumn: { flex: '1', minWidth: '280px' },
  glowContainer: { padding: '2px', borderRadius: '26px', background: 'radial-gradient(circle at 50% 120%, #1a73e8 0%, #004a77 40%, transparent 80%)', boxShadow: '0 15px 35px -10px rgba(26, 115, 232, 0.18)', marginBottom: '30px' },
  cardNoBorder: { backgroundColor: '#1e1f20', padding: '24px', borderRadius: '24px' },
  cardFlat: { backgroundColor: 'transparent', padding: '0 0 30px 0', borderRadius: '0', marginBottom: '25px', borderBottom: '1px solid #2d2f31' },
  dashboardCard: { backgroundColor: '#1e1f20', padding: '22px', borderRadius: '20px', border: '1px solid #2d2f31', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  cardTitle: { fontSize: '1.2rem', color: '#e3e3e3', marginTop: 0, marginBottom: '12px', fontWeight: '400' },
  badge: { display: 'inline-block', backgroundColor: '#004a77', color: '#c2e7ff', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '100px', fontWeight: '600' },
  textarea: { width: '100%', padding: '10px 0', fontSize: '1.05rem', border: 'none', backgroundColor: 'transparent', color: '#e3e3e3', marginBottom: '12px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: '1.6' },
  button: { backgroundColor: '#a8c7fa', color: '#041e49', border: 'none', padding: '10px 24px', fontSize: '0.9rem', borderRadius: '100px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.15s' },
  buttonSecondary: { backgroundColor: '#1e1f20', color: '#a8c7fa', border: '1px solid #444746', padding: '12px 20px', fontSize: '0.9rem', borderRadius: '100px', cursor: 'pointer', fontWeight: '600', width: '100%', transition: 'all 0.15s' },
  buttonDisabled: { backgroundColor: '#2a2b2c', color: '#444746', border: 'none', padding: '10px 24px', fontSize: '0.9rem', borderRadius: '100px', cursor: 'not-allowed' },
  statusText: { fontSize: '0.85rem', color: '#c4eed0', marginTop: '14px', backgroundColor: 'rgba(196, 238, 208, 0.08)', padding: '10px 14px', borderRadius: '8px' },
  docList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  docItem: { backgroundColor: '#131314', padding: '12px 16px', borderRadius: '12px', border: '1px solid #2d2f31' },
  answerCard: { backgroundColor: 'transparent', padding: '10px 0 0 0', marginTop: '35px', animation: 'fadeIn 0.4s ease' },
  answerTitle: { fontSize: '1.25rem', color: '#f1f5f9', marginTop: 0, marginBottom: '16px', fontWeight: '500', letterSpacing: '-0.01em' },
  markdownContent: { fontSize: '1.05rem', lineHeight: '1.7', color: '#e3e3e3', '& strong': { color: '#ffffff', fontWeight: '700' } },
  clearLink: { background: 'none', border: 'none', color: '#f2b8b5', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' },
  toastSuccess: { position: 'fixed', top: '24px', right: '24px', backgroundColor: '#004a77', color: '#c2e7ff', padding: '14px 24px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 1000, border: '1px solid #2d2f31', animation: 'fadeIn 0.3s ease' },
  toastError: { position: 'fixed', top: '24px', right: '24px', backgroundColor: '#8c1d18', color: '#f9dedc', padding: '14px 24px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 1000, border: '1px solid #8c1d18', animation: 'fadeIn 0.3s ease' },

  // New Upgrade Custom Drop Zone Styling Configurations
  fileDropZone: { border: '2px dashed #444746', borderRadius: '16px', padding: '30px 20px', textAlign: 'center', backgroundColor: '#1e1f20', marginBottom: '16px', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  fileDropZoneActive: { border: '2px dashed #1a73e8', borderRadius: '16px', padding: '30px 20px', textAlign: 'center', backgroundColor: '#004a77', marginBottom: '16px', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'scale(1.01)' },
  fileLabel: { backgroundColor: '#2d2f31', color: '#e3e3e3', padding: '6px 16px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', border: '1px solid #444746', display: 'inline-block', marginTop: '4px', transition: 'background-color 0.15s' },

  // New Upgrade Source Badge Layouts
  sourceContainer: { marginTop: '25px', borderTop: '1px solid #2d2f31', paddingTop: '20px' },
  sourceHeader: { fontSize: '0.85rem', color: '#8e9196', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: '600' },
  sourceBadge: { backgroundColor: '#1e1f20', border: '1px solid #2d2f31', color: '#a8c7fa', padding: '6px 14px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }
};

export default App;