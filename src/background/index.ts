import { MsgType, Message, MsgOpenUrl } from '@/background/types'

browser.runtime.onMessage.addListener(
  async (data: Partial<Message>, sender: browser.runtime.MessageSender) => {
    switch (data.type) {
      case MsgType.OpenUrl:
        return openUrl(data as MsgOpenUrl)
      default:
        break
    }
  }
)

browser.browserAction.onClicked.addListener(async sourceTab => {
  await openUrl({
    url: browser.extension.getURL(
      `editor.html` +
        `?title=${encodeURIComponent(sourceTab.title || '')}` +
        `&url=${encodeURIComponent(sourceTab.url || '')}` +
        `&id=${encodeURIComponent(
          sourceTab.id != null ? String(sourceTab.id) : ''
        )}`
    )
  })
})

/**
 * Open a url on new tab or highlight a existing tab if already opened
 */
async function openUrl ({
  url,
  self
}: {
url: string
self?: boolean
}): Promise<browser.tabs.Tab> {
  if (self) {
    url = browser.runtime.getURL(url)
  }
  const tabs = await browser.tabs.query({ url })
  if (tabs.length > 0) {
    const { index, windowId } = tabs[0]
    await browser.windows.update(windowId, { focused: true })
    // Only Chrome supports tab.highlight for now
    const highlight = (browser.tabs as any)['highlight']
    if (highlight) {
      await highlight({ tabs: index, windowId })
    }
    return tabs[0]
  } else {
    return browser.tabs.create({ url })
  }
}
