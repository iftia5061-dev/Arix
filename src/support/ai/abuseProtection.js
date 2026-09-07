const MAX_QUESTIONS_PER_MINUTE = 10
const SPAM_THRESHOLD = 3 // Same question 3 times
const OFF_TOPIC_THRESHOLD = 2 // 2 off-topic questions

export class AbuseProtection {
  constructor() {
    this.questionHistory = []
    this.offTopicCount = 0
    this.questionCount = 0
    this.lastQuestionTime = 0
  }

  recordQuestion(text, isOffTopic) {
    const now = Date.now()
    const timeSinceLastQuestion = now - this.lastQuestionTime

    // Reset if more than 1 minute since last question
    if (timeSinceLastQuestion > 60000) {
      this.questionCount = 0
      this.questionHistory = []
    }

    this.questionCount++
    this.lastQuestionTime = now

    // Track question history for spam detection
    this.questionHistory.push({
      text: text.toLowerCase().trim(),
      time: now
    })

    // Keep only last 10 questions
    if (this.questionHistory.length > 10) {
      this.questionHistory.shift()
    }

    // Track off-topic questions
    if (isOffTopic) {
      this.offTopicCount++
    }
  }

  isSpamming(text) {
    const lowerText = text.toLowerCase().trim()

    // Check if same question repeated
    const recentQuestions = this.questionHistory.slice(-5)
    const sameQuestionCount = recentQuestions.filter(q => q.text === lowerText).length

    return sameQuestionCount >= SPAM_THRESHOLD
  }

  isRateLimited() {
    const now = Date.now()
    const timeSinceLastQuestion = now - this.lastQuestionTime

    // Check if asking too many questions per minute
    return this.questionCount >= MAX_QUESTIONS_PER_MINUTE && timeSinceLastQuestion < 60000
  }

  isOffTopicAbuse() {
    return this.offTopicCount >= OFF_TOPIC_THRESHOLD
  }

  getRateLimitResponse() {
    return {
      title: 'Rate Limit',
      message: 'You\'re asking questions too quickly. Please slow down or contact our support team directly.',
      type: 'rate-limit'
    }
  }

  getSpamResponse() {
    return {
      title: 'Spam Detected',
      message: 'Please avoid repeating the same question. If you need further assistance, contact our support team.',
      type: 'spam'
    }
  }

  getOffTopicAbuseResponse() {
    return {
      title: 'Off-topic Limit',
      message: 'You\'ve asked too many off-topic questions. Please focus on OROFEX-related topics or contact our support team.',
      type: 'off-topic-abuse'
    }
  }

  reset() {
    this.questionHistory = []
    this.offTopicCount = 0
    this.questionCount = 0
    this.lastQuestionTime = 0
  }
}

export const abuseProtection = new AbuseProtection()
