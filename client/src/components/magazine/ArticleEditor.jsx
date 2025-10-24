import React, { useState, useEffect } from 'react';
import './ArticleEditor.css'; // Assuming a corresponding CSS file

// Mock data for an article
const mockArticle = {
  id: 'art-001',
  title: 'The Future of AI in Content Creation',
  content: 'Artificial intelligence is rapidly transforming the landscape of content generation. Tools like Magazinify-AI leverage advanced LLMs to draft articles, summarize data, and even suggest visual elements, dramatically reducing the time and cost associated with producing high-quality publications. This shift empowers businesses to maintain a consistent and engaging content strategy without the need for large editorial teams...',
  author: 'AI Generated Draft',
  status: 'Draft',
  wordCount: 120,
};

const ArticleEditor = ({ articleId }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch article data
    setTimeout(() => {
      setArticle(mockArticle);
      setLoading(false);
    }, 800);
  }, [articleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticle(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app, this would be an API call to save the article
    console.log('Saving article:', article);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('Article saved successfully!');
  };

  const handleAIGenerate = () => {
    alert('AI content generation triggered! (Simulated)');
    // In a real app, this would trigger an API call to the OpenAI service
  };

  if (loading) {
    return <div className="article-editor-loading">Loading article editor...</div>;
  }

  if (!article) {
    return <div className="article-editor-error">Article not found.</div>;
  }

  return (
    <div className="article-editor-container">
      <header className="article-editor-header">
        <h1>Edit Article: {article.title}</h1>
        <div className="header-actions">
          <button className="ai-generate-button" onClick={handleAIGenerate}>
            Regenerate with AI
          </button>
          <button className="save-button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="editor-content">
        <section className="article-metadata">
          <div className="input-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={article.title}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="author">Author</label>
            <input
              id="author"
              name="author"
              type="text"
              value={article.author}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label>Word Count</label>
            <p className="word-count-display">{article.content.split(/\s+/).filter(word => word.length > 0).length}</p>
          </div>
        </section>

        <section className="article-body">
          <label htmlFor="content">Article Body</label>
          <textarea
            id="content"
            name="content"
            value={article.content}
            onChange={handleChange}
            rows="20"
          />
        </section>
      </div>
    </div>
  );
};
