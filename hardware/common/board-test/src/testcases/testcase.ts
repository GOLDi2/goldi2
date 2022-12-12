type TestCaseOutcome = 'Success' | 'Fail' | 'Undefined' | 'Skipped' | 'Unfulfillable'

export interface TestCaseResult {
    name: string
    outcome: TestCaseOutcome
}

export interface TestCaseData {
    name: string
    description: string
    test: (tc: TestCase) => Promise<void>
    requiresInteraction: boolean
}

export class TestCase {
    name: string
    description: string
    private test: () => Promise<void>
    outcome: TestCaseOutcome
    requiresInteraction: boolean
    enabled: boolean

    constructor(data: TestCaseData) {
        this.name = data.name
        this.description = data.description
        this.test = () => data.test(this)
        this.outcome = 'Undefined'
        this.requiresInteraction = data.requiresInteraction
        this.enabled = true
    }

    getResult(): TestCaseResult {
        return { name: this.name, outcome: this.outcome }
    }

    logHeader(): void {
        console.log('Executing Test:', this.name)
        console.log('Description:', this.description)
    }

    logResult(): void {
        console.log('Result:', this.outcome, '\n')
    }

    async run(): Promise<void> {
        this.logHeader()
        await this.test()
        this.logResult()
    }

    skip(): void {
        this.logHeader()
        this.outcome = 'Skipped'
        this.logResult()
    }
}
