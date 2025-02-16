const MDateFormat = 'YYYY-MM-DD'
const MDateFormat1 = 'MM/DD/YYYY'
const MDateFormat2 = 'YYYY-MM-DD HH:mm:ss'

export { MDateFormat, MDateFormat1, MDateFormat2 }
export const DESTINATION_CHECK_NONE = 0
export const DESTINATION_CHECK_CHECKING = 1
export const DESTINATION_CHECK_FAIL = 2
export const DESTINATION_CHECK_DONE = 3
export const SYSTEM_VALUE = {
  timeoutDefault: 15000,
  timeoutDetails: [
    {
      url: 'app.bsky.video.uploadVideo',
      timeout: 600000,
    },
    {
      url: 'com.atproto.repo.uploadBlob',
      timeout: 150000,
    },
    {
      url: 'com.atproto.sync.getBlob',
      timeout: 150000,
    },
  ],
}
