export interface FaultyTest {
    fpgaPin: string
    expected: string
    faults: {
        fpgaPin: string
        expected: string
        received: string
    }[]
}

export interface IOBoardTestLabel {
    fpgaPin: string
    expected: string
    color?: string
}

export interface MCBoardTestLabel {
    fpgaPin: string
    expected: string
}
