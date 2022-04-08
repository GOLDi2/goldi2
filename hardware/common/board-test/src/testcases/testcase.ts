type TestCaseOutcome = "Success" | "Fail" | "Undefined" | "Skipped" | "Unfulfillable"

export interface TestCaseResult {
    name: string
    outcome: TestCaseOutcome
}

export interface TestCaseData {
    name: string
    description: string
    test: (tc: TestCase) => Promise<void>
    dependencies: Array<TestCase>
    requiresInteraction: boolean
}

export class TestCase {
    name: string
    description: string
    private test: () => Promise<void>
    outcome: TestCaseOutcome
    dependencies: Array<TestCase>
    requiresInteraction: boolean

    constructor(data: TestCaseData) {
        this.name = data.name
        this.description = data.description
        this.dependencies = data.dependencies
        this.test = () => data.test(this)
        this.outcome = "Undefined"
        this.dependencies = data.dependencies
        this.requiresInteraction = data.requiresInteraction
    }

    getResult(): TestCaseResult {
        return {name: this.name, outcome: this.outcome}
    }

    logHeader(): void {
        console.log("Executing Test:", this.name)
        console.log("Description:", this.description)
        console.log("Dependencies:", this.dependencies.map((dep) => dep.name))
    }
    
    logResult(): void {
        console.log("Result:", this.outcome, "\n")
    }

    async run(): Promise<void> {
        this.logHeader()
        await this.test()
        this.logResult()
    }

    skip(): void {
        this.logHeader()
        this.outcome = "Skipped"
        this.logResult()
    }
}