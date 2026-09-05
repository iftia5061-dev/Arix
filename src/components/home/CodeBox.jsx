import { useState, useEffect } from 'react'
import './CodeBox.css'

const codeSnippets = [
  `const createAI = async () => {
  const model = await loadModel('gpt-4');
  const response = await model.generate({
    prompt: 'Build the future',
    temperature: 0.7
  });
  return response.data;
};`,
  `const buildSaaS = () => {
  const features = [
    'Authentication',
    'Database',
    'API Integration'
  ];
  return features.map(f => ({
    name: f,
    status: 'active'
  }));
};`,
  `const deployApp = async () => {
  await cloud.deploy({
    platform: 'AWS',
    region: 'us-east-1',
    scale: 'auto'
  });
  console.log('Deployed! 🚀');
};`
]

function CodeBox() {
  const [currentSnippet, setCurrentSnippet] = useState(0)
  const [typedCode, setTypedCode] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    let timeout
    let charIndex = 0
    const currentCode = codeSnippets[currentSnippet]

    const typeCode = () => {
      if (charIndex < currentCode.length) {
        setTypedCode(currentCode.slice(0, charIndex + 1))
        charIndex++
        timeout = setTimeout(typeCode, 30)
      } else {
        setIsTyping(false)
        timeout = setTimeout(() => {
          setCurrentSnippet((prev) => (prev + 1) % codeSnippets.length)
          setTypedCode('')
          setIsTyping(true)
        }, 3000)
      }
    }

    if (isTyping) {
      typeCode()
    }

    return () => clearTimeout(timeout)
  }, [currentSnippet])

  const syntaxHighlight = (code) => {
    return code
      .replace(/(const|let|var|async|await|return|import|from|function|class|if|else|for|while)/g, '<span class="syntax-keyword">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, '<span class="syntax-string">$1</span>')
      .replace(/(\d+)/g, '<span class="syntax-number">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="syntax-comment">$1</span>')
      .replace(/(\.\w+)/g, '<span class="syntax-property">$1</span>')
      .replace(/([\{\}\[\]\(\)])/g, '<span class="syntax-bracket">$1</span>')
  }

  return (
    <div className="code-box">
      <div className="code-box-header">
        <div className="code-box-dots">
          <span className="code-box-dot code-box-dot-red"></span>
          <span className="code-box-dot code-box-dot-yellow"></span>
          <span className="code-box-dot code-box-dot-green"></span>
        </div>
        <div className="code-box-title">app.js</div>
        <div className="code-box-actions">
          <span className="code-box-action">✕</span>
        </div>
      </div>
      <div className="code-box-content">
        <pre className="code-box-code">
          <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(typedCode) }} />
          {isTyping && <span className="code-cursor">|</span>}
        </pre>
      </div>
    </div>
  )
}

export default CodeBox