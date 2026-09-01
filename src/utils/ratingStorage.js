const RATING_KEY = 'orofex_has_rated'

export function hasAlreadyRated() {
  return localStorage.getItem(RATING_KEY) === 'true'
}

export function markAsRated() {
  localStorage.setItem(RATING_KEY, 'true')
}