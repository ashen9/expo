export interface NodeInfo {
    id: number,
    name: string,
    info: string,
    quesition: string,
}

export interface QuesitionInfo {
    id: number,
    type: number,
    info: string,
    options: string,//"鲁国|魏国|齐国|赵国"
    answer: string,
    correctId: number,
    stage: number,
    stageName: string,//"B02期货的萌芽"
}