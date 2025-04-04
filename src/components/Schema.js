import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Schema.css';
import EnhancedAnimation from './EnhancedAnimation';

function Schema() {
  const [englishQuery, setEnglishQuery] = useState('');
  const [generatedSchema, setGeneratedSchema] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEnglishQueryChange = (e) => {
    setEnglishQuery(e.target.value);
  };

  const handleConvertToSql = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = {
        prompt: englishQuery,
        output_format: "json"
      };

      const response = await fetch("http://localhost:5000/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.status === "error") {
        setError(`Error: ${data.message}`);
      } else {
        setGeneratedSchema(data.data);
      }
    } catch (err) {
      setError('Failed to generate schema. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSchemaTables = () => {
    if (!generatedSchema?.tables) return null;

    return generatedSchema.tables.map((table, index) => (
      <div key={index} className="schema-table-container">
        <h3 className="schema-table-name">{table.name}</h3>
        <table className="schema-table">
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
              <th>Constraints</th>
            </tr>
          </thead>
          <tbody>
            {table.columns.map((column, colIndex) => (
              <tr key={colIndex}>
                <td>
                  {column.name}
                  {column.primary_key && <span className="pk-marker"> PK</span>}
                </td>
                <td>{column.data_type}</td>
                <td>
                  {column.foreign_key && (
                    <span className="fk-relation">
                      FK → {column.foreign_key.table}.{column.foreign_key.column}
                    </span>
                  )}
                  {column.unique && !column.primary_key && <span>Unique</span>}
                  {column.default !== null && (
                    <span>Default: {column.default}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  return (
    <div className="app">
      <EnhancedAnimation />
      
      <main className="main-content">
        <div className="container">
          <div className="page-header">
            <h1 className="glow-text">Database Schema Generator</h1>
            <p className="subtitle">Convert your requirements into a complete database schema</p>
          </div>
          
          <div className="editor-layout">
            <div className="input-form-container">
              <div className="card">
                <div className="card-header">
                  <h2>Schema Requirements</h2>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Describe your database needs:</label>
                    <textarea 
                      value={englishQuery}
                      onChange={handleEnglishQueryChange}
                      rows="6"
                      placeholder="Example: Create a database schema for a hospital with doctors, patients, appointments, and prescriptions"
                      className="input-field textarea"
                    ></textarea>
                  </div>
                  
                  <button 
                    className="btn primary glow-effect full-width"
                    onClick={handleConvertToSql}
                    disabled={isLoading || !englishQuery.trim()}
                  >
                    {isLoading ? 'Generating Schema...' : 'Generate Schema'}
                  </button>
                </div>
              </div>
            </div>

            <div className="result-container">
              <div className="card schema-result">
                <div className="card-header">
                  <h2>Generated Database Schema</h2>
                </div>
                <div className="card-body">
                  {error && (
                    <div className="error-message">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {isLoading && !generatedSchema && (
                    <div className="loading-indicator">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                      </svg>
                      <span>Generating schema...</span>
                    </div>
                  )}

                  {generatedSchema && (
                    <div className="schema-content">
                      {renderSchemaTables()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Schema;