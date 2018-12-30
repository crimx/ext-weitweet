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
  const { tab, isNew } = await openUrl({
    url: browser.extension.getURL(
      `editor.html` +
        `?title=${encodeURIComponent(sourceTab.title || '')}` +
        `&url=${encodeURIComponent(sourceTab.url || '')}`
    )
  })
  if (isNew && tab && tab.id) {
    await setEditorTabId(tab.id)
  }
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
}): Promise<{ tab: browser.tabs.Tab; isNew: boolean }> {
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
    return { tab: tabs[0], isNew: false }
  } else {
    return { tab: await browser.tabs.create({ url }), isNew: true }
  }
}

function setEditorTabId (editorTabId: number) {
  return browser.storage.local.set({ editorTabId })
}

async function getEditorTabId (): Promise<number> {
  return (await browser.storage.local.get<{ editorTabId: number }>(
    'editorTabId'
  )).editorTabId
}
