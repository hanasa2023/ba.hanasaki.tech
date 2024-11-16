export interface IllustDTO {
  id: number
  title: string
  author: string
  authorId: number
  tags: string
  imgUrl: string
  aiType: number
  restrict: string
}

export interface Illust {
  pid: number
  uid: number
  author: string
  title: string
  tags: string[]
  imageUrl: string
  aiType: boolean
  restrict: string
}

export interface IRequest {
  num: number
  tags: string[]
  isAI: boolean
  restrict: string
}
export interface IllustDetails {
  id: string
  title: string
  url_big: string
  tags: string[]
  restrict: string
  x_restrict: string
  ai_type: number
  author_details: AuthorDetailsDTO
  bookmark_user_total: number
}

export interface AuthorDetailsDTO {
  user_id: string
  user_name: string
}
