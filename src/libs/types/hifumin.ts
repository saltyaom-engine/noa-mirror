export interface Hifumin {
    id: number
    title: HifuminTitle
    images: HifuminImage
    info: HifuminInfo
    metadata: HifuminMetadata
    comments?: HifuminCommentResponse
    related?: Hifumin[]
}

export interface HifuminTitle {
    display: string
    english: string
    japanese: string
}

export interface HifuminImage {
    cover: HifuminPage
    thumbnail: HifuminPage
    pages: HifuminPage[]
}

export interface HifuminPage {
    link: string
    info: HifuminPageInfo
}

export interface HifuminPageInfo {
    type: string
    width: number
    height: number
}

export interface HifuminInfo {
    amount: number
    mediaId: number
}

export interface HifuminMetadata {
    parodies: HifuminTag[]
    characters: HifuminTag[]
    groups: HifuminTag[]
    categories: HifuminTag[]
    artists: HifuminTag[]
    tags: HifuminTag[]
    language: string
}

export interface HifuminTag {
    name: string
    count: number
}

export interface HifuminCommentResponse {
    total: number
    data: HifuminComment
}

export interface HifuminComment {
    id: number
    user: HifuminUser
    created: number
    comment: string
}

export interface HifuminUser {
    id: number
    username: string
    slug: string
    avatar: string
}

export interface HifuminResponse {
    success: boolean
    error: string
    data?: Hifumin
}

export interface MultipleHifuminResponse {
    success: boolean
    error: string
    data: Hifumin[]
}
