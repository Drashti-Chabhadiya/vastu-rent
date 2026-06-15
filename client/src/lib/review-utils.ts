interface ParsedComment {
  text: string
  images: string[]
  reply: string
}

/**
 * Custom stay duration calculator based on the review submission date.
 * Stay start is 9 days prior, and stay end is 2 days prior to review.
 */
export function formatStayDates(createdAtStr: string): string {
  if (!createdAtStr) return '20 May – 27 May 2024'
  const createdDate = new Date(createdAtStr)
  if (isNaN(createdDate.getTime())) return '20 May – 27 May 2024'

  // Stay start is calculated as 9 days prior to the review submission
  const startDate = new Date(createdDate.getTime())
  startDate.setDate(startDate.getDate() - 9)

  // Stay end is calculated as 2 days prior to the review submission
  const endDate = new Date(createdDate.getTime())
  endDate.setDate(endDate.getDate() - 2)

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const startDay = startDate.getDate().toString()
  const startMonth = months[startDate.getMonth()]

  const endDay = endDate.getDate().toString()
  const endMonth = months[endDate.getMonth()]
  const endYear = endDate.getFullYear()

  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`
}

/**
 * Formats review submission date into "DD Month YYYY" format.
 */
export function formatPostedDate(createdAtStr: string): string {
  if (!createdAtStr) return '29 May 2024'
  const date = new Date(createdAtStr)
  if (isNaN(date.getTime())) return '29 May 2024'

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Parses image links and owner replies out of the raw review comment string.
 */
export function parseCommentImagesAndReply(comment: string): ParsedComment {
  if (!comment) return { text: '', images: [], reply: '' }

  let images: string[] = []
  const imagesMatch = comment.match(/\[Images:\s*([^\]]+)\]/)
  if (imagesMatch) {
    const imagesStr = imagesMatch[1]
    images = imagesStr
      .split(',')
      .map((img: string) => img.trim())
      .filter(Boolean)
  }

  let reply = ''
  const replyMatch = comment.match(/\[Reply:\s*([^\]]+)\]/)
  if (replyMatch) {
    reply = replyMatch[1].trim()
  }

  const text = comment
    .replace(/\[Images:\s*([^\]]+)\]/, '')
    .replace(/\[Reply:\s*([^\]]+)\]/, '')
    .trim()

  return { text, images, reply }
}
