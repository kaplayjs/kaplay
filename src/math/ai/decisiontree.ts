import { rand } from "../math";

type Predicate = (value: any) => boolean;

export class DecisionNode {
    attribute: string;
    children: DecisionNode[] = [];
    totalWeight = 0;
    constructor(attribute: string) {
        this.attribute = attribute;
    }

    addValueNode(value: any, attribute: string): DecisionNode {
        const node = new ValueDecisionNode(value, attribute);
        this.children.push(node);
        return node;
    }

    addPredicateNode(predicate: Predicate, attribute: string): DecisionNode {
        const node = new PredicateDecisionNode(predicate, attribute);
        this.children.push(node);
        return node;
    }

    addWeightNode(weight: any, attribute: string): DecisionNode {
        if (weight === 0) {
            throw Error("Weight nodes cannot have 0 probability");
        }
        if (this.children.length > 0 && this.totalWeight == 0) {
            throw Error("Weight nodes cannot be mixed with other nodes");
        }
        const node = new WeightDecisionNode(weight, attribute);
        this.children.push(node);
        this.totalWeight += weight;
        return node;
    }

    evaluate(answers: any): string {
        if (this.children.length === 0) {
            return this.attribute;
        }
        else {
            // We need to pick a random node
            if (this.totalWeight) {
                const dice = rand(this.totalWeight);
                let sum = 0;
                for (const node of this.children) {
                    sum += (node as WeightDecisionNode).weight;
                    if (dice < sum) {
                        return node.evaluate(answers);
                    }
                }
            }
            // We need to evaluate until a node asserts true
            else {
                const value = answers[this.attribute];
                for (const node of this.children) {
                    if (node.assert(value)) {
                        return node.evaluate(answers);
                    }
                }
            }
        }
        throw new Error("Invalid decision tree");
    }

    assert(value: any): boolean {
        return false;
    }
}

class ValueDecisionNode extends DecisionNode {
    value: any;

    constructor(value: any, attribute: string) {
        super(attribute);
        this.value = value;
    }

    assert(value: any): boolean {
        return this.value == value;
    }
}

class PredicateDecisionNode extends DecisionNode {
    predicate: Predicate;

    constructor(predicate: Predicate, attribute: string) {
        super(attribute);
        this.predicate = predicate;
    }

    assert(value: any): boolean {
        return this.predicate(value);
    }
}

class WeightDecisionNode extends DecisionNode {
    weight: number;

    constructor(weight: number, attribute: string) {
        super(attribute);
        this.weight = weight;
    }

    assert(value: any): boolean {
        return false;
    }
}

function sum(values: number[]) {
    return values.reduce((sum, v) => sum + v, 0);
}

function distinct(values: any[]) {
    return [...new Set(values)];
}

function entropy(outcomes: boolean[]) {
    let positive = 0;
    for (const outcome of outcomes) {
        if (outcome) {
            positive++;
        }
    }
    const negative = (outcomes.length - positive) / outcomes.length;
    positive = positive / outcomes.length;
    return -(positive * (positive ? Math.log2(positive) : 0) + negative * (negative ? Math.log2(negative) : 0));
}

function gain(values: any[], outcomes: boolean[]) {
    const splitByAttribute: Record<string, boolean[]> = {};
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value in splitByAttribute) {
            splitByAttribute[value].push(outcomes[i]);
        }
        else {
            splitByAttribute[value] = [outcomes[i]];
        }
    }
    return entropy(outcomes)
        - sum(
            Object.values(splitByAttribute).map(o =>
                entropy(o) * o.length / outcomes.length
            ),
        );
}

export class DecisionTree {
    root: DecisionNode;

    constructor(attribute: string) {
        this.root = new DecisionNode(attribute);
    }

    evaluate(answers: any): string {
        return this.root.evaluate(answers);
    }

    /**
     * Computes a decision tree from example data
     * @param data Example data, a list of columns, where each column contains values for an attribute in attributes.
     * @param attributes The names of the columns.
     * @param outcomes The outcomes for each row.
     */
    static learnFromExamples(
        data: any[][],
        attributes: string[],
        outcomes: boolean[],
    ) {
        function indexOfAttributeToSplitOn(
            data: any[][],
            attributes: string[],
            outcomes: boolean[],
        ) {
            const gains = attributes.map((_, index) =>
                gain(data[index], outcomes)
            );
            const maxGain = Math.max(...gains);
            const index = gains.indexOf(maxGain);
            return index;
        }
        function createBranches(
            node: DecisionNode,
            data: any[][],
            attributes: string[],
            outcomes: boolean[],
            index: number,
        ) {
            const attributeColumn = data[index];
            const values = distinct(attributeColumn);
            // Remove the attribute column
            const a = attributes.filter((_, i) => i != index);
            data = data.filter((_, i) => i != index);
            // Create a branch for each possible value of the attribute
            for (const value of values) {
                // Only filter the outcome for now, if the entropy is small, we will create a leaf
                const o = outcomes.filter((_, index) =>
                    attributeColumn[index] === value
                );
                const e = entropy(o);
                if (e === 0) { // Or very small
                    // Leaf
                    node.addValueNode(value, o[0] ? "true" : "false");
                }
                else {
                    // Branch
                    const d = data.map(column =>
                        column.filter((_, index) =>
                            attributeColumn[index] === value
                        )
                    );
                    // Split on the attribute with the most information gain
                    const index = indexOfAttributeToSplitOn(
                        d,
                        a,
                        o,
                    );
                    const attribute = attributes[index];
                    const n = node.addValueNode(value, attribute);
                    createBranches(n, d, a, o, index);
                }
            }
        }
        // Split on the attribute with the most information gain
        const index = indexOfAttributeToSplitOn(data, attributes, outcomes);
        const attribute = attributes[index];
        const tree = new DecisionTree(attribute);
        createBranches(tree.root, data, attributes, outcomes, index);
        return tree;
    }
}
