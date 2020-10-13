export interface ACElementConfig {
    name: string
    icon: string
}

export interface AppConfigData {
    extraPrice: number,
    bonus: number,
    acc: ACElementConfig[]
    timezone: string
    lang: string
}

export interface AppConfig {
    id: number
    data: AppConfigData
}