type Predicate = (system: RuleSystem) => boolean;
type Action = (system: RuleSystem) => void;

export class Rule {
    predicate: Predicate;
    salience;
    constructor(predicate: Predicate, salience: number) {
        this.predicate = predicate;
        this.salience = salience;
    }

    evaluate(system: RuleSystem): boolean {
        return this.predicate(system);
    }

    execute(system: RuleSystem): void {
    }
}

class ActionRule extends Rule {
    action;
    constructor(predicate: Predicate, action: Action, salience: number) {
        super(predicate, salience);
        this.action = action;
    }

    execute(system: RuleSystem): void {
        this.action(system);
    }
}

class AssertRule extends Rule {
    fact;
    grade;
    constructor(
        predicate: Predicate,
        fact: string,
        grade: number,
        salience: number,
    ) {
        super(predicate, salience);
        this.fact = fact;
        this.grade = grade;
    }

    execute(system: RuleSystem): void {
        system.assertFact(this.fact, this.grade);
    }
}

class RetractRule extends Rule {
    fact;
    grade;
    constructor(
        predicate: Predicate,
        fact: string,
        grade: number,
        salience: number,
    ) {
        super(predicate, salience);
        this.fact = fact;
        this.grade = grade;
    }

    execute(system: RuleSystem) {
        system.retractFact(this.fact, this.grade);
    }
}

export class RuleSystem {
    // Rules to evaluate and execute
    agenda: Rule[] = [];
    // Game state
    state: any = {};
    // Asserted facts
    facts: Map<string, number> = new Map<string, number>();

    constructor() {
    }

    /**
     * Adds a rule which runs an action if its predicate evaluates to true.
     * @param predicate - Predicate to evaluate. A function taking the system as parameter.
     * @param action - Action to execute. A function taking the system as parameter.
     * @param salience - Priority of the rule.
     */
    addRuleExecutingAction(
        predicate: Predicate,
        action: Action,
        salience: number = 0,
    ) {
        this.addRule(new ActionRule(predicate, action, salience));
    }

    /**
     * Add a rule which asserts a fact if its predicate evaluates to true.
     * @param predicate - Predicate to evaluate. A function taking the system as parameter.
     * @param fact - The fact to assert.
     * @param grade - The optional grade to use when asserting the fact.
     * @param salience - Priority of the rule.
     */
    addRuleAssertingFact(
        predicate: Predicate,
        fact: string,
        grade: number = 1,
        salience: number = 0,
    ) {
        this.addRule(new AssertRule(predicate, fact, grade, salience));
    }

    /**
     * Add a rule which retracts a fact if its predicate evaluates to true.
     * @param predicate - Predicate to evaluate. A function taking the system as parameter.
     * @param fact - The fact to retract.
     * @param grade - The optional grade to use when retracting the fact.
     * @param salience - Priority of the rule.
     */
    addRuleRetractingFact(
        predicate: Predicate,
        fact: string,
        grade: number = 1,
        salience: number = 0,
    ) {
        this.addRule(new RetractRule(predicate, fact, grade, salience));
    }

    /**
     * Add a custom rule.
     * @param rule - The rule to add.
     */
    addRule(rule: Rule) {
        this.agenda.push(rule);
    }

    /**
     * Removes all rules.
     */
    removeAllRules() {
        this.agenda.length = 0;
    }

    /**
     * Executes all rules for which the predicate evaluates to true.
     */
    execute() {
        this.agenda.sort((a, b) => a.salience - b.salience);
        for (const rule of this.agenda) {
            if (rule.evaluate(this)) {
                rule.execute(this);
            }
        }
    }

    /**
     * Asserts a fact.
     * @param fact - The fact to assert.
     * @param grade - The optional grade to use.
     */
    assertFact(fact: string, grade: number = 1) {
        this.facts.set(fact, Math.min(1, this.gradeForFact(fact) + grade));
    }

    /**
     * Retracts a fact.
     * @param fact - The fact to retract.
     * @param grade - The optional grade to use.
     */
    retractFact(fact: string, grade: number = 1) {
        this.facts.set(fact, Math.max(0, this.gradeForFact(fact) - grade));
    }

    /**
     * Returns the grade for the specified fact.
     * @param fact - The fact to obtain the grade from.
     *
     * @returns The grade for the fact.
     */
    gradeForFact(fact: string) {
        return this.facts.get(fact) || 0;
    }

    /**
     * Returns the minimum grade for the specified facts.
     * @param facts - The facts to obtain the minimum grade from.
     *
     * @returns The minimum grade for the facts.
     */
    minimumGradeForFacts(...facts: string[]) {
        return Math.min(...facts.map(fact => this.gradeForFact(fact)));
    }

    /**
     * Returns the maximum grade for the specified facts.
     * @param facts - The facts to obtain the maximum grade from.
     *
     * @returns The maximum grade for the facts.
     */
    maximumGradeForFacts(...facts: string[]) {
        return Math.max(...facts.map(fact => this.gradeForFact(fact)));
    }

    /**
     * Resets the facts.
     */
    reset() {
        this.facts.clear();
    }
}
