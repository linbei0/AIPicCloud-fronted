const COS_HOST = 'aipiccloud-1322104192.cos.ap-shanghai.myqcloud.com'
const CROP_PROXY_PREFIX = '/_image_proxy'

/**
 * 裁剪场景下，生产环境通过同域代理加载 COS 图片，避免跨域图片进入 canvas 后无法正常编辑。
 */
export const getCropperImageUrl = (url?: string) => {
  if (!url || !import.meta.env.PROD) {
    return url
  }

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname !== COS_HOST) {
      return url
    }
    return `${CROP_PROXY_PREFIX}${parsedUrl.pathname}${parsedUrl.search}`
  } catch {
    return url
  }
}
