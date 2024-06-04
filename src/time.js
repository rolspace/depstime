export function getTime(dateTimeString) {
  const date = new Date(dateTimeString)

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date/time string')
  }

  const milliseconds = date.getTime()

  return milliseconds
}
