export const enum MsgType {
  OpenUrl,
  PinCode
}

export interface Message {
  type: MsgType
}

export interface MsgOpenUrl extends Message {
  type: MsgType.OpenUrl
  url: string
  /** extension inner url */
  self?: boolean
}

export interface MsgPinCode extends Message {
  type: MsgType.PinCode
  service: 'twitter' | 'fanfou'
  /** PIN code */
  code: string
}
