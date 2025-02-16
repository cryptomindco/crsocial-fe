import { RichText } from 'app/node_modules/@atproto/api/dist/index'
import { SYSTEM_VALUE } from 'src/consts/common'
const convertMapForCompress = {
  'image/apng': 'image/jpeg',
  'image/avif': 'image/jpeg',
  'image/bmp': 'image/jpeg',
  'image/gif': 'image/jpeg',
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/jpeg',
  'image/svg+xml': 'image/jpeg',
  'image/webp': 'image/jpeg',
}

const cloneObject = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

const safeURL = (url) => {
  try {
    return new URL(url)
  } catch (error) {}
}

const getGraphemeLength = (text) => {
  const richText = new RichText({ text })
  return richText.graphemeLength
}

const unicodeSubstring = (text, start, end) => {
  const regexp = new RegExp(`^.{${start}}(.{0,${end - start}})`, 'u')
  return text.match(regexp)?.[1] ?? ''
}

const parseOGP = async (uri, urlHasImage) => {
  const response = await fetchWithTimeouts(`https://cardyb.bsky.app/v1/extract?url=${uri}`)
  if (!response.ok) {
    return Error('fetch Ogp Error')
  }
  let title = response.title || ''
  let description = response.description || ''
  let imageFetchUrl = response.image || ''

  const titleLength = getGraphemeLength(title)
  if (titleLength > 300) {
    title = unicodeSubstring(title, 0, 300)
  }
  const descriptionLength = getGraphemeLength(description)
  if (descriptionLength > 1000) {
    description = unicodeSubstring(description, 0, 1000)
  }
  const external = {
    uri,
    title,
    description,
    preview: response.image,
  }

  if (urlHasImage && imageFetchUrl) {
    const uploadBlob = await fetch('/pds/upload-images', {
      method: 'POST',
      body: JSON.stringify({ url: imageFetchUrl }),
    })
    if (uploadBlob instanceof Error) {
      return external
    }
    console.log('check upload blob: ', JSON.stringify(uploadBlob))
    external.thumb = uploadBlob
  }

  return external
}

const imageSize = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      }
      URL.revokeObjectURL(img.src)
      resolve(size)
    }
    img.onerror = (error) => {
      reject(error)
    }
    img.src = URL.createObjectURL(file)
  })
}

const fetchWithTimeouts = async (input, init) => {
  const url = typeof input === 'string' ? input : input.href != null ? input.href : input.url
  let timeOut = SYSTEM_VALUE.timeoutDefault
  SYSTEM_VALUE.timeoutDetails.some((detail) => {
    if (url.includes(detail.url)) {
      timeOut = detail.timeout
      return true
    }
    return false
  })
  return await fetch(url, {
    method: 'GET',
  })
}

export { cloneObject, safeURL, parseOGP }
