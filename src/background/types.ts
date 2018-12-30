import { ServiceId } from '@/services/types'

export const enum MsgType {
  OpenUrl,
  PinCode,
  IMGs,
  ExtractorReady
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
  service: ServiceId
  /** PIN code */
  code: string
}

export interface MsgIMGs extends Message {
  type: MsgType.IMGs
  col: { [index: string]: number }
}
