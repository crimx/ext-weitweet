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
  const editorTab = await browser.tabs.create({
    url: browser.extension.getURL(
      `editor.html` +
        `?title=${encodeURIComponent(sourceTab.title || '')}` +
        `&url=${encodeURIComponent(sourceTab.url || '')}`
    )
  })
  if (editorTab && editorTab.id) {
    await setEditorTabId(editorTab.id)
  }
})

/**
 * Open a url on new tab or highlight a existing tab if already opened
 */
async function openUrl ({ url, self }: MsgOpenUrl): Promise<void> {
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
  } else {
    await browser.tabs.create({ url })
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
