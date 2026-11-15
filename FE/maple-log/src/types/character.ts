export interface CharacterResponse {
  id: number
  characterName: string
  characterClass: string
  level: number
  world: string
  characterImage: string
  // Lombok @Getter의 boolean isMain → Jackson 직렬화 시 "main"
  main: boolean
  sortOrder: number
}

export interface CharacterRegisterRequest {
  characterName: string
}
