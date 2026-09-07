const SIMPLE_PATTERNS = [
  /^(what|how|why|when|where|who|which|can|do|does|is|are|will|would|should|could|may|might|could|would)\s+/i,
  /^(tell|show|give|explain|describe|list|provide)\s+/i,
  /\?$/
]

const COMPLEX_PATTERNS = [
  /\b(compare|difference|versus|vs|better|best|recommend|suggest|choose|decide)\b/i,
  /\b(custom|personalized|tailored|specific|particular|unique)\b/i,
  /\b(integration|api|connection|compatible|work with)\b/i,
  /\b(scenario|situation|case|example|instance)\b/i,
  /\b(troubleshoot|fix|resolve|debug|solve)\b/i,
  /\b(implementation|deployment|setup|configuration|installation)\b/i,
  /\b(performance|optimization|speed|efficiency|scalability)\b/i,
  /\b(security|authentication|authorization|encryption|privacy)\b/i,
  /\b(database|storage|backend|frontend|fullstack)\b/i,
  /\b(enterprise|business|commercial|corporate)\b/i
]

export function isComplexQuestion(text) {
  const lowerText = text.toLowerCase().trim()

  // Check if it matches complex patterns
  return COMPLEX_PATTERNS.some(pattern => pattern.test(lowerText))
}

export function isSimpleQuestion(text) {
  const lowerText = text.toLowerCase().trim()

  // Check if it matches simple patterns
  return SIMPLE_PATTERNS.some(pattern => pattern.test(lowerText))
}

export function getComplexityLevel(text) {
  if (isComplexQuestion(text)) {
    return 'complex'
  }
  if (isSimpleQuestion(text)) {
    return 'simple'
  }
  return 'medium'
}

export function shouldUseAI(text) {
  const complexity = getComplexityLevel(text)

  // Only use AI for complex questions
  // Simple and medium questions should use rules
  return complexity === 'complex'
}
