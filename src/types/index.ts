export interface IllustDTO {
  id: number
  title: string
  images: ImageDTO[]
  author: AuthorDTO
}

export interface ImageDTO {
  urls: UrlDTO
  width: number
  height: number
}

export interface UrlDTO {
  small: string
  regular: string
  original: string
}

export interface AuthorDTO {
  name: string
  id: number
}
