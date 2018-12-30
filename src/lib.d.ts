interface GotOptions<E extends string | null> {
  baseUrl?: string
  cookieJar?: CookieJar
  encoding?: E
  query?: string | object
  timeout?: number | TimeoutOptions
  retry?: number | RetryOptions
  followRedirect?: boolean
  decompress?: boolean
  useElectronNet?: boolean
  throwHttpErrors?: boolean
  agent?: http.Agent | boolean | AgentOptions
  cache?: Cache
}

interface ProbeResult {
  width: number
  height: number
  /** byte length of the file (if available, HTTP only) */
  length: number
  /** image 'type' (usual file name extention) */
  type: string
  /** mime type */
  mime: string
  /** width units type ('px' by default, can be different for SVG) */
  wUnits: string
  /** height units type ('px' by default, can be different for SVG) */
  hUnits: string
  /** last url for the image in chain of redirects (if no redirects, same as src) (HTTP only) */
  url: string
}

interface ProbeError {
  code: string
  status: number
}

declare module 'probe-image-size' {
  interface Probe {
    (
      src: string,
      options?: GotOptions,
      callback?: (err: null | ProbeError, res: ProbeResult) => any
    ): Promise<ProbeResult>

    sync(binary: Uint8Array): Promise<ProbeResult>
  }

  const probe: Probe

  export default probe
}
